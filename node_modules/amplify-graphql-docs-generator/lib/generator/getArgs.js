"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getType_1 = require("./utils/getType");
const isList_1 = require("./utils/isList");
const isRequired_1 = require("./utils/isRequired");
const isRequiredList_1 = require("./utils/isRequiredList");
function getArgs(args) {
    const argMaps = args.map((arg) => ({
        name: arg.name,
        type: getType_1.default(arg.type).name,
        isRequired: isRequired_1.default(arg.type),
        isList: isList_1.default(arg.type),
        isListRequired: isRequiredList_1.default(arg.type),
        defaultValue: arg.defaultValue,
    }));
    return argMaps;
}
exports.default = getArgs;
//# sourceMappingURL=getArgs.js.map