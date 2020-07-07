"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get a value at the path in the object.
 * @param obj The object to look in.
 * @param path The path.
 */
function getIn(obj, path) {
    var val = obj;
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var elem = path_1[_i];
        if (val[elem]) {
            val = val[elem];
        }
        else {
            return null;
        }
    }
    return val;
}
exports.default = getIn;
//# sourceMappingURL=getIn.js.map