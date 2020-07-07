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
var ast_1 = require("./ast");
var RESOLVER_VERSION_ID = '2017-02-28';
var DynamoDBMappingTemplate = /** @class */ (function () {
    function DynamoDBMappingTemplate() {
    }
    /**
     * Create a put item resolver template.
     * @param keys A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.putItem = function (_a, version) {
        var key = _a.key, attributeValues = _a.attributeValues, condition = _a.condition;
        if (version === void 0) { version = RESOLVER_VERSION_ID; }
        return ast_1.obj({
            version: ast_1.str(version),
            operation: ast_1.str('PutItem'),
            key: key,
            attributeValues: attributeValues,
            condition: condition,
        });
    };
    /**
     * Create a get item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.getItem = function (_a) {
        var key = _a.key, isSyncEnabled = _a.isSyncEnabled;
        var version = RESOLVER_VERSION_ID;
        if (isSyncEnabled) {
            version = '2018-05-29';
        }
        return ast_1.obj({
            version: ast_1.str(version),
            operation: ast_1.str('GetItem'),
            key: key,
        });
    };
    /**
     * Create a query resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.query = function (_a) {
        var query = _a.query, scanIndexForward = _a.scanIndexForward, filter = _a.filter, limit = _a.limit, nextToken = _a.nextToken, index = _a.index, isSyncEnabled = _a.isSyncEnabled;
        var version = isSyncEnabled ? '2018-05-29' : RESOLVER_VERSION_ID;
        return ast_1.obj(__assign(__assign({ version: ast_1.str(version), operation: ast_1.str('Query'), query: query,
            scanIndexForward: scanIndexForward,
            filter: filter,
            limit: limit }, (nextToken ? { nextToken: nextToken } : {})), (index ? { index: index } : {})));
    };
    /**
     * Create a list item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.listItem = function (_a, version) {
        var filter = _a.filter, limit = _a.limit, nextToken = _a.nextToken, scanIndexForward = _a.scanIndexForward, query = _a.query, index = _a.index;
        if (version === void 0) { version = RESOLVER_VERSION_ID; }
        return ast_1.obj({
            version: ast_1.str(version),
            operation: ast_1.str('Scan'),
            filter: filter,
            limit: limit,
            nextToken: nextToken,
            query: query,
            index: index,
            scanIndexForward: scanIndexForward,
        });
    };
    /**
     * Creates a sync resolver template
     * @param param An object used when creating the operation request to appsync
     */
    DynamoDBMappingTemplate.syncItem = function (_a) {
        var filter = _a.filter, limit = _a.limit, nextToken = _a.nextToken, lastSync = _a.lastSync;
        return ast_1.obj({
            version: ast_1.str('2018-05-29'),
            operation: ast_1.str('Sync'),
            limit: limit,
            nextToken: nextToken,
            lastSync: lastSync,
            filter: filter,
        });
    };
    /**
     * Create a delete item resolver template.
     * @param key A list of strings pointing to the key value locations. E.G. ctx.args.x (note no $)
     */
    DynamoDBMappingTemplate.deleteItem = function (_a) {
        var key = _a.key, condition = _a.condition, isSyncEnabled = _a.isSyncEnabled;
        var version = isSyncEnabled ? '2018-05-29' : RESOLVER_VERSION_ID;
        return ast_1.obj(__assign({ version: ast_1.str(version), operation: ast_1.str('DeleteItem'), key: key,
            condition: condition }, (isSyncEnabled && { _version: ast_1.ref('util.defaultIfNull($ctx.args.input["_version"], "0")') })));
    };
    /**
     * Create an update item resolver template.
     * @param key
     */
    DynamoDBMappingTemplate.updateItem = function (_a) {
        var key = _a.key, condition = _a.condition, objectKeyVariable = _a.objectKeyVariable, nameOverrideMap = _a.nameOverrideMap, isSyncEnabled = _a.isSyncEnabled;
        // const keyFields = key.attributes.map((attr: [string, Expression]) => attr[0])
        // Auto timestamp
        // qref('$input.put("updatedAt", "$util.time.nowISO8601()")'),
        var entryKeyAttributeNameVar = 'entryKeyAttributeName';
        var keyFields = [ast_1.str('id')];
        var version = RESOLVER_VERSION_ID;
        // sync changes made to the resolver
        if (isSyncEnabled) {
            keyFields = __spreadArrays(keyFields, [ast_1.str('_version'), ast_1.str('_deleted'), ast_1.str('_lastChangedAt')]);
            version = '2018-05-29';
        }
        var handleRename = function (keyVar) {
            return ast_1.ifElse(ast_1.raw("!$util.isNull($" + nameOverrideMap + ") && $" + nameOverrideMap + ".containsKey(\"" + keyVar + "\")"), ast_1.set(ast_1.ref(entryKeyAttributeNameVar), ast_1.raw("$" + nameOverrideMap + ".get(\"" + keyVar + "\")")), ast_1.set(ast_1.ref(entryKeyAttributeNameVar), ast_1.raw(keyVar)));
        };
        return ast_1.compoundExpression([
            ast_1.set(ast_1.ref('expNames'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expValues'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expSet'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expAdd'), ast_1.obj({})),
            ast_1.set(ast_1.ref('expRemove'), ast_1.list([])),
            ast_1.ifElse(ast_1.ref(objectKeyVariable), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('keyFields'), ast_1.list([])),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref(objectKeyVariable + ".entrySet()"), [ast_1.qref('$keyFields.add("$entry.key")')]),
            ]), ast_1.set(ast_1.ref('keyFields'), ast_1.list(keyFields))),
            ast_1.forEach(ast_1.ref('entry'), ast_1.ref("util.map.copyAndRemoveAllKeys($context.args.input, $keyFields).entrySet()"), [
                handleRename('$entry.key'),
                ast_1.ifElse(ast_1.ref('util.isNull($entry.value)'), ast_1.compoundExpression([
                    ast_1.set(ast_1.ref('discard'), ast_1.ref("expRemove.add(\"#$" + entryKeyAttributeNameVar + "\")")),
                    ast_1.qref("$expNames.put(\"#$" + entryKeyAttributeNameVar + "\", \"$entry.key\")"),
                ]), ast_1.compoundExpression([
                    ast_1.qref("$expSet.put(\"#$" + entryKeyAttributeNameVar + "\", \":$" + entryKeyAttributeNameVar + "\")"),
                    ast_1.qref("$expNames.put(\"#$" + entryKeyAttributeNameVar + "\", \"$entry.key\")"),
                    ast_1.qref("$expValues.put(\":$" + entryKeyAttributeNameVar + "\", $util.dynamodb.toDynamoDB($entry.value))"),
                ])),
            ]),
            ast_1.set(ast_1.ref('expression'), ast_1.str('')),
            ast_1.iff(ast_1.raw('!$expSet.isEmpty()'), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('expression'), ast_1.str('SET')),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref('expSet.entrySet()'), [
                    ast_1.set(ast_1.ref('expression'), ast_1.str('$expression $entry.key = $entry.value')),
                    ast_1.iff(ast_1.ref('foreach.hasNext()'), ast_1.set(ast_1.ref('expression'), ast_1.str('$expression,'))),
                ]),
            ])),
            ast_1.iff(ast_1.raw('!$expAdd.isEmpty()'), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('expression'), ast_1.str('$expression ADD')),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref('expAdd.entrySet()'), [
                    ast_1.set(ast_1.ref('expression'), ast_1.str('$expression $entry.key $entry.value')),
                    ast_1.iff(ast_1.ref('foreach.hasNext()'), ast_1.set(ast_1.ref('expression'), ast_1.str('$expression,'))),
                ]),
            ])),
            ast_1.iff(ast_1.raw('!$expRemove.isEmpty()'), ast_1.compoundExpression([
                ast_1.set(ast_1.ref('expression'), ast_1.str('$expression REMOVE')),
                ast_1.forEach(ast_1.ref('entry'), ast_1.ref('expRemove'), [
                    ast_1.set(ast_1.ref('expression'), ast_1.str('$expression $entry')),
                    ast_1.iff(ast_1.ref('foreach.hasNext()'), ast_1.set(ast_1.ref('expression'), ast_1.str('$expression,'))),
                ]),
            ])),
            ast_1.set(ast_1.ref('update'), ast_1.obj({})),
            ast_1.qref('$update.put("expression", "$expression")'),
            ast_1.iff(ast_1.raw('!$expNames.isEmpty()'), ast_1.qref('$update.put("expressionNames", $expNames)')),
            ast_1.iff(ast_1.raw('!$expValues.isEmpty()'), ast_1.qref('$update.put("expressionValues", $expValues)')),
            ast_1.obj(__assign({ version: ast_1.str(version), operation: ast_1.str('UpdateItem'), key: key, update: ast_1.ref('util.toJson($update)'), condition: condition }, (isSyncEnabled && { _version: ast_1.ref('util.defaultIfNull($ctx.args.input["_version"], "0")') }))),
        ]);
    };
    DynamoDBMappingTemplate.dynamoDBResponse = function (expression) {
        if (expression === void 0) { expression = ast_1.ref('util.error($ctx.error.message, $ctx.error.type, $ctx.result)'); }
        return ast_1.compoundExpression([ast_1.ifElse(ast_1.ref('ctx.error'), expression, ast_1.ref('util.toJson($ctx.result)'))]);
    };
    DynamoDBMappingTemplate.stringAttributeValue = function (value) {
        return {
            kind: 'Object',
            attributes: [['S', { kind: 'Quotes', expr: value }]],
        };
    };
    DynamoDBMappingTemplate.numericAttributeValue = function (value) {
        return {
            kind: 'Object',
            attributes: [['N', { kind: 'Quotes', expr: value }]],
        };
    };
    DynamoDBMappingTemplate.binaryAttributeValue = function (value) {
        return {
            kind: 'Object',
            attributes: [['B', { kind: 'Quotes', expr: value }]],
        };
    };
    DynamoDBMappingTemplate.paginatedResponse = function () {
        return ast_1.obj({
            items: ast_1.ref('util.toJson($ctx.result.items)'),
            nextToken: ast_1.ref('util.toJson($util.defaultIfNullOrBlank($context.result.nextToken, null))'),
        });
    };
    return DynamoDBMappingTemplate;
}());
exports.DynamoDBMappingTemplate = DynamoDBMappingTemplate;
//# sourceMappingURL=dynamodb.js.map