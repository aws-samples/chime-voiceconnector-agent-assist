"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a map where the key is the logical id of the resource and the
 * value is a list locations where that resource is referenced.
 * @param template The template
 */
function getTemplateReferences(template) {
    return walk(template, []);
}
exports.getTemplateReferences = getTemplateReferences;
function walk(node, path) {
    var _a, _b;
    var jsonNode = node && typeof node.toJSON === 'function' ? node.toJSON() : node;
    if (Array.isArray(jsonNode)) {
        var refsFromAllKeys = {};
        for (var i = 0; i < jsonNode.length; i++) {
            var n = jsonNode[i];
            var refsForKey = walk(n, path.concat("" + i));
            refsFromAllKeys = mergeReferenceMaps(refsFromAllKeys, refsForKey);
        }
        return refsFromAllKeys;
    }
    else if (typeof jsonNode === 'object') {
        // tslint:disable-next-line
        var refValue = jsonNode['Ref'];
        var getAtt = jsonNode['Fn::GetAtt'];
        if (refValue) {
            return _a = {},
                _a[refValue] = [path],
                _a;
        }
        else if (getAtt) {
            return _b = {},
                _b[getAtt[0]] = [path],
                _b;
        }
        var refsFromAllKeys = {};
        for (var _i = 0, _c = Object.keys(jsonNode); _i < _c.length; _i++) {
            var key = _c[_i];
            var refsForKey = walk(jsonNode[key], path.concat(key));
            refsFromAllKeys = mergeReferenceMaps(refsFromAllKeys, refsForKey);
        }
        return refsFromAllKeys;
    }
    else {
        return {};
    }
}
function mergeReferenceMaps(a, b) {
    var bKeys = Object.keys(b);
    for (var _i = 0, bKeys_1 = bKeys; _i < bKeys_1.length; _i++) {
        var bKey = bKeys_1[_i];
        if (a[bKey]) {
            a[bKey] = a[bKey].concat(b[bKey]);
        }
        else {
            a[bKey] = b[bKey];
        }
    }
    return a;
}
//# sourceMappingURL=getTemplateReferences.js.map