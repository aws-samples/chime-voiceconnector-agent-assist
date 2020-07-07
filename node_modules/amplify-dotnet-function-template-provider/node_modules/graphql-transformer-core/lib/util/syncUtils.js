"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cloudform_types_1 = require("cloudform-types");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var SyncUtils;
(function (SyncUtils) {
    function createSyncTable() {
        return new cloudform_types_1.DynamoDB.Table({
            TableName: joinWithEnv('-', [graphql_transformer_common_1.SyncResourceIDs.syncTableName, cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')]),
            AttributeDefinitions: [
                {
                    AttributeName: graphql_transformer_common_1.SyncResourceIDs.syncPrimaryKey,
                    AttributeType: 'S',
                },
                {
                    AttributeName: graphql_transformer_common_1.SyncResourceIDs.syncRangeKey,
                    AttributeType: 'S',
                },
            ],
            KeySchema: [
                {
                    AttributeName: graphql_transformer_common_1.SyncResourceIDs.syncPrimaryKey,
                    KeyType: 'HASH',
                },
                {
                    AttributeName: graphql_transformer_common_1.SyncResourceIDs.syncRangeKey,
                    KeyType: 'RANGE',
                },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            TimeToLiveSpecification: syncTTLConfig(),
        });
    }
    SyncUtils.createSyncTable = createSyncTable;
    function createSyncIAMRole() {
        var roleName = graphql_transformer_common_1.SyncResourceIDs.syncIAMRoleName;
        return new cloudform_types_1.IAM.Role({
            RoleName: joinWithEnv('-', [roleName, cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')]),
            AssumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Service: 'appsync.amazonaws.com',
                        },
                        Action: 'sts:AssumeRole',
                    },
                ],
            },
            Policies: [
                new cloudform_types_1.IAM.Role.Policy({
                    PolicyName: 'DynamoDBAccess',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: [
                                    'dynamodb:BatchGetItem',
                                    'dynamodb:BatchWriteItem',
                                    'dynamodb:PutItem',
                                    'dynamodb:DeleteItem',
                                    'dynamodb:GetItem',
                                    'dynamodb:Scan',
                                    'dynamodb:Query',
                                    'dynamodb:UpdateItem',
                                ],
                                Resource: [
                                    cloudform_types_1.Fn.Sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${tablename}', {
                                        tablename: graphql_transformer_common_1.SyncResourceIDs.syncTableName,
                                    }),
                                    cloudform_types_1.Fn.Sub('arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${tablename}/*', {
                                        tablename: graphql_transformer_common_1.SyncResourceIDs.syncTableName,
                                    }),
                                ],
                            },
                        ],
                    },
                }),
            ],
        });
    }
    SyncUtils.createSyncIAMRole = createSyncIAMRole;
    function syncLambdaArnResource(_a) {
        var name = _a.name, region = _a.region;
        var env = 'env;';
        var substitutions = {};
        if (referencesEnv(name)) {
            substitutions[env] = cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env);
        }
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Sub(lambdaArnKey(name, region), substitutions), cloudform_types_1.Fn.Sub(lambdaArnKey(removeEnvReference(name), region), {}));
    }
    SyncUtils.syncLambdaArnResource = syncLambdaArnResource;
    function lambdaArnKey(name, region) {
        return region
            ? "arn:aws:lambda:" + region + ":${AWS::AccountId}:function:" + name
            : "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:" + name;
    }
    SyncUtils.lambdaArnKey = lambdaArnKey;
    function referencesEnv(value) {
        return value.match(/(\${env})/) !== null;
    }
    function removeEnvReference(value) {
        return value.replace(/(-\${env})/, '');
    }
    function joinWithEnv(separator, listToJoin) {
        return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join(separator, __spreadArrays(listToJoin, [cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env)])), cloudform_types_1.Fn.Join(separator, listToJoin));
    }
    function syncLambdaIAMRole(_a) {
        var name = _a.name, region = _a.region;
        return new cloudform_types_1.IAM.Role({
            RoleName: cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Join('-', [
                name.slice(0, 26),
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env),
            ]), cloudform_types_1.Fn.Join('-', [
                // tslint:disable-next-line: no-magic-numbers
                name.slice(0, 37),
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ])),
            AssumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Service: 'appsync.amazonaws.com',
                        },
                        Action: 'sts:AssumeRole',
                    },
                ],
            },
            Policies: [
                {
                    PolicyName: 'InvokeLambdaFunction',
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: [
                            {
                                Effect: 'Allow',
                                Action: ['lambda:InvokeFunction'],
                                Resource: syncLambdaArnResource({ name: name, region: region }),
                            },
                        ],
                    },
                },
            ],
        });
    }
    SyncUtils.syncLambdaIAMRole = syncLambdaIAMRole;
    function createSyncLambdaIAMPolicy(_a) {
        var name = _a.name, region = _a.region;
        return new cloudform_types_1.IAM.Role.Policy({
            PolicyName: 'InvokeLambdaFunction',
            PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: ['lambda:InvokeFunction'],
                        Resource: syncLambdaArnResource({ name: name, region: region }),
                    },
                ],
            },
        });
    }
    SyncUtils.createSyncLambdaIAMPolicy = createSyncLambdaIAMPolicy;
    function syncTTLConfig() {
        return {
            AttributeName: '_ttl',
            Enabled: true,
        };
    }
    SyncUtils.syncTTLConfig = syncTTLConfig;
    function syncDataSourceConfig() {
        return {
            DeltaSyncTableName: joinWithEnv('-', [
                graphql_transformer_common_1.SyncResourceIDs.syncTableName,
                cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId'),
            ]),
            DeltaSyncTableTTL: 30,
            BaseTableTTL: 43200,
        };
        // default values for deltasync
    }
    SyncUtils.syncDataSourceConfig = syncDataSourceConfig;
    function syncResolverConfig(syncConfig) {
        var resolverObj = {
            ConflictDetection: syncConfig.ConflictDetection,
            ConflictHandler: syncConfig.ConflictHandler,
        };
        if (isLambdaSyncConfig(syncConfig)) {
            resolverObj.LambdaConflictHandlerArn = syncLambdaArnResource(syncConfig.LambdaConflictHandler);
        }
        return resolverObj;
    }
    SyncUtils.syncResolverConfig = syncResolverConfig;
    function isLambdaSyncConfig(obj) {
        var lambbdaConfigKey = 'LambdaConflictHandler';
        if (obj && obj.ConflictHandler === 'LAMBDA') {
            if (obj.hasOwnProperty(lambbdaConfigKey)) {
                return true;
            }
            throw Error("Invalid Lambda SyncConfig");
        }
        return false;
    }
    SyncUtils.isLambdaSyncConfig = isLambdaSyncConfig;
})(SyncUtils = exports.SyncUtils || (exports.SyncUtils = {}));
//# sourceMappingURL=syncUtils.js.map