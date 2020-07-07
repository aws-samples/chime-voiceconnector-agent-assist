"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var print_1 = require("./print");
var ast_1 = require("./ast");
var RESOLVER_VERSION_ID = '2018-05-29';
var ElasticsearchMappingTemplate = /** @class */ (function () {
    function ElasticsearchMappingTemplate() {
    }
    /**
     * Create a mapping template for ES.
     */
    ElasticsearchMappingTemplate.genericTemplte = function (_a) {
        var operation = _a.operation, path = _a.path, params = _a.params;
        return ast_1.obj({
            version: ast_1.str(RESOLVER_VERSION_ID),
            operation: operation,
            path: path,
            params: params,
        });
    };
    /**
     * Create a search item resolver template.
     * @param size the size limit
     * @param from the next token
     * @param query the query
     */
    ElasticsearchMappingTemplate.searchItem = function (_a) {
        var query = _a.query, size = _a.size, search_after = _a.search_after, path = _a.path, sort = _a.sort;
        return ast_1.obj({
            version: ast_1.str(RESOLVER_VERSION_ID),
            operation: ast_1.str('GET'),
            path: path,
            params: ast_1.obj({
                body: ast_1.raw("{\n                #if( $context.args.nextToken )\"search_after\": " + print_1.print(search_after) + ", #end\n                \"size\": " + print_1.print(size) + ",\n                \"sort\": " + print_1.print(sort) + ",\n                \"query\": " + print_1.print(query) + "\n                }"),
            }),
        });
    };
    return ElasticsearchMappingTemplate;
}());
exports.ElasticsearchMappingTemplate = ElasticsearchMappingTemplate;
//# sourceMappingURL=elasticsearch.js.map