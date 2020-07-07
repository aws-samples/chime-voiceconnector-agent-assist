"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function plurality(val) {
    if (!val.trim()) {
        return '';
    }
    return val.concat('s');
}
exports.plurality = plurality;
function graphqlName(val) {
    if (!val.trim()) {
        return '';
    }
    var cleaned = val.replace(/^[^_A-Za-z]+|[^_0-9A-Za-z]/g, '');
    return cleaned;
}
exports.graphqlName = graphqlName;
function simplifyName(val) {
    if (!val.trim()) {
        return '';
    }
    return toPascalCase(val
        .replace(/-?_?\${[^}]*}/g, '')
        .replace(/^[^_A-Za-z]+|[^_0-9A-Za-z]/g, '|')
        .split('|'));
}
exports.simplifyName = simplifyName;
function toUpper(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
exports.toUpper = toUpper;
function toCamelCase(words) {
    var formatted = words.map(function (w, i) { return (i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)); });
    return formatted.join('');
}
exports.toCamelCase = toCamelCase;
function toPascalCase(words) {
    var formatted = words.map(function (w, i) { return w.charAt(0).toUpperCase() + w.slice(1); });
    return formatted.join('');
}
exports.toPascalCase = toPascalCase;
exports.NONE_VALUE = '___xamznone____';
exports.NONE_INT_VALUE = -2147483648;
//# sourceMappingURL=util.js.map