"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = __importDefault(require("uuid"));
var retimer_1 = __importDefault(require("retimer"));
var steed_1 = __importDefault(require("steed"));
var Client = /** @class */ (function () {
    function Client(connection, server) {
        this.connection = connection;
        this.server = server;
        this.subscriptions = {};
        this.nextId = 1;
        this.inflight = {};
        this.inflightCounter = 0;
        this.keepAlive = 0;
        this._lastDedupId = -1;
        this._closed = false;
        this._closing = false;
        this.logger = server.logger;
        this.setup();
    }
    Client.prototype.setup = function () {
        var _this = this;
        var connection = this.connection;
        connection.on('error', function () { });
        var completeConnection = function () {
            _this.setupTimer();
            connection.connack({
                returnCode: 0,
                // maybe session_present is null, custom old persistence engine
                // or not persistence defined
                sessionPresent: false,
            });
            _this.logger.info('client connected');
            _this.server.emit('clientConnected', _this);
            connection.on('puback', function (packet) {
                _this.setupTimer();
                _this.handlePubAck(packet);
            });
            connection.on('pingreq', function () {
                _this.logger.debug('pingreq');
                _this.setupTimer();
                _this.handlePingReq();
                _this.connection.pingresp();
            });
            connection.on('subscribe', function (packet) {
                _this.setupTimer();
                _this.handleSubscribe(packet);
            });
            connection.on('publish', function (packet) {
                _this.setupTimer();
                _this.handlePublish(packet);
            });
            connection.on('unsubscribe', function (packet) {
                _this.setupTimer();
                _this.logger.info({ packet: packet }, 'unsubscribe received');
                steed_1.default().map(_this, packet.unsubscriptions, _this.unsubscribeMapTo, function (err) {
                    if (err) {
                        _this.logger.warn(err);
                        _this.close(null, err.message);
                        return;
                    }
                    connection.unsuback({
                        messageId: packet.messageId,
                    });
                });
            });
            connection.on('disconnect', function () {
                _this.logger.debug('disconnect requested');
                _this.close(null, 'disconnect request');
            });
            connection.on('error', _this.handleError.bind(_this));
            connection.removeListener('error', function () { });
            connection.on('close', function () {
                _this.onNonDisconnectClose('close');
            });
        };
        connection.once('connect', function (packet) {
            _this.handleConnect(packet, completeConnection);
        });
    };
    Client.prototype.handleError = function (err) {
        this.server.emit('clientError', err, this);
        this.onNonDisconnectClose(err.message);
    };
    Client.prototype.setupTimer = function () {
        var _this = this;
        if (this.keepAlive <= 0) {
            return;
        }
        var timeout = (this.keepAlive * 1000 * 3) / 2;
        this.logger.debug({ timeout: timeout }, 'setting keepAlive timeout');
        if (this.timer) {
            this.timer.reschedule(timeout);
        }
        else {
            this.timer = retimer_1.default(function () {
                _this.logger.info('keepAlive timeout');
                _this.onNonDisconnectClose('keepAlive timeout');
            }, timeout);
        }
    };
    Client.prototype.doForward = function (err, packet) {
        if (err) {
            return this.connection && this.connection.emit('error', err);
        }
        this.connection.publish(packet);
        if (packet.qos === 1) {
            this.inflight[packet.messageId] = packet;
        }
    };
    Client.prototype.forward = function (topic, payload, options, subTopic, qos, cb) {
        if (options._dedupId <= this._lastDedupId) {
            return;
        }
        this.logger.trace({ topic: topic }, 'delivering message');
        var indexWildcard = subTopic.indexOf('#');
        var indexPlus = subTopic.indexOf('+');
        var forward = true;
        var newId = this.nextId++;
        // Make sure 'nextId' always fits in a uint16 (http://git.io/vmgKI).
        this.nextId %= 65536;
        var packet = {
            topic: topic,
            payload: payload,
            qos: qos,
            messageId: newId,
        };
        if (qos) {
            this.inflightCounter++;
        }
        if (this._closed || this._closing) {
            this.logger.debug({ packet: packet }, 'trying to send a packet to a disconnected client');
            forward = false;
        }
        else if (this.inflightCounter >= this.server.options.maxInflightMessages) {
            this.logger.warn('too many inflight packets, closing');
            this.close(null, 'too many inflight packets');
            forward = false;
        }
        if (cb) {
            cb();
        }
        // skip delivery of messages in $SYS for wildcards
        forward = forward && !(topic.indexOf('$SYS') >= 0 && ((indexWildcard >= 0 && indexWildcard < 2) || (indexPlus >= 0 && indexPlus < 2)));
        if (forward) {
            if (options._dedupId === undefined) {
                options._dedupId = this.server.nextDedupId();
                this._lastDedupId = options._dedupId;
            }
            if (qos && options.messageId) {
                this.server.updateOfflinePacket(this, options.messageId, packet, this.doForward);
            }
            else {
                this.doForward(null, packet);
            }
        }
    };
    Client.prototype.unsubscribeMapTo = function (topic, cb) {
        var _this = this;
        var sub = this.subscriptions[topic];
        if (!sub || !sub.handler) {
            this.server.emit('unsubscribed', topic, this);
            return cb();
        }
        this.server.listener.unsubscribe(topic, sub.handler, function (err) {
            if (err) {
                cb(err);
                return;
            }
            if (!_this._closing || _this.clean) {
                delete _this.subscriptions[topic];
                _this.logger.info({ topic: topic }, 'unsubscribed');
                _this.server.emit('unsubscribed', topic, _this);
            }
            cb();
        });
    };
    Client.prototype.handleConnect = function (packet, completeConnection) {
        var client = this.connection;
        this.id = packet.clientId;
        this.logger = this.logger.child({ client: this });
        // for MQTT 3.1.1 (protocolVersion == 4) it is valid to receive an empty
        // clientId if cleanSession is set to 1. In this case, Mosca should generate
        // a random ID.
        // Otherwise, the connection should be rejected.
        if (!this.id) {
            if (packet.protocolVersion == 4 && packet.clean) {
                this.id = uuid_1.default();
            }
            else {
                this.logger.info('identifier rejected');
                client.connack({
                    returnCode: 2,
                });
                client.stream.end();
                return;
            }
        }
        this.keepAlive = packet.keepalive;
        this.will = packet.will;
        this.clean = packet.clean;
        if (this.id in this.server.clients) {
            this.server.clients[this.id].close(completeConnection, 'new connection request');
        }
        else {
            completeConnection();
        }
    };
    Client.prototype.handlePingReq = function () {
        this.server.emit('pingReq', this);
    };
    Client.prototype.handlePubAck = function (packet) {
        var logger = this.logger;
        logger.debug({ packet: packet }, 'pubAck');
        if (this.inflight[packet.messageId]) {
            this.server.emit('delivered', this.inflight[packet.messageId], this);
            this.inflightCounter--;
            delete this.inflight[packet.messageId];
        }
        else {
            logger.info({ packet: packet }, 'no matching packet');
        }
    };
    Client.prototype.doSubscribe = function (s, cb) {
        var _this = this;
        var handler = function (topic, payload, options) {
            _this.forward(topic, payload, options, s.topic, s.qos);
        };
        if (this.subscriptions[s.topic] === undefined) {
            this.subscriptions[s.topic] = { qos: s.qos, handler: handler };
            this.server.listener.subscribe(s.topic, handler, function (err) {
                if (err) {
                    delete _this.subscriptions[s.topic];
                    cb(err);
                    return;
                }
                _this.logger.info({ topic: s.topic, qos: s.qos }, 'subscribed to topic');
                _this.subscriptions[s.topic] = { qos: s.qos, handler: handler };
                cb(null, true);
            });
        }
        else {
            cb(null, true);
        }
    };
    Client.prototype.handleEachSub = function (s, cb) {
        if (this.subscriptions[s.topic] === undefined) {
            this.doSubscribe(s, cb);
        }
        else {
            cb(null, true);
        }
    };
    Client.prototype.handleSubscribe = function (packet) {
        var _this = this;
        var logger = this.logger;
        logger.debug({ packet: packet }, 'subscribe received');
        var granted = Client.calculateGranted(this, packet);
        steed_1.default().map(this, packet.subscriptions, this.handleEachSub, function (err, authorized) {
            if (err) {
                _this.close(null, err.message);
                return;
            }
            packet.subscriptions.forEach(function (sub, index) {
                if (authorized[index]) {
                    _this.server.emit('subscribed', sub.topic, _this);
                }
                else {
                    granted[index] = 0x80;
                }
            });
            if (!_this._closed) {
                _this.connection.suback({
                    messageId: packet.messageId,
                    granted: granted,
                });
            }
        });
    };
    Client.prototype.handlePublish = function (packet) {
        var _this = this;
        // Mosca does not support QoS2
        // if onQoS2publish === 'dropToQoS1', don't just ignore QoS2 message, puback it
        // by converting internally to qos 1.
        // this fools mqtt.js into not holding all messages forever
        // if onQoS2publish === 'disconnect', then break the client connection if QoS2
        if (packet.qos === 2) {
            switch (this.server.onQoS2publish) {
                case 'dropToQoS1':
                    packet.qos = 1;
                    break;
                case 'disconnect':
                    if (!this._closed && !this._closing) {
                        this.close(null, 'qos2 caused disconnect');
                    }
                    return;
                default:
                    break;
            }
        }
        var doPubAck = function () {
            if (packet.qos === 1 && !(_this._closed || _this._closing)) {
                _this.connection.puback({
                    messageId: packet.messageId,
                });
            }
        };
        doPubAck();
    };
    Client.prototype.onNonDisconnectClose = function (reason) {
        var _this = this;
        var logger = this.logger;
        var will = this.will;
        if (this._closed || this._closing) {
            return;
        }
        if (this.will) {
            logger.info({ packet: will }, 'delivering last will');
            setImmediate(function () {
                _this.handlePublish(will);
            });
        }
        this.close(null, reason);
    };
    Client.prototype.close = function (callback, reason) {
        var _this = this;
        callback = callback || (function () { });
        if (this._closed || this._closing) {
            return callback();
        }
        if (this.id) {
            this.logger.debug('closing client, reason: ' + reason);
            if (this.timer) {
                this.timer.clear();
            }
        }
        var cleanup = function () {
            _this._closed = true;
            _this.logger.info('closed');
            _this.connection.removeAllListeners();
            // ignore all errors after disconnection
            _this.connection.on('error', function () { });
            _this.server.emit('clientDisconnected', _this, reason);
            callback();
        };
        this._closing = true;
        steed_1.default.map(this, Object.keys(this.subscriptions), this.unsubscribeMapTo, function (err) {
            if (err) {
                _this.logger.info(err);
            }
            // needed in case of errors
            if (!_this._closed) {
                cleanup();
                // prefer destroy[Soon]() to prevent FIN_WAIT zombie connections
                if (_this.connection.stream.destroySoon) {
                    _this.connection.stream.destroySoon();
                }
                else if (_this.connection.stream.destroy) {
                    _this.connection.stream.destroy();
                }
                else {
                    _this.connection.stream.end();
                }
            }
        });
    };
    Client.calculateGranted = function (client, packet) {
        return packet.subscriptions.map(function (e) {
            if (e.qos === 2) {
                e.qos = 1;
            }
            if (client.subscriptions[e.topic] !== undefined) {
                client.subscriptions[e.topic].qos = e.qos;
            }
            return e.qos;
        });
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=client.js.map