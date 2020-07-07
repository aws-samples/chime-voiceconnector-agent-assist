"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
function blankTemplate(def) {
    if (def === void 0) { def = {}; }
    return __assign({ AWSTemplateFormatVersion: '2010-09-09', Description: 'description', Metadata: {}, Parameters: {}, Resources: {}, Outputs: {}, Mappings: {} }, def);
}
exports.default = blankTemplate;
//# sourceMappingURL=blankTemplate.js.map