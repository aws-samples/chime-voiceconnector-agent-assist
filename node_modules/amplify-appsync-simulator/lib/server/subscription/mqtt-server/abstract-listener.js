"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var AbstractListener = /** @class */ (function (_super) {
    __extends(AbstractListener, _super);
    function AbstractListener(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this) || this;
        _this.settings = settings;
        _this._ready = false;
        _this._closed = false;
        _this._ready = false;
        _this._closed = false;
        _this.on('ready', function () {
            _this._ready = true;
        });
        _this.on('closed', function () {
            _this._closed = true;
        });
        _this.on('newListener', function (event, listener) {
            if (event === 'ready' && _this._ready) {
                listener();
            }
        });
        _this.setMaxListeners(0);
        return _this;
    }
    AbstractListener.prototype._raiseIfClosed = function () {
        if (this._closed) {
            throw new Error('This MQTT listener is closed');
        }
    };
    return AbstractListener;
}(events_1.EventEmitter));
exports.AbstractListener = AbstractListener;
//# sourceMappingURL=abstract-listener.js.map