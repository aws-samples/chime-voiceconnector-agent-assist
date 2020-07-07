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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dynamodb_utils_1 = require("../dynamodb-utils");
var OPERATOR_MAP = {
    ne: '<>',
    eq: '=',
    lt: '<',
    le: '<=',
    gt: '>',
    ge: '>=',
};
var FUNCTION_MAP = {
    contains: 'contains',
    notContains: 'NOT contains',
    beginsWith: 'begins_with',
};
function generateFilterExpression(filter, prefix, parent) {
    if (prefix === void 0) { prefix = null; }
    if (parent === void 0) { parent = null; }
    var expr = Object.entries(filter).reduce(function (sum, _a) {
        var name = _a[0], value = _a[1];
        var subExpr = {
            expressions: [],
            expressionNames: {},
            expressionValues: {},
        };
        var fieldName = createExpressionFieldName(parent);
        var filedValueName = createExpressionValueName(parent, name, prefix);
        switch (name) {
            case 'or':
            case 'and':
                var JOINER_1 = name === 'or' ? 'OR' : 'AND';
                if (Array.isArray(value)) {
                    subExpr = scopeExpression(value.reduce(function (expr, subFilter, idx) {
                        var newExpr = generateFilterExpression(subFilter, [prefix, name, idx].filter(function (i) { return i !== null; }).join('_'));
                        return merge(expr, newExpr, JOINER_1);
                    }, subExpr));
                }
                else {
                    subExpr = generateFilterExpression(value, [prefix, name].filter(function (val) { return val !== null; }).join('_'));
                }
                break;
            case 'not':
                subExpr = scopeExpression(generateFilterExpression(value, [prefix, name].filter(function (val) { return val !== null; }).join('_')));
                subExpr.expressions.unshift('NOT');
                break;
            case 'between':
                var expr1 = createExpressionValueName(parent, 'between_1', prefix);
                var expr2 = createExpressionValueName(parent, 'between_2', prefix);
                var exprName = createExpressionName(parent);
                var subExprExpr = createExpressionFieldName(parent) + " BETWEEN " + expr1 + " AND " + expr2;
                var exprValues = __assign(__assign({}, createExpressionValue(parent, 'between_1', value[0], prefix)), createExpressionValue(parent, 'between_2', value[1], prefix));
                subExpr = {
                    expressions: [subExprExpr],
                    expressionNames: exprName,
                    expressionValues: exprValues,
                };
                break;
            case 'ne':
            case 'eq':
            case 'gt':
            case 'ge':
            case 'lt':
            case 'le':
                var operator = OPERATOR_MAP[name];
                subExpr = {
                    expressions: [fieldName + " " + operator + " " + filedValueName],
                    expressionNames: createExpressionName(parent),
                    expressionValues: createExpressionValue(parent, name, value, prefix),
                };
                break;
            case 'contains':
            case 'notContains':
            case 'beginsWith':
                var functionName = FUNCTION_MAP[name];
                subExpr = {
                    expressions: [functionName + "(" + fieldName + ", " + filedValueName + ")"],
                    expressionNames: createExpressionName(parent),
                    expressionValues: createExpressionValue(parent, name, value, prefix),
                };
                break;
            default:
                subExpr = scopeExpression(generateFilterExpression(value, prefix, name));
        }
        return merge(sum, subExpr);
    }, {
        expressions: [],
        expressionNames: {},
        expressionValues: {},
    });
    return expr;
}
exports.generateFilterExpression = generateFilterExpression;
function merge(expr1, expr2, joinCondition) {
    if (joinCondition === void 0) { joinCondition = 'AND'; }
    if (!expr2.expressions.length) {
        return expr1;
    }
    return {
        expressions: __spreadArrays(expr1.expressions, [expr1.expressions.length ? joinCondition : ''], expr2.expressions),
        expressionNames: __assign(__assign({}, expr1.expressionNames), expr2.expressionNames),
        expressionValues: __assign(__assign({}, expr1.expressionValues), expr2.expressionValues),
    };
}
function createExpressionValueName(fieldName, op, prefix) {
    return ":" + [prefix, fieldName, op].filter(function (name) { return name; }).join('_');
}
function createExpressionName(fieldName) {
    var _a;
    return _a = {},
        _a[createExpressionFieldName(fieldName)] = fieldName,
        _a;
}
function createExpressionFieldName(fieldName) {
    return "#" + fieldName;
}
function createExpressionValue(fieldName, op, value, prefix) {
    var _a;
    var exprName = createExpressionValueName(fieldName, op, prefix);
    var exprValue = dynamodb_utils_1.dynamodbUtils.toDynamoDB(value);
    return _a = {},
        _a["" + exprName] = exprValue,
        _a;
}
function scopeExpression(expr) {
    var result = __assign({}, expr);
    result.expressions = result.expressions.filter(function (e) { return !!e; });
    if (result.expressions.length > 1) {
        result.expressions = ['(' + result.expressions.join(' ') + ')'];
    }
    return result;
}
//# sourceMappingURL=dynamodb-filter.js.map