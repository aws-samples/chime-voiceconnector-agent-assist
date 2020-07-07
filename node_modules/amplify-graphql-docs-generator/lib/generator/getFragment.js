"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFields_1 = require("./getFields");
function getFragment(typeObj, schema, depth, filterFields = [], name, external = false, options) {
    const subFields = (typeObj && typeObj.getFields && typeObj.getFields()) || [];
    const filterFieldNames = filterFields.map(f => f.name);
    const fields = Object.keys(subFields)
        .map(field => getFields_1.default(subFields[field], schema, depth - 1, options))
        .filter(field => field && !filterFieldNames.includes(field.name));
    if (fields.length) {
        return {
            on: typeObj.name,
            fields,
            external,
            name: name || `${typeObj.name}Fragment`,
        };
    }
}
exports.default = getFragment;
//# sourceMappingURL=getFragment.js.map