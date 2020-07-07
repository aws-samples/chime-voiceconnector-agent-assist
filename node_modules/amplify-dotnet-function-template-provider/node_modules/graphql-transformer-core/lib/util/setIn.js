"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Deeply set a value in an object.
 * @param obj The object to look in.
 * @param path The path.
 */
function setIn(obj, path, value) {
    var val = obj;
    for (var i = 0; i < path.length; i++) {
        var key = path[i];
        if (val[key] && i === path.length - 1) {
            val[key] = value;
        }
        else if (val[key]) {
            val = val[key];
        }
    }
}
exports.default = setIn;
//# sourceMappingURL=setIn.js.map