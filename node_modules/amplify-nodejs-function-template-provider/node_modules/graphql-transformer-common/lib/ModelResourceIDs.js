"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var definition_1 = require("./definition");
var ModelResourceIDs = /** @class */ (function () {
    function ModelResourceIDs() {
    }
    ModelResourceIDs.ModelTableResourceID = function (typeName) {
        return typeName + "Table";
    };
    ModelResourceIDs.ModelTableStreamArn = function (typeName) {
        return typeName + "TableStreamArn";
    };
    ModelResourceIDs.ModelTableDataSourceID = function (typeName) {
        return typeName + "DataSource";
    };
    ModelResourceIDs.ModelTableIAMRoleID = function (typeName) {
        return typeName + "IAMRole";
    };
    ModelResourceIDs.ModelFilterInputTypeName = function (name) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Model" + nameOverride + "FilterInput";
        }
        return "Model" + name + "FilterInput";
    };
    ModelResourceIDs.ModelFilterScalarInputTypeName = function (name, includeFilter) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Model" + nameOverride + (includeFilter ? 'Filter' : '') + "Input";
        }
        return "Model" + name + (includeFilter ? 'Filter' : '') + "Input";
    };
    ModelResourceIDs.ModelConditionInputTypeName = function (name) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Model" + nameOverride + "ConditionInput";
        }
        return "Model" + name + "ConditionInput";
    };
    ModelResourceIDs.ModelKeyConditionInputTypeName = function (name) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Model" + nameOverride + "KeyConditionInput";
        }
        return "Model" + name + "KeyConditionInput";
    };
    ModelResourceIDs.ModelCompositeKeyArgumentName = function (keyFieldNames) {
        return util_1.toCamelCase(keyFieldNames.map(function (n) { return util_1.graphqlName(n); }));
    };
    ModelResourceIDs.ModelCompositeKeySeparator = function () {
        return '#';
    };
    ModelResourceIDs.ModelCompositeAttributeName = function (keyFieldNames) {
        return keyFieldNames.join(ModelResourceIDs.ModelCompositeKeySeparator());
    };
    ModelResourceIDs.ModelCompositeKeyConditionInputTypeName = function (modelName, keyName) {
        return "Model" + modelName + keyName + "CompositeKeyConditionInput";
    };
    ModelResourceIDs.ModelCompositeKeyInputTypeName = function (modelName, keyName) {
        return "Model" + modelName + keyName + "CompositeKeyInput";
    };
    ModelResourceIDs.ModelFilterListInputTypeName = function (name, includeFilter) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Model" + nameOverride + "List" + (includeFilter ? 'Filter' : '') + "Input";
        }
        return "Model" + name + "List" + (includeFilter ? 'Filter' : '') + "Input";
    };
    ModelResourceIDs.ModelScalarFilterInputTypeName = function (name, includeFilter) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Model" + nameOverride + (includeFilter ? 'Filter' : '') + "Input";
        }
        return "Model" + name + (includeFilter ? 'Filter' : '') + "Input";
    };
    ModelResourceIDs.ModelConnectionTypeName = function (typeName) {
        return "Model" + typeName + "Connection";
    };
    ModelResourceIDs.ModelDeleteInputObjectName = function (typeName) {
        return util_1.graphqlName('Delete' + util_1.toUpper(typeName) + 'Input');
    };
    ModelResourceIDs.ModelUpdateInputObjectName = function (typeName) {
        return util_1.graphqlName('Update' + util_1.toUpper(typeName) + 'Input');
    };
    ModelResourceIDs.ModelCreateInputObjectName = function (typeName) {
        return util_1.graphqlName("Create" + util_1.toUpper(typeName) + 'Input');
    };
    ModelResourceIDs.ModelOnCreateSubscriptionName = function (typeName) {
        return util_1.graphqlName("onCreate" + util_1.toUpper(typeName));
    };
    ModelResourceIDs.ModelOnUpdateSubscriptionName = function (typeName) {
        return util_1.graphqlName("onUpdate" + util_1.toUpper(typeName));
    };
    ModelResourceIDs.ModelOnDeleteSubscriptionName = function (typeName) {
        return util_1.graphqlName("onDelete" + util_1.toUpper(typeName));
    };
    ModelResourceIDs.ModelAttributeTypesName = function () {
        return "ModelAttributeTypes";
    };
    ModelResourceIDs.ModelSizeInputTypeName = function () {
        return "ModelSizeInput";
    };
    ModelResourceIDs.NonModelInputObjectName = function (typeName) {
        return util_1.graphqlName(util_1.toUpper(typeName) + 'Input');
    };
    ModelResourceIDs.UrlParamsInputObjectName = function (typeName, fieldName) {
        return util_1.graphqlName(util_1.toUpper(typeName) + util_1.toUpper(fieldName) + 'ParamsInput');
    };
    ModelResourceIDs.HttpQueryInputObjectName = function (typeName, fieldName) {
        return util_1.graphqlName(util_1.toUpper(typeName) + util_1.toUpper(fieldName) + 'QueryInput');
    };
    ModelResourceIDs.HttpBodyInputObjectName = function (typeName, fieldName) {
        return util_1.graphqlName(util_1.toUpper(typeName) + util_1.toUpper(fieldName) + 'BodyInput');
    };
    return ModelResourceIDs;
}());
exports.ModelResourceIDs = ModelResourceIDs;
//# sourceMappingURL=ModelResourceIDs.js.map