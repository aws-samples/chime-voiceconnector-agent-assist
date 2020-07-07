"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var appSync_1 = require("cloudform-types/types/appSync");
var cloudform_types_1 = require("cloudform-types");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var RESOLVERS_DIRECTORY_NAME = 'resolvers';
var STACKS_DIRECTORY_NAME = 'stacks';
var SchemaResourceUtil = /** @class */ (function () {
    function SchemaResourceUtil() {
    }
    SchemaResourceUtil.prototype.makeResolverS3RootParams = function () {
        var _a;
        return {
            Parameters: (_a = {},
                _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env] = new cloudform_types_1.StringParameter({
                    Description: "The environment name. e.g. Dev, Test, or Production",
                    Default: graphql_transformer_common_1.ResourceConstants.NONE,
                }),
                _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket] = new cloudform_types_1.StringParameter({
                    Description: 'The S3 bucket containing all deployment assets for the project.',
                }),
                _a[graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey] = new cloudform_types_1.StringParameter({
                    Description: 'An S3 key relative to the S3DeploymentBucket that points to the root of the deployment directory.',
                }),
                _a),
        };
    };
    SchemaResourceUtil.prototype.makeEnvironmentConditions = function () {
        var _a;
        return _a = {},
            _a[graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter] = cloudform_types_1.Fn.Not(cloudform_types_1.Fn.Equals(cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env), graphql_transformer_common_1.ResourceConstants.NONE)),
            _a;
    };
    SchemaResourceUtil.prototype.updateResolverResource = function (resource) {
        resource.Properties.RequestMappingTemplateS3Location = cloudform_types_1.Fn.Sub('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/resolvers/${ResolverFileName}', {
            S3DeploymentBucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
            S3DeploymentRootKey: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
            ResolverFileName: cloudform_types_1.Fn.Join('.', [resource.Properties.TypeName, resource.Properties.FieldName, 'req', 'vtl']),
        });
        resource.Properties.ResponseMappingTemplateS3Location = cloudform_types_1.Fn.Sub('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/resolvers/${ResolverFileName}', {
            S3DeploymentBucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
            S3DeploymentRootKey: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
            ResolverFileName: cloudform_types_1.Fn.Join('.', [resource.Properties.TypeName, resource.Properties.FieldName, 'res', 'vtl']),
        });
        delete resource.Properties.RequestMappingTemplate;
        delete resource.Properties.ResponseMappingTemplate;
        return resource;
    };
    SchemaResourceUtil.prototype.updateFunctionConfigurationResource = function (resource) {
        resource.Properties.RequestMappingTemplateS3Location = cloudform_types_1.Fn.Sub('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/pipelineFunctions/${ResolverFileName}', {
            S3DeploymentBucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
            S3DeploymentRootKey: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
            ResolverFileName: cloudform_types_1.Fn.Join('.', [resource.Properties.Name, 'req', 'vtl']),
        });
        resource.Properties.ResponseMappingTemplateS3Location = cloudform_types_1.Fn.Sub('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/pipelineFunctions/${ResolverFileName}', {
            S3DeploymentBucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
            S3DeploymentRootKey: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
            ResolverFileName: cloudform_types_1.Fn.Join('.', [resource.Properties.Name, 'res', 'vtl']),
        });
        delete resource.Properties.RequestMappingTemplate;
        delete resource.Properties.ResponseMappingTemplate;
        return resource;
    };
    SchemaResourceUtil.prototype.makeAppSyncSchema = function (schema) {
        if (schema) {
            return new appSync_1.default.GraphQLSchema({
                ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
                Definition: schema,
            });
        }
        return new appSync_1.default.GraphQLSchema({
            ApiId: cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            DefinitionS3Location: cloudform_types_1.Fn.Sub('s3://${S3DeploymentBucket}/${S3DeploymentRootKey}/schema.graphql', {
                S3DeploymentBucket: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                S3DeploymentRootKey: cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
            }),
        });
    };
    return SchemaResourceUtil;
}());
exports.SchemaResourceUtil = SchemaResourceUtil;
//# sourceMappingURL=SchemaResourceUtil.js.map