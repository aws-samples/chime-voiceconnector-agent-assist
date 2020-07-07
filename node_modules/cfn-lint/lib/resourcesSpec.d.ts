import * as awsData from './awsData';
import CustomError = require('./util/CustomError');
export declare class NoSuchProperty extends CustomError {
    type: string;
    propertyName: string;
    constructor(type: string, propertyName: string);
}
export declare class NoSuchResourceType extends CustomError {
    resourceType: string;
    constructor(type: string);
}
export declare class NoSuchPropertyType extends CustomError {
    propertyType: string;
    constructor(type: string);
}
export declare class NoSuchResourceTypeAttribute extends CustomError {
    resourceType: string;
    attributeName: string;
    constructor(type: string, attributeName: string);
}
export declare function getResourceType(type: string): awsData.ResourceType;
export declare function getResourceTypeAttribute(type: string, attributeName: string): awsData.Attribute;
/**
 * Get a Resource or Property type from the specification.
 */
export declare function getType(type: string): awsData.Type;
/**
 * Returns an empty resource type specification
 */
export declare function makeResourceTypeSpec(): awsData.ResourceType;
/**
 * Returns an empty property type specification
 */
export declare function makePropertyTypeSpec(): awsData.ResourcePropertyType;
/**
 * Returns if a given type name has type arguments.
 */
export declare function isParameterizedTypeFormat(type: string): boolean;
/**
 * Get the argument of a parameterized type.
 */
export declare function getParameterizedTypeArgument(type: string): string;
/**
 * Get the name of a parameterized type.
 */
export declare function getParameterizedTypeName(type: string): string;
/**
 * Converts a generic type name to parameterized format
 */
export declare function parameterizeTypeFormat(type: string, parameter: string, allowSubParameterization?: boolean): string;
/**
 * Strips type parameterization
 */
export declare function stripTypeParameters(input: string): string;
/**
 * Returns the base type name of a property type name
 */
export declare function getPropertyTypeBaseName(type: string): string;
/**
 * Returns the property name of a property type name
 */
export declare function getPropertyTypePropertyName(type: string): string;
export declare function isTypeFormat(type: string): boolean;
export declare function isPropertyTypeFormat(type: string): boolean;
export declare function isResourceTypeFormat(type: string): boolean;
export declare function rebaseTypeFormat(baseType: string, type: string): string;
export declare function isPrimitiveType(type: string): boolean;
export declare function isAggregateType(type: string): boolean;
export declare function getProperty(type: string, propertyName: string): awsData.Property;
/**
 * Returns a specification based on a parameterized property type
 */
export declare function makeProperty(propertyType?: string): awsData.PropertyBase | awsData.Property;
export declare function getRefOverride(resourceType: string): string | null;
/**
 * Checks a ResourceType or PropertyType for the presence of a propertyName
 * @param parentPropertyType a ResourceType or PropertyType
 * @param propertyName name of the property to check against the specification
 */
export declare function isValidProperty(parentPropertyType: string, propertyName: string): boolean;
/**
 * Checks the resource type and returns true if the propertyName is required.
 */
export declare function isRequiredProperty(parentPropertyType: string, propertyName: string): boolean;
export declare function isArnProperty(propertyName: string): boolean;
declare function isSinglePrimitivePropertyType(parentPropertyType: string, propertyName: string): boolean;
export { isSinglePrimitivePropertyType as isPrimitiveProperty };
export declare function isAdditionalPropertiesEnabled(resourceType: string): boolean;
export declare function isPropertyTypeList(type: string, propertyName: string): boolean;
export declare function isPropertyTypeMap(type: string, propertyName: string): boolean;
declare function getPropertyTypeApi(baseType: string, propType: string, key: string): string | undefined;
export { getPropertyTypeApi as getPropertyType };
export declare function getItemType(baseType: string, propType: string, key: string): string | undefined;
export declare function hasPrimitiveItemType(type: string, propertyName: string): boolean;
export declare function getPrimitiveItemType(type: string, key: string): awsData.AWSPrimitiveType | undefined;
export declare function getPrimitiveType(type: string, key: string): awsData.AWSPrimitiveType | undefined;
export declare function getRequiredProperties(type: string): string[];
/**
 * Allows extending the AWS Resource Specification with custom definitions.
 */
export declare function extendSpecification(spec: any): void;
/**
 * Allows overriding definitions based on logical name.
 * Subsequent registrations DO overwrite prior ones.
 * //TODO: perhaps user defined overrides should take precedence?
 */
export declare function registerLogicalNameOverride(name: string, spec: any): void;
/**
 * Allows overriding definitions based on type.
 * Subsequent registrations DO overwrite prior ones.
 */
export declare function registerTypeOverride(name: string, spec: any): void;
export declare function hasType(type: string): boolean;
export declare function hasProperty(type: string, propertyName: string): boolean;
