"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var language_1 = require("graphql/language");
var validation_1 = require("graphql/validation");
var buildASTSchema_1 = require("graphql/utilities/buildASTSchema");
// Spec Section: "Subscriptions with Single Root Field"
var SingleFieldSubscriptions_1 = require("graphql/validation/rules/SingleFieldSubscriptions");
// Spec Section: "Fragment Spread Type Existence"
var KnownTypeNames_1 = require("graphql/validation/rules/KnownTypeNames");
// Spec Section: "Fragments on Composite Types"
var FragmentsOnCompositeTypes_1 = require("graphql/validation/rules/FragmentsOnCompositeTypes");
// Spec Section: "Variables are Input Types"
var VariablesAreInputTypes_1 = require("graphql/validation/rules/VariablesAreInputTypes");
// Spec Section: "Leaf Field Selections"
var ScalarLeafs_1 = require("graphql/validation/rules/ScalarLeafs");
// Spec Section: "Field Selections on Objects, Interfaces, and Unions Types"
var FieldsOnCorrectType_1 = require("graphql/validation/rules/FieldsOnCorrectType");
// Spec Section: "Directives Are Defined"
var KnownDirectives_1 = require("graphql/validation/rules/KnownDirectives");
// Spec Section: "Argument Names"
var KnownArgumentNames_1 = require("graphql/validation/rules/KnownArgumentNames");
// Spec Section: "Argument Uniqueness"
var UniqueArgumentNames_1 = require("graphql/validation/rules/UniqueArgumentNames");
// Spec Section: "Value Type Correctness"
var ValuesOfCorrectType_1 = require("graphql/validation/rules/ValuesOfCorrectType");
// Spec Section: "All Variable Usages Are Allowed"
var VariablesInAllowedPosition_1 = require("graphql/validation/rules/VariablesInAllowedPosition");
// Spec Section: "Field Selection Merging"
var OverlappingFieldsCanBeMerged_1 = require("graphql/validation/rules/OverlappingFieldsCanBeMerged");
// Spec Section: "Input Object Field Uniqueness"
var UniqueInputFieldNames_1 = require("graphql/validation/rules/UniqueInputFieldNames");
var ProvidedRequiredArguments_1 = require("graphql/validation/rules/ProvidedRequiredArguments");
var UniqueOperationNames_1 = require("graphql/validation/rules/UniqueOperationNames");
var LoneAnonymousOperation_1 = require("graphql/validation/rules/LoneAnonymousOperation");
var UniqueFragmentNames_1 = require("graphql/validation/rules/UniqueFragmentNames");
var KnownFragmentNames_1 = require("graphql/validation/rules/KnownFragmentNames");
var NoUnusedFragments_1 = require("graphql/validation/rules/NoUnusedFragments");
var PossibleFragmentSpreads_1 = require("graphql/validation/rules/PossibleFragmentSpreads");
var NoFragmentCycles_1 = require("graphql/validation/rules/NoFragmentCycles");
var UniqueVariableNames_1 = require("graphql/validation/rules/UniqueVariableNames");
var NoUndefinedVariables_1 = require("graphql/validation/rules/NoUndefinedVariables");
var NoUnusedVariables_1 = require("graphql/validation/rules/NoUnusedVariables");
var UniqueDirectivesPerLocation_1 = require("graphql/validation/rules/UniqueDirectivesPerLocation");
/**
 * This set includes all validation rules defined by the GraphQL spec.
 *
 * The order of the rules in this list has been adjusted to lead to the
 * most clear output when encountering multiple validation errors.
 */
exports.specifiedRules = [
    UniqueOperationNames_1.UniqueOperationNames,
    LoneAnonymousOperation_1.LoneAnonymousOperation,
    SingleFieldSubscriptions_1.SingleFieldSubscriptions,
    KnownTypeNames_1.KnownTypeNames,
    FragmentsOnCompositeTypes_1.FragmentsOnCompositeTypes,
    VariablesAreInputTypes_1.VariablesAreInputTypes,
    ScalarLeafs_1.ScalarLeafs,
    FieldsOnCorrectType_1.FieldsOnCorrectType,
    UniqueFragmentNames_1.UniqueFragmentNames,
    KnownFragmentNames_1.KnownFragmentNames,
    NoUnusedFragments_1.NoUnusedFragments,
    PossibleFragmentSpreads_1.PossibleFragmentSpreads,
    NoFragmentCycles_1.NoFragmentCycles,
    UniqueVariableNames_1.UniqueVariableNames,
    NoUndefinedVariables_1.NoUndefinedVariables,
    NoUnusedVariables_1.NoUnusedVariables,
    KnownDirectives_1.KnownDirectives,
    UniqueDirectivesPerLocation_1.UniqueDirectivesPerLocation,
    KnownArgumentNames_1.KnownArgumentNames,
    UniqueArgumentNames_1.UniqueArgumentNames,
    ValuesOfCorrectType_1.ValuesOfCorrectType,
    ProvidedRequiredArguments_1.ProvidedRequiredArguments,
    VariablesInAllowedPosition_1.VariablesInAllowedPosition,
    OverlappingFieldsCanBeMerged_1.OverlappingFieldsCanBeMerged,
    UniqueInputFieldNames_1.UniqueInputFieldNames,
];
var EXTRA_SCALARS_DOCUMENT = language_1.parse("\nscalar AWSDate\nscalar AWSTime\nscalar AWSDateTime\nscalar AWSTimestamp\nscalar AWSEmail\nscalar AWSJSON\nscalar AWSURL\nscalar AWSPhone\nscalar AWSIPAddress\nscalar BigInt\nscalar Double\n");
exports.EXTRA_DIRECTIVES_DOCUMENT = language_1.parse("\ndirective @aws_subscribe(mutations: [String!]!) on FIELD_DEFINITION\ndirective @aws_auth(cognito_groups: [String!]!) on FIELD_DEFINITION\ndirective @aws_api_key on FIELD_DEFINITION | OBJECT\ndirective @aws_iam on FIELD_DEFINITION | OBJECT\ndirective @aws_oidc on FIELD_DEFINITION | OBJECT\ndirective @aws_cognito_user_pools(cognito_groups: [String!]) on FIELD_DEFINITION | OBJECT\n\n# Allows transformer libraries to deprecate directive arguments.\ndirective @deprecated(reason: String) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION | ENUM | ENUM_VALUE\n");
// As query type is mandatory in the schema we've to append a dummy one if it is not present
var NOOP_QUERY = language_1.parse("\ntype Query {\n  noop: String\n}\n");
exports.validateModelSchema = function (doc) {
    var _a;
    var fullDocument = {
        kind: language_1.Kind.DOCUMENT,
        definitions: __spreadArrays(exports.EXTRA_DIRECTIVES_DOCUMENT.definitions, doc.definitions, EXTRA_SCALARS_DOCUMENT.definitions),
    };
    var schemaDef = doc.definitions.find(function (d) { return d.kind === language_1.Kind.SCHEMA_DEFINITION; });
    var queryOperation = schemaDef ? schemaDef.operationTypes.find(function (o) { return o.operation === 'query'; }) : undefined;
    var queryName = queryOperation ? queryOperation.type.name.value : 'Query';
    var existingQueryType = doc.definitions.find(function (d) { return d.kind !== language_1.Kind.DIRECTIVE_DEFINITION && d.kind !== language_1.Kind.SCHEMA_DEFINITION && d.name && d.name.value === queryName; });
    if (!existingQueryType) {
        (_a = fullDocument.definitions).push.apply(_a, NOOP_QUERY.definitions);
    }
    var schema = buildASTSchema_1.buildASTSchema(fullDocument);
    return validation_1.validate(schema, fullDocument, exports.specifiedRules);
};
//# sourceMappingURL=validation.js.map