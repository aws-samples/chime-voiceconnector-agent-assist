"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const getType_1 = require("./getType");
const S3_FIELD_NAMES = ['bucket', 'key', 'region'];
function isS3Object(typeObj) {
    if (graphql_1.isObjectType(typeObj)) {
        const fields = typeObj.getFields();
        const fieldName = typeObj.name;
        const hasS3Fields = S3_FIELD_NAMES.every(s3Field => {
            const field = fields[s3Field];
            try {
                const type = getType_1.default(field.type);
                return field && graphql_1.isScalarType(type) && type.name === 'String';
            }
            catch (e) {
                return false;
            }
        });
        return hasS3Fields && fieldName === 'S3Object';
    }
    return false;
}
exports.default = isS3Object;
//# sourceMappingURL=isS3Object.js.map