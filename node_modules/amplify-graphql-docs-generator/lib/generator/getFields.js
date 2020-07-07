"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const getFragment_1 = require("./getFragment");
const getType_1 = require("./utils/getType");
const isS3Object_1 = require("./utils/isS3Object");
function getFields(field, schema, depth = 2, options) {
    const fieldType = getType_1.default(field.type);
    const renderS3FieldFragment = options.useExternalFragmentForS3Object && isS3Object_1.default(fieldType);
    const subFields = !renderS3FieldFragment && (graphql_1.isObjectType(fieldType) || graphql_1.isInterfaceType(fieldType)) ? fieldType.getFields() : [];
    const subFragments = graphql_1.isInterfaceType(fieldType) || graphql_1.isUnionType(fieldType) ? schema.getPossibleTypes(fieldType) : {};
    if (depth < 1 && !(graphql_1.isScalarType(fieldType) || graphql_1.isEnumType(fieldType))) {
        return;
    }
    const fields = Object.keys(subFields)
        .map(fieldName => {
        const subField = subFields[fieldName];
        return getFields(subField, schema, depth - 1, options);
    })
        .filter(f => f);
    const fragments = Object.keys(subFragments)
        .map(fragment => getFragment_1.default(subFragments[fragment], schema, depth, fields, null, false, options))
        .filter(f => f);
    // Special treatment for S3 input
    // Swift SDK needs S3 Object to have fragment
    if (renderS3FieldFragment) {
        fragments.push(getFragment_1.default(fieldType, schema, depth, [], 'S3Object', true, options));
    }
    // if the current field is an object and none of the subfields are included, don't include the field itself
    if (!(graphql_1.isScalarType(fieldType) || graphql_1.isEnumType(fieldType)) && fields.length === 0 && fragments.length === 0 && !renderS3FieldFragment) {
        return;
    }
    return {
        name: field.name,
        fields,
        fragments,
        hasBody: !!(fields.length || fragments.length),
    };
}
exports.default = getFields;
//# sourceMappingURL=getFields.js.map