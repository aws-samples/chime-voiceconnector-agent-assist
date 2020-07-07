"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var definition_1 = require("./definition");
var ModelResourceIDs_1 = require("./ModelResourceIDs");
var graphql_mapping_template_1 = require("graphql-mapping-template");
// Key conditions
var STRING_KEY_CONDITIONS = ['eq', 'le', 'lt', 'ge', 'gt', 'between', 'beginsWith'];
var ID_KEY_CONDITIONS = ['eq', 'le', 'lt', 'ge', 'gt', 'between', 'beginsWith'];
var INT_KEY_CONDITIONS = ['eq', 'le', 'lt', 'ge', 'gt', 'between'];
var FLOAT_KEY_CONDITIONS = ['eq', 'le', 'lt', 'ge', 'gt', 'between'];
function getScalarKeyConditions(type) {
    switch (type) {
        case 'String':
            return STRING_KEY_CONDITIONS;
        case 'ID':
            return ID_KEY_CONDITIONS;
        case 'Int':
            return INT_KEY_CONDITIONS;
        case 'Float':
            return FLOAT_KEY_CONDITIONS;
        default:
            throw 'Valid types are String, ID, Int, Float, Boolean';
    }
}
function makeModelScalarKeyConditionInputObject(type) {
    var name = ModelResourceIDs_1.ModelResourceIDs.ModelKeyConditionInputTypeName(type);
    var conditions = getScalarKeyConditions(type);
    var fields = conditions.map(function (condition) { return ({
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: 'Name', value: condition },
        type: condition === 'between' ? definition_1.makeListType(definition_1.makeNamedType(type)) : definition_1.makeNamedType(type),
        directives: [],
    }); });
    return definition_1.makeInputObjectDefinition(name, fields);
}
exports.makeModelScalarKeyConditionInputObject = makeModelScalarKeyConditionInputObject;
var STRING_KEY_CONDITION = makeModelScalarKeyConditionInputObject('String');
var ID_KEY_CONDITION = makeModelScalarKeyConditionInputObject('ID');
var INT_KEY_CONDITION = makeModelScalarKeyConditionInputObject('Int');
var FLOAT_KEY_CONDITION = makeModelScalarKeyConditionInputObject('Float');
var SCALAR_KEY_CONDITIONS = [STRING_KEY_CONDITION, ID_KEY_CONDITION, INT_KEY_CONDITION, FLOAT_KEY_CONDITION];
function makeScalarKeyConditionInputs() {
    return SCALAR_KEY_CONDITIONS;
}
exports.makeScalarKeyConditionInputs = makeScalarKeyConditionInputs;
function makeScalarKeyConditionForType(type, nonScalarTypeResolver) {
    if (nonScalarTypeResolver === void 0) { nonScalarTypeResolver = undefined; }
    var baseType = definition_1.getBaseType(type);
    var resolvedScalarName;
    if (definition_1.isScalar(type)) {
        resolvedScalarName = baseType;
    }
    else if (nonScalarTypeResolver) {
        resolvedScalarName = nonScalarTypeResolver(baseType);
    }
    var inputName = ModelResourceIDs_1.ModelResourceIDs.ModelKeyConditionInputTypeName(resolvedScalarName);
    for (var _i = 0, SCALAR_KEY_CONDITIONS_1 = SCALAR_KEY_CONDITIONS; _i < SCALAR_KEY_CONDITIONS_1.length; _i++) {
        var key = SCALAR_KEY_CONDITIONS_1[_i];
        if (key.name.value === inputName) {
            return key;
        }
    }
}
exports.makeScalarKeyConditionForType = makeScalarKeyConditionForType;
/**
 * Given a list of key fields, create a composite key input type for the sort key condition.
 * Given,
 * type User @model @key(fields: ["a", "b", "c"]) { a: String, b: String, c: String }
 * a composite key will be formed over "a" and "b". This will output:
 * input UserPrimaryCompositeKeyConditionInput {
 *   beginsWith: UserPrimaryCompositeKeyInput,
 *   between: [UserPrimaryCompositeKeyInput],
 *   eq, le, lt, gt, ge: UserPrimaryCompositeKeyInput
 * }
 * input UserPrimaryCompositeKeyInput {
 *   b: String
 *   c: String
 * }
 */
function makeCompositeKeyConditionInputForKey(modelName, keyName, fields) {
    var name = ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeyConditionInputTypeName(modelName, keyName);
    var conditions = STRING_KEY_CONDITIONS;
    var inputValues = conditions.map(function (condition) {
        // Between takes a list of comosite key nodes.
        var typeNode = condition === 'between'
            ? definition_1.makeListType(definition_1.makeNamedType(ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeyInputTypeName(modelName, keyName)))
            : definition_1.makeNamedType(ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeyInputTypeName(modelName, keyName));
        return definition_1.makeInputValueDefinition(condition, typeNode);
    });
    return definition_1.makeInputObjectDefinition(name, inputValues);
}
exports.makeCompositeKeyConditionInputForKey = makeCompositeKeyConditionInputForKey;
function makeCompositeKeyInputForKey(modelName, keyName, fields) {
    var inputValues = fields.map(function (field, idx) {
        var baseTypeName = definition_1.getBaseType(field.type);
        var nameOverride = definition_1.DEFAULT_SCALARS[baseTypeName];
        var typeNode = null;
        if (idx === fields.length - 1 && nameOverride) {
            typeNode = definition_1.makeNamedType(nameOverride);
        }
        else {
            typeNode = definition_1.makeNamedType(baseTypeName);
        }
        return definition_1.makeInputValueDefinition(field.name.value, typeNode);
    });
    var inputName = ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeyInputTypeName(modelName, keyName);
    return definition_1.makeInputObjectDefinition(inputName, inputValues);
}
exports.makeCompositeKeyInputForKey = makeCompositeKeyInputForKey;
/**
 * Key conditions materialize as instances of ModelXKeyConditionInput passed via $ctx.args.
 * If the arguments with the given sortKey name exists, create a DynamoDB expression that
 * implements its logic. Possible operators: eq, le, lt, ge, gt, beginsWith, and between.
 * @param argName The name of the argument containing the sort key condition object.
 * @param attributeType The type of the DynamoDB attribute in the table.
 * @param queryExprReference The name of the variable containing the query expression in the template.
 */
function applyKeyConditionExpression(argName, attributeType, queryExprReference, sortKeyName, prefixVariableName) {
    if (attributeType === void 0) { attributeType = 'S'; }
    if (queryExprReference === void 0) { queryExprReference = 'query'; }
    var prefixValue = function (value) { return (prefixVariableName ? "$" + prefixVariableName + "#" + value : value); };
    var _sortKeyName = sortKeyName ? sortKeyName : argName;
    return graphql_mapping_template_1.block('Applying Key Condition', [
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".beginsWith)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND begins_with(#sortKey, :sortKey)\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".beginsWith") + "\" })"),
        ])),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".between)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey BETWEEN :sortKey0 AND :sortKey1\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey0\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".between[0]") + "\" })"),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey1\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".between[1]") + "\" })"),
        ])),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".eq)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey = :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".eq") + "\" })"),
        ])),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".lt)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey < :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".lt") + "\" })"),
        ])),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".le)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey <= :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".le") + "\" })"),
        ])),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".gt)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey > :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".gt") + "\" })"),
        ])),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + argName + ") && !$util.isNull($ctx.args." + argName + ".ge)"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey >= :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + _sortKeyName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"" + attributeType + "\": \"" + prefixValue("$ctx.args." + argName + ".ge") + "\" })"),
        ])),
    ]);
}
exports.applyKeyConditionExpression = applyKeyConditionExpression;
/**
 * Key conditions materialize as instances of ModelXKeyConditionInput passed via $ctx.args.
 * If the arguments with the given sortKey name exists, create a DynamoDB expression that
 * implements its logic. Possible operators: eq, le, lt, ge, gt, beginsWith, and between.
 * @param argName The name of the argument containing the sort key condition object.
 * @param attributeType The type of the DynamoDB attribute in the table.
 * @param queryExprReference The name of the variable containing the query expression in the template.
 */
function applyCompositeKeyConditionExpression(keyNames, queryExprReference, sortKeyArgumentName, sortKeyAttributeName) {
    if (queryExprReference === void 0) { queryExprReference = 'query'; }
    var accumulatorVar1 = 'sortKeyValue';
    var accumulatorVar2 = 'sortKeyValue2';
    var sep = ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeySeparator();
    return graphql_mapping_template_1.block('Applying Key Condition', [
        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str('')),
        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar2), graphql_mapping_template_1.str('')),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".beginsWith)"), graphql_mapping_template_1.compoundExpression(__spreadArrays(keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".beginsWith." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".beginsWith." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".beginsWith." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND begins_with(#sortKey, :sortKey)\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
        ]))),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".between)"), graphql_mapping_template_1.compoundExpression(__spreadArrays([
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("$ctx.args." + sortKeyArgumentName + ".between.size() != 2"), graphql_mapping_template_1.raw("$util.error(\"Argument " + sortKeyArgumentName + ".between expects exactly 2 elements.\")"))
        ], keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".between[0]." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".between[0]." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".between[0]." + keyName)), true);
        }), keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".between[1]." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar2), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".between[1]." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar2), graphql_mapping_template_1.str("$" + accumulatorVar2 + sep + "$ctx.args." + sortKeyArgumentName + ".between[1]." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey BETWEEN :sortKey0 AND :sortKey1\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey0\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey1\", { \"S\": \"$" + accumulatorVar2 + "\" })"),
        ]))),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".eq)"), graphql_mapping_template_1.compoundExpression(__spreadArrays(keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".eq." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".eq." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".eq." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey = :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
        ]))),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".lt)"), graphql_mapping_template_1.compoundExpression(__spreadArrays(keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".lt." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".lt." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".lt." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey < :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
        ]))),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".le)"), graphql_mapping_template_1.compoundExpression(__spreadArrays(keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".le." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".le." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".le." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey <= :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
        ]))),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".gt)"), graphql_mapping_template_1.compoundExpression(__spreadArrays(keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".gt." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".gt." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".gt." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey > :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
        ]))),
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && !$util.isNull($ctx.args." + sortKeyArgumentName + ".ge)"), graphql_mapping_template_1.compoundExpression(__spreadArrays(keyNames.map(function (keyName, idx) {
            return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ".ge." + keyName + ")"), idx === 0
                ? graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$ctx.args." + sortKeyArgumentName + ".ge." + keyName))
                : graphql_mapping_template_1.set(graphql_mapping_template_1.ref(accumulatorVar1), graphql_mapping_template_1.str("$" + accumulatorVar1 + sep + "$ctx.args." + sortKeyArgumentName + ".ge." + keyName)), true);
        }), [
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.raw("\"$" + queryExprReference + ".expression AND #sortKey >= :sortKey\"")),
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionNames.put(\"#sortKey\", \"" + sortKeyAttributeName + "\")"),
            // TODO: Handle N & B.
            graphql_mapping_template_1.qref("$" + queryExprReference + ".expressionValues.put(\":sortKey\", { \"S\": \"$" + accumulatorVar1 + "\" })"),
        ]))),
        graphql_mapping_template_1.newline(),
    ]);
}
exports.applyCompositeKeyConditionExpression = applyCompositeKeyConditionExpression;
/**
 * Key conditions materialize as instances of ModelXKeyConditionInput passed via $ctx.args.
 * If the arguments with the given sortKey name exists, create a DynamoDB expression that
 * implements its logic. Possible operators: eq, le, lt, ge, gt, beginsWith, and between.
 * @param argName The name of the argument containing the sort key condition object.
 * @param attributeType The type of the DynamoDB attribute in the table.
 * @param queryExprReference The name of the variable containing the query expression in the template.
 * @param compositeKeyName When handling a managed composite key from @key the name of the arg and underlying fields are different.
 * @param compositeKeyValue When handling a managed composite key from @key the value of the composite key is made up of multiple parts known by the caller.
 */
function applyKeyExpressionForCompositeKey(keys, attributeTypes, queryExprReference) {
    if (attributeTypes === void 0) { attributeTypes = ['S']; }
    if (queryExprReference === void 0) { queryExprReference = 'query'; }
    if (keys.length > 2) {
        // In the case of > 2, we condense the composite key, validate inputs at runtime, and wire up the HASH/RANGE expressions.
        // In the case of === 2, we validate inputs at runtime and wire up the HASH/RANGE expressions.
        var hashKeyName = keys[0];
        var hashKeyAttributeType = attributeTypes[0];
        var sortKeys = keys.slice(1);
        var sortKeyTypes = attributeTypes.slice(1);
        return graphql_mapping_template_1.compoundExpression([
            validateCompositeKeyArguments(keys),
            setupHashKeyExpression(hashKeyName, hashKeyAttributeType, queryExprReference),
            applyCompositeSortKey(sortKeys, sortKeyTypes, queryExprReference),
        ]);
    }
    else if (keys.length === 2) {
        // In the case of === 2, we validate inputs at runtime and wire up the HASH/RANGE expressions.
        var hashKeyName = keys[0];
        var hashKeyAttributeType = attributeTypes[0];
        var sortKeyName = keys[1];
        var sortKeyAttributeType = attributeTypes[1];
        return graphql_mapping_template_1.compoundExpression([
            validateKeyArguments(keys),
            setupHashKeyExpression(hashKeyName, hashKeyAttributeType, queryExprReference),
            applyKeyConditionExpression(sortKeyName, sortKeyAttributeType, queryExprReference),
        ]);
    }
    else if (keys.length === 1) {
        var hashKeyName = keys[0];
        var hashKeyAttributeType = attributeTypes[0];
        return setupHashKeyExpression(hashKeyName, hashKeyAttributeType, queryExprReference);
    }
}
exports.applyKeyExpressionForCompositeKey = applyKeyExpressionForCompositeKey;
function setupHashKeyExpression(hashKeyName, hashKeyAttributeType, queryExprReference) {
    var _a, _b, _c;
    return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + hashKeyName + ")"), graphql_mapping_template_1.compoundExpression([
        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expression"), graphql_mapping_template_1.str("#" + hashKeyName + " = :" + hashKeyName)),
        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expressionNames"), graphql_mapping_template_1.obj((_a = {}, _a["#" + hashKeyName] = graphql_mapping_template_1.str(hashKeyName), _a))),
        graphql_mapping_template_1.set(graphql_mapping_template_1.ref(queryExprReference + ".expressionValues"), graphql_mapping_template_1.obj((_b = {}, _b[":" + hashKeyName] = graphql_mapping_template_1.obj((_c = {}, _c[hashKeyAttributeType] = graphql_mapping_template_1.str("$ctx.args." + hashKeyName), _c)), _b))),
    ]));
}
/**
 * Applies a composite sort key to the query expression.
 */
function applyCompositeSortKey(sortKeys, sortKeyTypes, queryExprReference) {
    if (sortKeys.length === 0) {
        return graphql_mapping_template_1.newline();
    }
    // E.g. status#date
    var sortKeyAttributeName = ModelResourceIDs_1.ModelResourceIDs.ModelCompositeAttributeName(sortKeys);
    var sortKeyArgumentName = ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeyArgumentName(sortKeys);
    return graphql_mapping_template_1.compoundExpression([
        applyCompositeKeyConditionExpression(sortKeys, queryExprReference, sortKeyArgumentName, sortKeyAttributeName),
    ]);
}
/**
 * When providing keys, you must provide them from left to right.
 * E.G. when providing @key(fields: ["k1", "k2", "k3"]) then you may
 * query by ["k1"] or ["k1", "k2"] or ["k1", "k2", "k3"] BUT you may not
 * query by ["k1", "k3"] as it is impossible to create a key condition without
 * the "k2" value. This snippet fails a query/list operation when invalid
 * argument sets are provided.
 * @param keys
 */
function validateKeyArguments(keys) {
    var exprs = [];
    if (keys.length > 1) {
        for (var index = keys.length - 1; index > 0; index--) {
            var rightKey = keys[index];
            var previousKey = keys[index - 1];
            exprs.push(graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + rightKey + ") && $util.isNull($ctx.args." + previousKey + ")"), graphql_mapping_template_1.raw("$util.error(\"When providing argument '" + rightKey + "' you must also provide arguments " + keys
                .slice(0, index)
                .join(', ') + "\", \"InvalidArgumentsError\")")));
        }
        return graphql_mapping_template_1.block('Validate key arguments.', exprs);
    }
    else {
        return graphql_mapping_template_1.newline();
    }
}
function invalidArgumentError(err) {
    return graphql_mapping_template_1.raw("$util.error(\"" + err + "\", \"InvalidArgumentsError\")");
}
function validateCompositeKeyArguments(keys) {
    var sortKeys = keys.slice(1);
    var hashKey = keys[0];
    var sortKeyArgumentName = ModelResourceIDs_1.ModelResourceIDs.ModelCompositeKeyArgumentName(sortKeys);
    var exprs = [
        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ") && $util.isNullOrBlank($ctx.args." + hashKey + ")"), invalidArgumentError("When providing argument '" + sortKeyArgumentName + "' you must also provide '" + hashKey + "'.")),
    ];
    if (sortKeys.length > 1) {
        var loopOverKeys_1 = function (fn) {
            var exprs = [];
            for (var index = sortKeys.length - 1; index > 0; index--) {
                var rightKey = sortKeys[index];
                var previousKey = sortKeys[index - 1];
                exprs.push(fn(rightKey, previousKey));
            }
            return graphql_mapping_template_1.compoundExpression(exprs);
        };
        var validateBetween = function () {
            return graphql_mapping_template_1.compoundExpression([
                graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("$ctx.args." + sortKeyArgumentName + ".between.size() != 2"), invalidArgumentError("Argument '" + sortKeyArgumentName + ".between' expects exactly two elements.")),
                loopOverKeys_1(function (rightKey, previousKey) {
                    return graphql_mapping_template_1.compoundExpression([
                        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNullOrBlank($ctx.args." + sortKeyArgumentName + ".between[0]." + rightKey + ") && $util.isNullOrBlank($ctx.args." + sortKeyArgumentName + ".between[0]." + previousKey + ")"), invalidArgumentError("When providing argument '" + sortKeyArgumentName + ".between[0]." + rightKey + "' you must also provide '" + sortKeyArgumentName + ".between[0]." + previousKey + "'.")),
                        graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNullOrBlank($ctx.args." + sortKeyArgumentName + ".between[1]." + rightKey + ") && $util.isNullOrBlank($ctx.args." + sortKeyArgumentName + ".between[1]." + previousKey + ")"), invalidArgumentError("When providing argument '" + sortKeyArgumentName + ".between[1]." + rightKey + "' you must also provide '" + sortKeyArgumentName + ".between[1]." + previousKey + "'.")),
                    ]);
                }),
            ]);
        };
        var validateOtherOperation = function () {
            return loopOverKeys_1(function (rightKey, previousKey) {
                return graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNullOrBlank($ctx.args." + sortKeyArgumentName + ".get(\"$operation\")." + rightKey + ") && $util.isNullOrBlank($ctx.args." + sortKeyArgumentName + ".get(\"$operation\")." + previousKey + ")"), invalidArgumentError("When providing argument '" + sortKeyArgumentName + ".$operation." + rightKey + "' you must also provide '" + sortKeyArgumentName + ".$operation." + previousKey + "'."));
            });
        };
        exprs.push(graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("!$util.isNull($ctx.args." + sortKeyArgumentName + ")"), graphql_mapping_template_1.compoundExpression([
            graphql_mapping_template_1.set(graphql_mapping_template_1.ref('sortKeyArgumentOperations'), graphql_mapping_template_1.raw("$ctx.args." + sortKeyArgumentName + ".keySet()")),
            graphql_mapping_template_1.iff(graphql_mapping_template_1.raw("$sortKeyArgumentOperations.size() > 1"), invalidArgumentError("Argument " + sortKeyArgumentName + " must specify at most one key condition operation.")),
            graphql_mapping_template_1.forEach(graphql_mapping_template_1.ref('operation'), graphql_mapping_template_1.ref('sortKeyArgumentOperations'), [
                graphql_mapping_template_1.ifElse(graphql_mapping_template_1.raw("$operation == \"between\""), validateBetween(), validateOtherOperation()),
            ]),
        ])));
        return graphql_mapping_template_1.block('Validate key arguments.', exprs);
    }
    else {
        return graphql_mapping_template_1.newline();
    }
}
//# sourceMappingURL=dynamodbUtils.js.map