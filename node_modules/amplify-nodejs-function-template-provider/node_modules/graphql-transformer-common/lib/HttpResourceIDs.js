"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var HttpResourceIDs = /** @class */ (function () {
    function HttpResourceIDs() {
    }
    HttpResourceIDs.HttpDataSourceID = function (baseURL) {
        // strip the special characters out of baseURL to make the data source ID
        return util_1.graphqlName(baseURL) + "DataSource";
    };
    return HttpResourceIDs;
}());
exports.HttpResourceIDs = HttpResourceIDs;
//# sourceMappingURL=HttpResourceIDs.js.map