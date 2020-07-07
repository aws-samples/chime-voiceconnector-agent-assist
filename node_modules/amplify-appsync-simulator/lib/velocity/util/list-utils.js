"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUtils = {
    copyAndRetainAll: function (list, intersect) {
        return list.filter(function (value) { return intersect.indexOf(value) !== -1; });
    },
    copyAndRemoveAll: function (list, toRemove) {
        return list.filter(function (value) { return toRemove.indexOf(value) === -1; });
    },
};
//# sourceMappingURL=list-utils.js.map