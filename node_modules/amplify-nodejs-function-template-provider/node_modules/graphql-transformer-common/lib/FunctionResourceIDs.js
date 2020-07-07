"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var md5 = require("md5");
var FunctionResourceIDs = /** @class */ (function () {
    function FunctionResourceIDs() {
    }
    FunctionResourceIDs.FunctionDataSourceID = function (name, region) {
        return "" + util_1.simplifyName(name) + util_1.simplifyName(region || '') + "LambdaDataSource";
    };
    FunctionResourceIDs.FunctionIAMRoleID = function (name, region) {
        return FunctionResourceIDs.FunctionDataSourceID(name, region) + "Role";
    };
    FunctionResourceIDs.FunctionIAMRoleName = function (name, withEnv) {
        if (withEnv === void 0) { withEnv = false; }
        if (withEnv) {
            return "" + util_1.simplifyName(name).slice(0, 22) + md5(name).slice(0, 4);
        }
        return "" + util_1.simplifyName(name).slice(0, 32) + md5(name).slice(0, 4);
    };
    FunctionResourceIDs.FunctionAppSyncFunctionConfigurationID = function (name, region) {
        return "Invoke" + FunctionResourceIDs.FunctionDataSourceID(name, region);
    };
    return FunctionResourceIDs;
}());
exports.FunctionResourceIDs = FunctionResourceIDs;
//# sourceMappingURL=FunctionResourceIDs.js.map