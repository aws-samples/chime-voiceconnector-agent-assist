"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var awsData_1 = require("./awsData");
var awsData = require("./awsData");
var clone = require("clone");
var CustomError = require("./util/CustomError");
var mergeOptions = require('merge-options');
var NoSuchProperty = /** @class */ (function (_super) {
    __extends(NoSuchProperty, _super);
    function NoSuchProperty(type, propertyName) {
        var _this = _super.call(this, "No such property " + propertyName + " on " + type) || this;
        CustomError.fixErrorInheritance(_this, NoSuchProperty);
        _this.type = type;
        _this.propertyName = propertyName;
        return _this;
    }
    return NoSuchProperty;
}(CustomError));
exports.NoSuchProperty = NoSuchProperty;
var NoSuchResourceType = /** @class */ (function (_super) {
    __extends(NoSuchResourceType, _super);
    function NoSuchResourceType(type) {
        var _this = _super.call(this, "No such resource " + type) || this;
        CustomError.fixErrorInheritance(_this, NoSuchResourceType);
        return _this;
    }
    return NoSuchResourceType;
}(CustomError));
exports.NoSuchResourceType = NoSuchResourceType;
var NoSuchPropertyType = /** @class */ (function (_super) {
    __extends(NoSuchPropertyType, _super);
    function NoSuchPropertyType(type) {
        var _this = _super.call(this, "No such property type " + type) || this;
        CustomError.fixErrorInheritance(_this, NoSuchPropertyType);
        return _this;
    }
    return NoSuchPropertyType;
}(CustomError));
exports.NoSuchPropertyType = NoSuchPropertyType;
var NoSuchResourceTypeAttribute = /** @class */ (function (_super) {
    __extends(NoSuchResourceTypeAttribute, _super);
    function NoSuchResourceTypeAttribute(type, attributeName) {
        var _this = _super.call(this, "No such attribute " + attributeName + " on " + type) || this;
        CustomError.fixErrorInheritance(_this, NoSuchResourceTypeAttribute);
        _this.resourceType = type;
        _this.attributeName = attributeName;
        return _this;
    }
    return NoSuchResourceTypeAttribute;
}(CustomError));
exports.NoSuchResourceTypeAttribute = NoSuchResourceTypeAttribute;
/*
 * Returns the specification of a resource type
 * @param type An optionally parameterized resource type (e.g. `AWS::S3::Bucket<somethingCool>`)
 */
function getResourceType(type) {
    // destructure resource name
    var typeName = type, typeArgument = '';
    if (isParameterizedTypeFormat(type)) {
        typeName = getParameterizedTypeName(type); //e.g. `AWS::S3::Bucket`
        typeArgument = getParameterizedTypeArgument(type); //e.g. `somethingCool`
    }
    // If the type starts with Custom::, it's a custom resource otherwise it's a normal resource type
    if (typeName.indexOf('Custom::') == 0) {
        // return the generic type if there's no such custom type defined
        if (!awsData_1.awsResources.ResourceTypes.hasOwnProperty(typeName)) {
            typeName = 'AWS::CloudFormation::CustomResource';
        }
    }
    // acquire base resource type specification
    var spec = awsData_1.awsResources.ResourceTypes[typeName];
    if (!spec) {
        throw new NoSuchResourceType(typeName);
    }
    // specialize parameterized type
    if (!!typeArgument && hasType(typeArgument)) {
        spec = mergeOptions(spec, getType(typeArgument));
    }
    return spec;
}
exports.getResourceType = getResourceType;
function getResourceTypeAttribute(type, attributeName) {
    var resourceAttributes = getResourceType(type).Attributes;
    if (!resourceAttributes) {
        throw new NoSuchResourceTypeAttribute(type, attributeName);
    }
    var resourceAttribute = resourceAttributes[attributeName];
    if (!resourceAttribute) {
        throw new NoSuchResourceTypeAttribute(type, attributeName);
    }
    return resourceAttribute;
}
exports.getResourceTypeAttribute = getResourceTypeAttribute;
/*
 * Returns the specification of a property types
 * @param type An optionally parameterized property type (e.g. `AWS::S3::Bucket<somethingCool>.BucketEncryption<somethingAwesome>`)
 */
function getPropertyType(type) {
    // destructure property name
    var baseType, baseTypeName = '', baseTypeArgument = '';
    baseType = baseTypeName = getPropertyTypeBaseName(type); //e.g. `AWS::S3::Bucket<somethingCool>`
    if (isParameterizedTypeFormat(baseType)) {
        baseTypeName = getParameterizedTypeName(baseType); //e.g. `AWS::S3::Bucket`
        baseTypeArgument = getParameterizedTypeArgument(baseType); //e.g. `somethingCool`
    }
    var propertyType, propertyTypeName = '', propertyTypeArgument = '';
    propertyType = propertyTypeName = getPropertyTypePropertyName(type); //e.g. `BucketEncryption<somethingAwesome>`
    if (isParameterizedTypeFormat(propertyType)) {
        propertyTypeName = getParameterizedTypeName(propertyType); //e.g. `BucketEncryption`
        propertyTypeArgument = getParameterizedTypeArgument(propertyType); //e.g. `somethingAwesome`
    }
    // acquire base property type specification
    var basePropertyType = baseTypeName + "." + propertyTypeName;
    var spec = awsData_1.awsResources.PropertyTypes[basePropertyType];
    if (!spec) {
        throw new NoSuchPropertyType(basePropertyType);
    }
    // specialize parameterized type
    if (!!propertyTypeArgument && hasType(propertyTypeArgument)) {
        spec = mergeOptions(spec, getType(propertyTypeArgument));
    }
    return spec;
}
/**
 * Get a Resource or Property type from the specification.
 */
function getType(type) {
    if (isPropertyTypeFormat(type)) {
        return getPropertyType(type);
    }
    else {
        return getResourceType(type);
    }
}
exports.getType = getType;
/**
 * Returns an empty resource type specification
 */
function makeResourceTypeSpec() {
    return clone(awsData.awsResourceTypeTemplate);
}
exports.makeResourceTypeSpec = makeResourceTypeSpec;
/**
 * Returns an empty property type specification
 */
function makePropertyTypeSpec() {
    return clone(awsData.awsResourcePropertyTypeTemplate);
}
exports.makePropertyTypeSpec = makePropertyTypeSpec;
function getParameterizedTypeNameParts(type) {
    if (isPropertyTypeFormat(type)) {
        type = getPropertyTypePropertyName(type);
    }
    var parts = [];
    var partsRe = /<.*>$/;
    if (RegExp(partsRe).test(type)) {
        parts = type.match(partsRe);
    }
    return parts;
}
/**
 * Returns if a given type name has type arguments.
 */
function isParameterizedTypeFormat(type) {
    if (getParameterizedTypeNameParts(type).length > 0) {
        return true;
    }
    return false;
}
exports.isParameterizedTypeFormat = isParameterizedTypeFormat;
/**
 * Get the argument of a parameterized type.
 */
function getParameterizedTypeArgument(type) {
    if (!isParameterizedTypeFormat(type)) {
        throw new Error("Invalid parameterized type: " + type);
    }
    return getParameterizedTypeNameParts(type).shift().slice(1, -1);
}
exports.getParameterizedTypeArgument = getParameterizedTypeArgument;
/**
 * Get the name of a parameterized type.
 */
function getParameterizedTypeName(type) {
    var typeArg = getParameterizedTypeArgument(type);
    return type.replace("<" + typeArg + ">", '');
}
exports.getParameterizedTypeName = getParameterizedTypeName;
/**
 * Converts a generic type name to parameterized format
 */
function parameterizeTypeFormat(type, parameter, allowSubParameterization) {
    if (allowSubParameterization === void 0) { allowSubParameterization = false; }
    if (isParameterizedTypeFormat(type)) {
        if (allowSubParameterization) {
            var typeArg = getParameterizedTypeArgument(type);
            parameter = typeArg + "<" + parameter + ">";
            type = getParameterizedTypeName(type);
        }
        else {
            throw new Error("Type is already parameterized: " + type);
        }
    }
    return type + "<" + parameter + ">";
}
exports.parameterizeTypeFormat = parameterizeTypeFormat;
/**
 * Strips type parameterization
 */
function stripTypeParameters(input) {
    var typeParamRe = /(<.*>(?=\.))|(<.*>$)/gm;
    input = input.replace(typeParamRe, '');
    return input;
}
exports.stripTypeParameters = stripTypeParameters;
function getPropertyTypeNameParts(type) {
    var parts = [];
    var partsRe = /^([^<>]*(?:<.*>)?)\.([^<>]*(?:<.*>)?)$/;
    if (RegExp(partsRe).test(type)) {
        parts = type.match(partsRe).slice(1);
    }
    return parts;
}
/**
 * Returns the base type name of a property type name
 */
function getPropertyTypeBaseName(type) {
    if (!isPropertyTypeFormat(type)) {
        throw new Error("Invalid property type name: " + type);
    }
    return getPropertyTypeNameParts(type)[0];
}
exports.getPropertyTypeBaseName = getPropertyTypeBaseName;
/**
 * Returns the property name of a property type name
 */
function getPropertyTypePropertyName(type) {
    if (!isPropertyTypeFormat(type)) {
        throw new Error("Invalid property type name: " + type);
    }
    return getPropertyTypeNameParts(type)[1];
}
exports.getPropertyTypePropertyName = getPropertyTypePropertyName;
function isTypeFormat(type) {
    return (type.indexOf('::') != -1);
}
exports.isTypeFormat = isTypeFormat;
function isPropertyTypeFormat(type) {
    return (getPropertyTypeNameParts(type).length > 0);
}
exports.isPropertyTypeFormat = isPropertyTypeFormat;
function isResourceTypeFormat(type) {
    return (isTypeFormat(type) && !isPropertyTypeFormat(type));
}
exports.isResourceTypeFormat = isResourceTypeFormat;
function rebaseTypeFormat(baseType, type) {
    if (isPropertyTypeFormat(type)) {
        type = getPropertyTypePropertyName(type);
    }
    if (isParameterizedTypeFormat(type)) {
        var typeName = getParameterizedTypeName(type);
        var typeArgument = getParameterizedTypeArgument(type);
        // recurse on name
        typeName = rebaseTypeFormat(baseType, typeName);
        // recurse on argument
        typeArgument = rebaseTypeFormat(baseType, typeArgument);
        return parameterizeTypeFormat(typeName, typeArgument);
    }
    if (isPrimitiveType(type) || isAggregateType(type)) {
        return type;
    }
    return baseType + "." + type;
}
exports.rebaseTypeFormat = rebaseTypeFormat;
function isPrimitiveType(type) {
    if (isParameterizedTypeFormat(type)) {
        type = getParameterizedTypeName(type);
    }
    if (!!~awsData.awsPrimitiveTypes.indexOf(type)) {
        return true;
    }
    return false;
}
exports.isPrimitiveType = isPrimitiveType;
function isAggregateType(type) {
    if (isParameterizedTypeFormat(type)) {
        type = getParameterizedTypeName(type);
    }
    if (!!~awsData.awsAggregateTypes.indexOf(type)) {
        return true;
    }
    return false;
}
exports.isAggregateType = isAggregateType;
function getProperty(type, propertyName) {
    var spec = getType(type);
    // destructure parameterized property
    var propertyArgument;
    if (isParameterizedTypeFormat(propertyName)) {
        propertyArgument = getParameterizedTypeArgument(propertyName);
        propertyName = getParameterizedTypeName(propertyName);
    }
    // validate property
    var property = spec.Properties[propertyName];
    if (!property) {
        throw new NoSuchProperty(type, propertyName);
    }
    // specialize parameterized property
    if (!!propertyArgument) {
        property = makeProperty(propertyArgument);
    }
    return property;
}
exports.getProperty = getProperty;
/**
 * Returns a specification based on a parameterized property type
 */
function makeProperty(propertyType) {
    var property = clone(awsData.awsPropertyTemplate);
    if (!!propertyType) {
        var propertyTypeArgument = '';
        if (isParameterizedTypeFormat(propertyType)) {
            propertyTypeArgument = getParameterizedTypeArgument(propertyType);
        }
        // make primitive type specification
        if (isPrimitiveType(propertyType)) {
            property['PrimitiveType'] = propertyType;
            // make list type specification
        }
        else if (propertyType.indexOf('List<') == 0) {
            property['Type'] = 'List';
            if (isPrimitiveType(propertyTypeArgument)) {
                property['PrimitiveItemType'] = propertyTypeArgument;
            }
            else {
                property['ItemType'] = propertyTypeArgument;
            }
            // make map type specification
        }
        else if (propertyType.indexOf('Map<') == 0) {
            property['Type'] = 'Map';
            if (isPrimitiveType(propertyTypeArgument)) {
                property['PrimitiveItemType'] = propertyTypeArgument;
            }
            else {
                property['ItemType'] = propertyTypeArgument;
            }
            // make complex type specification
        }
        else {
            property['Type'] = propertyType;
        }
    }
    return property;
}
exports.makeProperty = makeProperty;
function getRefOverride(resourceType) {
    return awsData_1.awsResourceRefTypes[resourceType] || null;
}
exports.getRefOverride = getRefOverride;
/**
 * Checks a ResourceType or PropertyType for the presence of a propertyName
 * @param parentPropertyType a ResourceType or PropertyType
 * @param propertyName name of the property to check against the specification
 */
function isValidProperty(parentPropertyType, propertyName) {
    return getType(parentPropertyType).Properties.hasOwnProperty(propertyName);
}
exports.isValidProperty = isValidProperty;
/**
 * Checks the resource type and returns true if the propertyName is required.
 */
function isRequiredProperty(parentPropertyType, propertyName) {
    return getProperty(parentPropertyType, propertyName).Required;
}
exports.isRequiredProperty = isRequiredProperty;
function isArnProperty(propertyName) {
    // Check if the parentPropertyType exists
    return (propertyName.indexOf('Arn') != -1);
}
exports.isArnProperty = isArnProperty;
function isSinglePrimitivePropertyType(parentPropertyType, propertyName) {
    return Boolean(getProperty(parentPropertyType, propertyName).PrimitiveType);
}
exports.isPrimitiveProperty = isSinglePrimitivePropertyType;
function isAdditionalPropertiesEnabled(resourceType) {
    return getType(resourceType).AdditionalProperties === true;
}
exports.isAdditionalPropertiesEnabled = isAdditionalPropertiesEnabled;
function isPropertyTypeList(type, propertyName) {
    var propertyType = getProperty(type, propertyName).Type;
    if (!!propertyType) {
        return propertyType.indexOf('List') == 0;
    }
    return false;
}
exports.isPropertyTypeList = isPropertyTypeList;
function isPropertyTypeMap(type, propertyName) {
    var propertyType = getProperty(type, propertyName).Type;
    if (!!propertyType) {
        return propertyType.indexOf('Map') == 0;
    }
    return false;
}
exports.isPropertyTypeMap = isPropertyTypeMap;
function getPropertyTypeApi(baseType, propType, key) {
    var property = getProperty(propType, key);
    if (!property.Type) {
        return undefined;
    }
    return baseType + '.' + property.Type;
}
exports.getPropertyType = getPropertyTypeApi;
function getItemType(baseType, propType, key) {
    var property = getProperty(propType, key);
    if (!property.ItemType) {
        return undefined;
    }
    else if (isAggregateType(property.ItemType)) {
        return property.ItemType;
    }
    else {
        return baseType + '.' + property.ItemType;
    }
}
exports.getItemType = getItemType;
function hasPrimitiveItemType(type, propertyName) {
    return Boolean(getProperty(type, propertyName).PrimitiveItemType);
}
exports.hasPrimitiveItemType = hasPrimitiveItemType;
function getPrimitiveItemType(type, key) {
    return getProperty(type, key).PrimitiveItemType;
}
exports.getPrimitiveItemType = getPrimitiveItemType;
function getPrimitiveType(type, key) {
    return getProperty(type, key).PrimitiveType;
}
exports.getPrimitiveType = getPrimitiveType;
function getRequiredProperties(type) {
    var spec = getType(type);
    var requiredProperties = [];
    for (var prop in spec['Properties']) {
        if (spec['Properties'][prop]['Required'] === true) {
            requiredProperties.push(prop);
        }
    }
    return requiredProperties;
}
exports.getRequiredProperties = getRequiredProperties;
/**
 * Allows extending the AWS Resource Specification with custom definitions.
 */
function extendSpecification(spec) {
    Object.assign(awsData_1.awsResources, mergeOptions(awsData_1.awsResources, spec));
}
exports.extendSpecification = extendSpecification;
/**
 * Allows overriding definitions based on logical name.
 * Subsequent registrations DO overwrite prior ones.
 * //TODO: perhaps user defined overrides should take precedence?
 */
function registerLogicalNameOverride(name, spec) {
    // determine type section
    var typeSection = 'ResourceTypes';
    if (isPropertyTypeFormat(name)) {
        typeSection = 'PropertyTypes';
    }
    // determine prior specification
    var oldSpec = {};
    try {
        oldSpec = getType(name);
    }
    catch (e) { }
    // override
    extendSpecification((_a = {},
        _a[typeSection] = (_b = {}, _b[name] = mergeOptions(oldSpec, spec), _b),
        _a));
    var _a, _b;
}
exports.registerLogicalNameOverride = registerLogicalNameOverride;
/**
 * Allows overriding definitions based on type.
 * Subsequent registrations DO overwrite prior ones.
 */
function registerTypeOverride(name, spec) {
    // determine type section
    var typeSection = 'ResourceTypes';
    if (isPropertyTypeFormat(name)) {
        typeSection = 'PropertyTypes';
    }
    // determine prior specification
    var oldSpec = {};
    try {
        oldSpec = getType(name);
    }
    catch (e) { }
    // override
    extendSpecification((_a = {},
        _a[typeSection] = (_b = {}, _b[name] = mergeOptions(oldSpec, spec), _b),
        _a));
    var _a, _b;
}
exports.registerTypeOverride = registerTypeOverride;
function hasType(type) {
    if (isParameterizedTypeFormat(type)) {
        type = getParameterizedTypeName(type);
    }
    var spec = awsData_1.awsResources.ResourceTypes[type];
    if (!spec) {
        spec = awsData_1.awsResources.PropertyTypes[type];
    }
    return !!spec;
}
exports.hasType = hasType;
function hasProperty(type, propertyName) {
    var spec = {};
    try {
        spec = getProperty(type, propertyName);
        return true;
    }
    catch (e) { }
    return false;
}
exports.hasProperty = hasProperty;
//# sourceMappingURL=resourcesSpec.js.map