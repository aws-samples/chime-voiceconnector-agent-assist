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
var qlobber_1 = require("qlobber");
var abstract_listener_1 = require("./abstract-listener");
var util_1 = require("./util");
var TrieListener = /** @class */ (function (_super) {
    __extends(TrieListener, _super);
    function TrieListener(settings) {
        if (settings === void 0) { settings = {}; }
        var _this = _super.call(this, settings) || this;
        _this.matcher = new qlobber_1.Qlobber({
            separator: settings.separator || '/',
            wildcard_one: settings.wildcardOne || '+',
            wildcard_some: settings.wildcardSome || '*',
        });
        _this.emit('ready');
        return _this;
    }
    TrieListener.prototype.subscribe = function (topic, callback, done) {
        this._raiseIfClosed();
        this.matcher.add(topic, callback);
        util_1.defer(done);
    };
    TrieListener.prototype.publish = function (topic, message, options, done) {
        if (done === void 0) { done = function () { }; }
        this._raiseIfClosed();
        var cbs = this.matcher.match(topic);
        for (var i = 0; i < cbs.length; i++) {
            cbs[i](topic, message, options);
        }
        util_1.defer(done);
    };
    TrieListener.prototype.unsubscribe = function (topic, callback, done) {
        if (done === void 0) { done = function () { }; }
        this._raiseIfClosed();
        this.matcher.remove(topic, callback);
        util_1.defer(done);
    };
    TrieListener.prototype.close = function (done) {
        if (done === void 0) { done = function () { }; }
        this.matcher.clear();
        this.emit('closed');
        util_1.defer(done);
    };
    return TrieListener;
}(abstract_listener_1.AbstractListener));
exports.TrieListener = TrieListener;
//# sourceMappingURL=trie-listener.js.map