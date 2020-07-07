"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_1 = require("./ast");
var HttpMappingTemplate = /** @class */ (function () {
    function HttpMappingTemplate() {
    }
    /**
     * Create a mapping template for HTTP GET requests.
     */
    HttpMappingTemplate.getRequest = function (_a) {
        var resourcePath = _a.resourcePath, params = _a.params;
        return ast_1.obj({
            version: ast_1.str(this.RESOLVER_VERSION_ID),
            method: ast_1.str('GET'),
            resourcePath: ast_1.str(resourcePath),
            params: params,
        });
    };
    /**
     * Create a mapping template for HTTP POST requests.
     */
    HttpMappingTemplate.postRequest = function (_a) {
        var resourcePath = _a.resourcePath, params = _a.params;
        return ast_1.obj({
            version: ast_1.str(this.RESOLVER_VERSION_ID),
            method: ast_1.str('POST'),
            resourcePath: ast_1.str(resourcePath),
            params: params,
        });
    };
    /**
     * Create a mapping template for HTTP PUT requests.
     */
    HttpMappingTemplate.putRequest = function (_a) {
        var resourcePath = _a.resourcePath, params = _a.params;
        return ast_1.obj({
            version: ast_1.str(this.RESOLVER_VERSION_ID),
            method: ast_1.str('PUT'),
            resourcePath: ast_1.str(resourcePath),
            params: params,
        });
    };
    /**
     * Create a mapping template for HTTP DELETE requests.
     */
    HttpMappingTemplate.deleteRequest = function (_a) {
        var resourcePath = _a.resourcePath, params = _a.params;
        return ast_1.obj({
            version: ast_1.str(this.RESOLVER_VERSION_ID),
            method: ast_1.str('DELETE'),
            resourcePath: ast_1.str(resourcePath),
            params: params,
        });
    };
    /**
     * Create a mapping template for HTTP PATCH requests.
     */
    HttpMappingTemplate.patchRequest = function (_a) {
        var resourcePath = _a.resourcePath, params = _a.params;
        return ast_1.obj({
            version: ast_1.str(this.RESOLVER_VERSION_ID),
            method: ast_1.str('PATCH'),
            resourcePath: ast_1.str(resourcePath),
            params: params,
        });
    };
    HttpMappingTemplate.RESOLVER_VERSION_ID = '2018-05-29';
    return HttpMappingTemplate;
}());
exports.HttpMappingTemplate = HttpMappingTemplate;
//# sourceMappingURL=http.js.map