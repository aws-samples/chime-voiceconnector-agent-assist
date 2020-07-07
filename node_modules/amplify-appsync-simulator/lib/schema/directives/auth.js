"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_tools_1 = require("graphql-tools");
var type_definition_1 = require("../../type-definition");
var util_1 = require("../../velocity/util");
var directive_base_1 = require("./directive-base");
var AUTH_DIRECTIVES = {
    aws_api_key: 'directive @aws_api_key on FIELD_DEFINITION | OBJECT',
    aws_iam: 'directive @aws_iam on FIELD_DEFINITION | OBJECT',
    aws_oidc: 'directive @aws_oidc on FIELD_DEFINITION | OBJECT',
    aws_cognito_user_pools: 'directive @aws_cognito_user_pools(cognito_groups: [String!]) on FIELD_DEFINITION | OBJECT',
    aws_auth: 'directive @aws_auth(cognito_groups: [String!]!) on FIELD_DEFINITION',
};
var AUTH_TYPE_TO_DIRECTIVE_MAP = {
    aws_api_key: type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.API_KEY,
    aws_iam: type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AWS_IAM,
    aws_auth: type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS,
    aws_cognito_user_pools: type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS,
    aws_oidc: type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.OPENID_CONNECT,
};
var AwsAuth = /** @class */ (function (_super) {
    __extends(AwsAuth, _super);
    function AwsAuth() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AwsAuth.prototype.visitFieldDefinition = function () { };
    AwsAuth.prototype.visitObject = function (object) { };
    AwsAuth.typeDefinitions = Object.values(AUTH_DIRECTIVES)
        .map(function (d) { return d; })
        .join('\n');
    return AwsAuth;
}(directive_base_1.AppSyncSimulatorDirectiveBase));
exports.AwsAuth = AwsAuth;
function getResolver(resolverMap, typeName, fieldName) {
    if (resolverMap && resolverMap[typeName] && resolverMap[typeName][fieldName]) {
        return resolverMap[typeName][fieldName];
    }
    return false;
}
function getAuthDirectiveForField(schema, field, typeName, simulator) {
    var fieldDirectives = field.astNode.directives;
    var parentField = schema.getType(typeName);
    var fieldAuthDirectives = getAuthDirective(fieldDirectives);
    var parentAuthDirectives = getAuthDirective(parentField.astNode.directives);
    var allowedDirectives = fieldAuthDirectives.length ? fieldAuthDirectives : parentAuthDirectives.length ? parentAuthDirectives : [];
    var allowedAuthModes = new Set();
    return allowedDirectives.length
        ? Array.from(allowedDirectives.reduce(function (acc, directive) { return acc.add(AUTH_TYPE_TO_DIRECTIVE_MAP[directive]); }, allowedAuthModes).values())
        : [simulator.appSyncConfig.defaultAuthenticationType.authenticationType];
}
function getAllowedCognitoGroups(schema, field, typeName) {
    var cognito_auth_directives = ['aws_auth', 'aws_cognito_user_pools'];
    var fieldDirectives = field.astNode.directives;
    var parentField = schema.getType(typeName);
    var fieldAuthDirectives = getAuthDirective(fieldDirectives);
    if (fieldAuthDirectives.length) {
        return fieldDirectives
            .filter(function (d) { return cognito_auth_directives.includes(d.name.value); })
            .reduce(function (acc, d) { return __spreadArrays(acc, getDirectiveArgumentValues(d, 'cognito_groups')); }, []);
    }
    var parentAuthDirectives = getAuthDirective(parentField.astNode.directives);
    if (parentAuthDirectives.length) {
        return parentField.astNode.directives
            .filter(function (d) { return function (d) { return cognito_auth_directives.includes(d.name.value); }; })
            .reduce(function (acc, d) { return __spreadArrays(acc, getDirectiveArgumentValues(d, 'cognito_groups')); }, []);
    }
    return [];
}
function getAuthDirective(directives) {
    var authDirectiveNames = Object.keys(AUTH_DIRECTIVES);
    return directives.map(function (d) { return d.name.value; }).filter(function (d) { return authDirectiveNames.includes(d); });
}
function getDirectiveArgumentValues(directives, argName) {
    return directives.arguments
        .filter(function (arg) { return arg.name.value === argName; })
        .reduce(function (acc, arg) { return __spreadArrays(acc, graphql_1.valueFromASTUntyped(arg.value)); }, []);
}
function protectResolversWithAuthRules(typeDef, existingResolvers, simulator) {
    var schema = graphql_tools_1.buildSchemaFromTypeDefinitions(typeDef);
    var newResolverMap = {};
    graphql_tools_1.forEachField(schema, function (field, typeName, fieldName) {
        var fieldResolver = getResolver(existingResolvers, typeName, fieldName);
        var allowedAuthTypes = getAuthDirectiveForField(schema, field, typeName, simulator);
        var allowedCognitoGroups = getAllowedCognitoGroups(schema, field, typeName);
        var newResolver = function (root, args, ctx, info) {
            var currentAuthMode = ctx.requestAuthorizationMode;
            if (!allowedAuthTypes.includes(currentAuthMode)) {
                var err = new util_1.Unauthorized("Not Authorized to access " + fieldName + " on type " + typeName, info);
                throw err;
            }
            if (ctx.requestAuthorizationMode === type_definition_1.AmplifyAppSyncSimulatorAuthenticationType.AMAZON_COGNITO_USER_POOLS &&
                allowedCognitoGroups.length) {
                var groups = getCognitoGroups(ctx.jwt || {});
                var authorized = groups.some(function (group) { return allowedCognitoGroups.includes(group); });
                if (!authorized) {
                    var err = new util_1.Unauthorized("Not Authorized to access " + fieldName + " on type " + typeName, info.operation.loc);
                    throw err;
                }
            }
            return (fieldResolver.resolve || graphql_1.defaultFieldResolver)(root, args, ctx, info);
        };
        if (!newResolverMap[typeName]) {
            newResolverMap[typeName] = {};
        }
        newResolverMap[typeName][fieldName] = __assign(__assign({}, fieldResolver), { resolve: newResolver });
    });
    return newResolverMap;
}
exports.protectResolversWithAuthRules = protectResolversWithAuthRules;
function getCognitoGroups(token) {
    if (token === void 0) { token = {}; }
    return token['cognito:groups'] ? token['cognito:groups'] : [];
}
//# sourceMappingURL=auth.js.map