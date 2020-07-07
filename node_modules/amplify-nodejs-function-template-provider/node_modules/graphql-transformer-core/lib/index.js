"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
require("./polyfills/Object.assign");
var graphql_1 = require("graphql");
var TransformerContext_1 = require("./TransformerContext");
exports.TransformerContext = TransformerContext_1.TransformerContext;
var Transformer_1 = require("./Transformer");
exports.Transformer = Transformer_1.Transformer;
var GraphQLTransform_1 = require("./GraphQLTransform");
exports.GraphQLTransform = GraphQLTransform_1.GraphQLTransform;
var collectDirectives_1 = require("./collectDirectives");
exports.collectDirectiveNames = collectDirectives_1.collectDirectiveNames;
exports.collectDirectivesByTypeNames = collectDirectives_1.collectDirectivesByTypeNames;
var stripDirectives_1 = require("./stripDirectives");
exports.stripDirectives = stripDirectives_1.stripDirectives;
var amplifyUtils_1 = require("./util/amplifyUtils");
exports.buildAPIProject = amplifyUtils_1.buildProject;
exports.uploadAPIProject = amplifyUtils_1.uploadDeployment;
exports.migrateAPIProject = amplifyUtils_1.migrateAPIProject;
exports.revertAPIMigration = amplifyUtils_1.revertAPIMigration;
var transformConfig_1 = require("./util/transformConfig");
exports.readProjectSchema = transformConfig_1.readSchema;
exports.readProjectConfiguration = transformConfig_1.loadProject;
exports.readTransformerConfiguration = transformConfig_1.loadConfig;
exports.writeTransformerConfiguration = transformConfig_1.writeConfig;
exports.TRANSFORM_CONFIG_FILE_NAME = transformConfig_1.TRANSFORM_CONFIG_FILE_NAME;
exports.TRANSFORM_BASE_VERSION = transformConfig_1.TRANSFORM_BASE_VERSION;
exports.TRANSFORM_CURRENT_VERSION = transformConfig_1.TRANSFORM_CURRENT_VERSION;
var validation_1 = require("./validation");
__export(require("./errors"));
__export(require("./util"));
/**
 * Returns the extra set of directives that are supported by AppSync service
 */
function getAppSyncServiceExtraDirectives() {
    return graphql_1.print(validation_1.EXTRA_DIRECTIVES_DOCUMENT);
}
exports.getAppSyncServiceExtraDirectives = getAppSyncServiceExtraDirectives;
//# sourceMappingURL=index.js.map