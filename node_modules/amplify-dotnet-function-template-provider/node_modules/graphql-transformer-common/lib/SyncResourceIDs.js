"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var SyncResourceIDs = /** @class */ (function () {
    function SyncResourceIDs() {
    }
    SyncResourceIDs.syncFunctionID = function (name, region) {
        return "" + util_1.simplifyName(name) + util_1.simplifyName(region || '') + "Role";
    };
    SyncResourceIDs.syncDataSourceID = 'DataStore';
    SyncResourceIDs.syncTableName = 'AmplifyDataStore';
    SyncResourceIDs.syncPrimaryKey = 'ds_pk';
    SyncResourceIDs.syncRangeKey = 'ds_sk';
    SyncResourceIDs.syncIAMRoleID = 'DataStoreIAMRole';
    SyncResourceIDs.syncIAMRoleName = 'AmplifyDataStoreIAMRole';
    SyncResourceIDs.syncFunctionRoleName = 'DataStoreLambdaRole';
    return SyncResourceIDs;
}());
exports.SyncResourceIDs = SyncResourceIDs;
//# sourceMappingURL=SyncResourceIDs.js.map