"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var cloudform_types_1 = require("cloudform-types");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_1 = require("graphql");
var stripDirectives_1 = require("./stripDirectives");
var SchemaResourceUtil_1 = require("./util/SchemaResourceUtil");
var splitStack_1 = require("./util/splitStack");
var graphql_transformer_common_2 = require("graphql-transformer-common");
var TransformFormatter = /** @class */ (function () {
    function TransformFormatter() {
        this.schemaResourceUtil = new SchemaResourceUtil_1.SchemaResourceUtil();
    }
    /**
     * Formats the ctx into a set of deployment resources.
     *
     * At this point, all resources that were created by scanning/reading
     * GraphQL schema and cloudformation template files have been collected into
     * a singular ctx.template object. Doing this allows the CLI to perform
     * sophisticated mapping, de-duplication, stack references with correct
     * import/export values, and other nice cleanup routines. Once this is
     * complete, the singular object can be split into the necessary stacks
     * (splitStack) for each GraphQL resource.
     *
     * @param ctx the transformer context.
     * Returns all the deployment resources for the transformation.
     */
    TransformFormatter.prototype.format = function (ctx) {
        var _a, _b;
        ctx.mergeConditions(this.schemaResourceUtil.makeEnvironmentConditions());
        var resolversFunctionsAndSchema = this.collectResolversFunctionsAndSchema(ctx);
        var defaultDependencies = [graphql_transformer_common_2.ResourceConstants.RESOURCES.GraphQLSchemaLogicalID];
        if (ctx.getResource(graphql_transformer_common_2.ResourceConstants.RESOURCES.NoneDataSource)) {
            defaultDependencies.push(graphql_transformer_common_2.ResourceConstants.RESOURCES.NoneDataSource);
        }
        var nestedStacks = splitStack_1.default({
            stack: ctx.template,
            stackRules: ctx.getStackMapping(),
            defaultParameterValues: (_a = {},
                _a[graphql_transformer_common_2.ResourceConstants.PARAMETERS.AppSyncApiId] = cloudform_types_1.Fn.GetAtt(graphql_transformer_common_2.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
                _a),
            defaultParameterDefinitions: (_b = {},
                _b[graphql_transformer_common_2.ResourceConstants.PARAMETERS.AppSyncApiId] = new cloudform_types_1.StringParameter({
                    Description: "The id of the AppSync API associated with this project.",
                }),
                _b),
            deployment: {
                deploymentBucketParameterName: graphql_transformer_common_2.ResourceConstants.PARAMETERS.S3DeploymentBucket,
                deploymentKeyParameterName: graphql_transformer_common_2.ResourceConstants.PARAMETERS.S3DeploymentRootKey,
            },
            importExportPrefix: cloudform_types_1.Fn.Ref(graphql_transformer_common_2.ResourceConstants.PARAMETERS.AppSyncApiId),
            defaultDependencies: defaultDependencies,
        });
        return __assign(__assign({}, nestedStacks), resolversFunctionsAndSchema);
    };
    /**
     * Schema helper to pull resources from the context and output the final schema resource.
     */
    TransformFormatter.prototype.buildSchema = function (ctx) {
        var mutationNode = ctx.getMutation();
        var queryNode = ctx.getQuery();
        var subscriptionNode = ctx.getSubscription();
        var includeMutation = true;
        var includeQuery = true;
        var includeSubscription = true;
        if (!mutationNode || mutationNode.fields.length === 0) {
            delete ctx.nodeMap.Mutation;
            includeMutation = false;
        }
        if (!queryNode || queryNode.fields.length === 0) {
            delete ctx.nodeMap.Query;
            includeQuery = false;
        }
        if (!subscriptionNode || subscriptionNode.fields.length === 0) {
            delete ctx.nodeMap.Subscription;
            includeSubscription = false;
        }
        var ops = [];
        if (includeQuery) {
            ops.push(graphql_transformer_common_1.makeOperationType('query', queryNode.name.value));
        }
        if (includeMutation) {
            ops.push(graphql_transformer_common_1.makeOperationType('mutation', mutationNode.name.value));
        }
        if (includeSubscription) {
            ops.push(graphql_transformer_common_1.makeOperationType('subscription', subscriptionNode.name.value));
        }
        var schema = graphql_transformer_common_1.makeSchema(ops);
        ctx.putSchema(schema);
        var astSansDirectives = stripDirectives_1.stripDirectives({
            kind: 'Document',
            definitions: Object.keys(ctx.nodeMap).map(function (k) { return ctx.getType(k); }),
        }, ['aws_subscribe', 'aws_auth', 'aws_api_key', 'aws_iam', 'aws_oidc', 'aws_cognito_user_pools', 'deprecated']);
        var SDL = graphql_1.print(astSansDirectives);
        return SDL;
    };
    /**
     * Builds the schema and creates the schema record to pull from S3.
     * Returns the schema SDL text as a string.
     */
    TransformFormatter.prototype.buildAndSetSchema = function (ctx) {
        var SDL = this.buildSchema(ctx);
        var schemaResource = this.schemaResourceUtil.makeAppSyncSchema();
        ctx.setResource(graphql_transformer_common_2.ResourceConstants.RESOURCES.GraphQLSchemaLogicalID, schemaResource);
        return SDL;
    };
    TransformFormatter.prototype.collectResolversFunctionsAndSchema = function (ctx) {
        var _a;
        var resolverParams = this.schemaResourceUtil.makeResolverS3RootParams();
        ctx.mergeParameters(resolverParams.Parameters);
        var templateResources = ctx.template.Resources;
        var resolverMap = {};
        var pipelineFunctionMap = {};
        var functionsMap = {};
        for (var _i = 0, _b = Object.keys(templateResources); _i < _b.length; _i++) {
            var resourceName = _b[_i];
            var resource = templateResources[resourceName];
            if (resource.Type === 'AWS::AppSync::Resolver') {
                var resourceResolverMap = this.replaceResolverRecord(resourceName, ctx);
                resolverMap = __assign(__assign({}, resolverMap), resourceResolverMap);
            }
            else if (resource.Type === 'AWS::AppSync::FunctionConfiguration') {
                var functionConfigMap = this.replaceFunctionConfigurationRecord(resourceName, ctx);
                pipelineFunctionMap = __assign(__assign({}, pipelineFunctionMap), functionConfigMap);
            }
            else if (resource.Type === 'AWS::Lambda::Function') {
                functionsMap = __assign(__assign({}, functionsMap), (_a = {}, _a[resourceName + ".zip"] = ctx.metadata.get(resourceName), _a));
            }
        }
        var schema = this.buildAndSetSchema(ctx);
        return {
            resolvers: resolverMap,
            functions: functionsMap,
            pipelineFunctions: pipelineFunctionMap,
            schema: schema,
        };
    };
    TransformFormatter.prototype.replaceResolverRecord = function (resourceName, ctx) {
        var _a;
        var resolverResource = ctx.template.Resources[resourceName];
        var requestMappingTemplate = resolverResource.Properties.RequestMappingTemplate;
        var responseMappingTemplate = resolverResource.Properties.ResponseMappingTemplate;
        // If the templates are not strings. aka they use CF intrinsic functions don't rewrite.
        if (typeof requestMappingTemplate === 'string' && typeof responseMappingTemplate === 'string') {
            var reqType = resolverResource.Properties.TypeName;
            var reqFieldName = resolverResource.Properties.FieldName;
            var reqFileName = reqType + "." + reqFieldName + ".req.vtl";
            var respType = resolverResource.Properties.TypeName;
            var respFieldName = resolverResource.Properties.FieldName;
            var respFileName = respType + "." + respFieldName + ".res.vtl";
            var updatedResolverResource = this.schemaResourceUtil.updateResolverResource(resolverResource);
            ctx.setResource(resourceName, updatedResolverResource);
            return _a = {},
                _a[reqFileName] = requestMappingTemplate,
                _a[respFileName] = responseMappingTemplate,
                _a;
        }
        return {};
    };
    TransformFormatter.prototype.replaceFunctionConfigurationRecord = function (resourceName, ctx) {
        var _a;
        var functionConfiguration = ctx.template.Resources[resourceName];
        var requestMappingTemplate = functionConfiguration.Properties.RequestMappingTemplate;
        var responseMappingTemplate = functionConfiguration.Properties.ResponseMappingTemplate;
        // If the templates are not strings. aka they use CF intrinsic functions don't rewrite.
        if (typeof requestMappingTemplate === 'string' && typeof responseMappingTemplate === 'string') {
            var reqFileName = functionConfiguration.Properties.Name + ".req.vtl";
            var respFileName = functionConfiguration.Properties.Name + ".res.vtl";
            var updatedResolverResource = this.schemaResourceUtil.updateFunctionConfigurationResource(functionConfiguration);
            ctx.setResource(resourceName, updatedResolverResource);
            return _a = {},
                _a[reqFileName] = requestMappingTemplate,
                _a[respFileName] = responseMappingTemplate,
                _a;
        }
        return {};
    };
    return TransformFormatter;
}());
exports.TransformFormatter = TransformFormatter;
//# sourceMappingURL=TransformFormatter.js.map