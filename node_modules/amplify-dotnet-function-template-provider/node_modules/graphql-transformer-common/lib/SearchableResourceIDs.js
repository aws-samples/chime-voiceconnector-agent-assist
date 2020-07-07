"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var definition_1 = require("./definition");
var SearchableResourceIDs = /** @class */ (function () {
    function SearchableResourceIDs() {
    }
    SearchableResourceIDs.SearchableEventSourceMappingID = function (typeName) {
        return "Searchable" + typeName + "LambdaMapping";
    };
    SearchableResourceIDs.SearchableFilterInputTypeName = function (name) {
        var nameOverride = definition_1.DEFAULT_SCALARS[name];
        if (nameOverride) {
            return "Searchable" + nameOverride + "FilterInput";
        }
        return "Searchable" + name + "FilterInput";
    };
    return SearchableResourceIDs;
}());
exports.SearchableResourceIDs = SearchableResourceIDs;
//# sourceMappingURL=SearchableResourceIDs.js.map