#!/usr/bin/env node
"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sms = require("source-map-support");
sms.install();
var samData_1 = require("./samData");
var resourcesSpec = require("./resourcesSpec");
var mergeOptions = require('merge-options');
function toAWSPrimitiveTypes(x) {
    var awsPrimitiveTypes = [];
    switch (x.toLowerCase()) {
        case 'number':
            awsPrimitiveTypes = ['Integer', 'Long', 'Double'];
            break;
        case 'string':
            awsPrimitiveTypes = ['String', 'Timestamp'];
            break;
        case 'boolean':
            awsPrimitiveTypes = ['Boolean'];
            break;
        default:
            throw new Error("Type \"" + x + "\" is incompatible with any AWS primitive types!");
    }
    ;
    return awsPrimitiveTypes;
}
exports.toAWSPrimitiveTypes = toAWSPrimitiveTypes;
function buildResourceProperty(propertyTypes, isRequired) {
    if (isRequired === void 0) { isRequired = false; }
    var property;
    // normalize type names
    propertyTypes = propertyTypes.map(function (x) { return x.replace(/\w*::\w*::\w*(\.)?/g, ''); });
    if (propertyTypes.length > 1) {
        property = resourcesSpec.makeProperty();
        property['Type'] = propertyTypes;
    }
    else {
        var propertyType = propertyTypes.pop();
        if (resourcesSpec.isPropertyTypeFormat(propertyType)) {
            propertyType = resourcesSpec.getPropertyTypePropertyName(propertyType);
        }
        property = resourcesSpec.makeProperty(propertyType);
    }
    property['Required'] = isRequired;
    return property;
}
exports.buildResourceProperty = buildResourceProperty;
function resolveTypes(propertyDefinition, baseName) {
    var propertyTypes = [];
    // this has subtypes
    if (propertyDefinition.hasOwnProperty('anyOf')) {
        try {
            for (var _a = __values(propertyDefinition['anyOf']), _b = _a.next(); !_b.done; _b = _a.next()) {
                var propertyDefinitionType = _b.value;
                try {
                    for (var _c = __values(resolveTypes(propertyDefinitionType)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var subType = _d.value;
                        propertyTypes.push(subType);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    // this is a primitive or complex type
    if (propertyDefinition.hasOwnProperty('type')) {
        // primitive type
        // some property definitions may have multiple primitive types within type
        // therefore it's best to process type as an array
        var propertyDefinitionTypes = void 0;
        if (Array.isArray(propertyDefinition['type'])) {
            propertyDefinitionTypes = propertyDefinition['type'];
        }
        else {
            propertyDefinitionTypes = [propertyDefinition['type']];
        }
        try {
            // process each primitive type
            for (var propertyDefinitionTypes_1 = __values(propertyDefinitionTypes), propertyDefinitionTypes_1_1 = propertyDefinitionTypes_1.next(); !propertyDefinitionTypes_1_1.done; propertyDefinitionTypes_1_1 = propertyDefinitionTypes_1.next()) {
                var propertyDefinitionType = propertyDefinitionTypes_1_1.value;
                if (!!~samData_1.samPrimitiveTypes.indexOf(propertyDefinitionType)) {
                    var propTypes = toAWSPrimitiveTypes(propertyDefinitionType);
                    try {
                        for (var propTypes_1 = __values(propTypes), propTypes_1_1 = propTypes_1.next(); !propTypes_1_1.done; propTypes_1_1 = propTypes_1.next()) {
                            var propType = propTypes_1_1.value;
                            propertyTypes.push(propType);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (propTypes_1_1 && !propTypes_1_1.done && (_g = propTypes_1.return)) _g.call(propTypes_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (propertyDefinitionTypes_1_1 && !propertyDefinitionTypes_1_1.done && (_h = propertyDefinitionTypes_1.return)) _h.call(propertyDefinitionTypes_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // list type
        if (propertyDefinition['type'] == 'array') {
            if (propertyDefinition.hasOwnProperty('items')) {
                try {
                    for (var _j = __values(resolveTypes(propertyDefinition['items'])), _k = _j.next(); !_k.done; _k = _j.next()) {
                        var subPropType = _k.value;
                        if (!!~samData_1.samPrimitiveTypes.indexOf(subPropType)) {
                            var subPropTypes = toAWSPrimitiveTypes(subPropType);
                            try {
                                for (var subPropTypes_1 = __values(subPropTypes), subPropTypes_1_1 = subPropTypes_1.next(); !subPropTypes_1_1.done; subPropTypes_1_1 = subPropTypes_1.next()) {
                                    var subPropType_1 = subPropTypes_1_1.value;
                                    propertyTypes.push("List<" + subPropType_1 + ">");
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (subPropTypes_1_1 && !subPropTypes_1_1.done && (_l = subPropTypes_1.return)) _l.call(subPropTypes_1);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                        }
                        else {
                            propertyTypes.push("List<" + subPropType + ">");
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_k && !_k.done && (_m = _j.return)) _m.call(_j);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
            else {
                propertyTypes.push('List<Json>');
            }
        }
        // map type
        if (propertyDefinition['type'] == 'object') {
            if (propertyDefinition.hasOwnProperty('patternProperties')) {
                var patternProperties = propertyDefinition['patternProperties'];
                var patternPropertiesKey = Object.keys(patternProperties)[0];
                var valueDefinitions = patternProperties[patternPropertiesKey];
                try {
                    for (var _o = __values(resolveTypes(valueDefinitions)), _p = _o.next(); !_p.done; _p = _o.next()) {
                        var subPropType = _p.value;
                        if (!!~samData_1.samPrimitiveTypes.indexOf(subPropType)) {
                            var subPropTypes = toAWSPrimitiveTypes(subPropType);
                            try {
                                for (var subPropTypes_2 = __values(subPropTypes), subPropTypes_2_1 = subPropTypes_2.next(); !subPropTypes_2_1.done; subPropTypes_2_1 = subPropTypes_2.next()) {
                                    var subPropType_2 = subPropTypes_2_1.value;
                                    propertyTypes.push("Map<" + subPropType_2 + ">");
                                }
                            }
                            catch (e_7_1) { e_7 = { error: e_7_1 }; }
                            finally {
                                try {
                                    if (subPropTypes_2_1 && !subPropTypes_2_1.done && (_q = subPropTypes_2.return)) _q.call(subPropTypes_2);
                                }
                                finally { if (e_7) throw e_7.error; }
                            }
                        }
                        else {
                            propertyTypes.push("Map<" + subPropType + ">");
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_p && !_p.done && (_r = _o.return)) _r.call(_o);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
            else {
                propertyTypes.push('Json');
            }
        }
    }
    // this is a resource property type
    if (propertyDefinition.hasOwnProperty('$ref')) {
        propertyTypes.push(propertyDefinition['$ref'].split('/').pop());
    }
    // if this is a parameterized type then format its' specializations accordingly
    if (!!baseName && (propertyTypes.length > 1)) {
        propertyTypes = propertyTypes.map(function (x) { return baseName + "<" + x + ">"; });
    }
    return propertyTypes;
    var e_2, _f, e_1, _e, e_4, _h, e_3, _g, e_6, _m, e_5, _l, e_8, _r, e_7, _q;
}
function resolveTypeProperties(typeDef) {
    var resolvedProperties = { 'properties': {} };
    var operatorItems = null;
    // determine if there is a JSON Schema operator being applied
    switch (true) {
        case (typeDef.hasOwnProperty('allOf')):
            operatorItems = typeDef['allOf'];
            break;
        case (typeDef.hasOwnProperty('anyOf')):
            operatorItems = typeDef['anyOf'];
            break;
        case (typeDef.hasOwnProperty('oneOf')):
            operatorItems = typeDef['oneOf'];
            break;
    }
    // combine recursively resolved properties
    if (operatorItems) {
        try {
            for (var operatorItems_1 = __values(operatorItems), operatorItems_1_1 = operatorItems_1.next(); !operatorItems_1_1.done; operatorItems_1_1 = operatorItems_1.next()) {
                var operatorItem = operatorItems_1_1.value;
                var operatorItemProperties = resolveTypeProperties(operatorItem);
                Object.assign(resolvedProperties['properties'], operatorItemProperties);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (operatorItems_1_1 && !operatorItems_1_1.done && (_a = operatorItems_1.return)) _a.call(operatorItems_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
        // otherwise just use the static properties section
    }
    else {
        resolvedProperties['properties'] = typeDef['properties'];
    }
    return resolvedProperties['properties'];
    var e_9, _a;
}
exports.resolveTypeProperties = resolveTypeProperties;
function processDefinition(type, typeDef, awsResourcesSpec) {
    // create and register the type
    var typeProperties;
    var typeRequired;
    var typeAdditionalProperties;
    var resource;
    // determine definition's properties section
    if (resourcesSpec.isPropertyTypeFormat(type)) {
        resource = resourcesSpec.makePropertyTypeSpec();
        awsResourcesSpec['PropertyTypes'][type] = resource;
        typeProperties = resolveTypeProperties(typeDef);
        typeRequired = typeDef['required'];
    }
    else {
        resource = resourcesSpec.makeResourceTypeSpec();
        awsResourcesSpec['ResourceTypes'][type] = resource;
        typeProperties = resolveTypeProperties(typeDef['properties']['Properties']);
        typeRequired = typeDef['properties']['Properties']['required'];
        typeAdditionalProperties = typeDef['properties']['Properties']['additionalProperties'];
    }
    // process definition's properties
    if (!!typeProperties) {
        try {
            for (var _a = __values(Object.keys(typeProperties)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var propertyName = _b.value;
                var propertyDef = typeProperties[propertyName];
                var propertyIsRequired = !!typeRequired ? !!~typeRequired.indexOf(propertyName) : false;
                var propertyTypes = [];
                // nested definition
                if (propertyDef.hasOwnProperty('properties')) {
                    propertyTypes = ["" + propertyName];
                    processDefinition(type + "." + propertyName, propertyDef, awsResourcesSpec);
                    // simple property or referenced top-level definition
                }
                else {
                    propertyTypes = resolveTypes(propertyDef, type + "#" + propertyName);
                }
                var resourceProperty = buildResourceProperty(propertyTypes, propertyIsRequired);
                resource['Properties'][propertyName] = resourceProperty;
                if (!!typeAdditionalProperties) {
                    resource['AdditionalProperties'] = typeAdditionalProperties;
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_10) throw e_10.error; }
        }
    }
    var e_10, _c;
}
exports.processDefinition = processDefinition;
function samResourcesSpecification(samSchema, customSpecification) {
    var awsResourcesSpec = {
        PropertyTypes: {},
        ResourceTypes: {}
    };
    // filter SAM schema to include just type definitions
    var samSchemaTypeDefinitions = Object.keys(samSchema['definitions']);
    samSchemaTypeDefinitions = samSchemaTypeDefinitions.filter(function (x) { return !!~x.indexOf('::'); });
    try {
        // process SAM schema type definitions
        for (var samSchemaTypeDefinitions_1 = __values(samSchemaTypeDefinitions), samSchemaTypeDefinitions_1_1 = samSchemaTypeDefinitions_1.next(); !samSchemaTypeDefinitions_1_1.done; samSchemaTypeDefinitions_1_1 = samSchemaTypeDefinitions_1.next()) {
            var type = samSchemaTypeDefinitions_1_1.value;
            var samSchemaDef = samSchema['definitions'][type];
            processDefinition(type, samSchemaDef, awsResourcesSpec);
        }
    }
    catch (e_11_1) { e_11 = { error: e_11_1 }; }
    finally {
        try {
            if (samSchemaTypeDefinitions_1_1 && !samSchemaTypeDefinitions_1_1.done && (_a = samSchemaTypeDefinitions_1.return)) _a.call(samSchemaTypeDefinitions_1);
        }
        finally { if (e_11) throw e_11.error; }
    }
    // enhance with custom specification
    awsResourcesSpec = mergeOptions(awsResourcesSpec, customSpecification);
    return awsResourcesSpec;
    var e_11, _a;
}
exports.samResourcesSpecification = samResourcesSpecification;
;
//# sourceMappingURL=sam2CFNUtils.js.map