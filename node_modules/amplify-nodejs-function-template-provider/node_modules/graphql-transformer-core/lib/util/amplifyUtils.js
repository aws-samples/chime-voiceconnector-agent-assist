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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs-extra');
var path = require("path");
var cloudform_types_1 = require("cloudform-types");
var GraphQLTransform_1 = require("../GraphQLTransform");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var fileUtils_1 = require("./fileUtils");
var transformConfig_1 = require("./transformConfig");
var Sanity = require("./sanity-check");
var CLOUDFORMATION_FILE_NAME = 'cloudformation-template.json';
var PARAMETERS_FILE_NAME = 'parameters.json';
function buildProject(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var builtProject, lastBuildPath, thisBuildPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureMissingStackMappings(opts)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, _buildProject(opts)];
                case 2:
                    builtProject = _a.sent();
                    if (!(opts.projectDirectory && !opts.dryRun)) return [3 /*break*/, 5];
                    return [4 /*yield*/, writeDeploymentToDisk(builtProject, path.join(opts.projectDirectory, 'build'), opts.rootStackFileName, opts.buildParameters)];
                case 3:
                    _a.sent();
                    if (!opts.currentCloudBackendDirectory) return [3 /*break*/, 5];
                    lastBuildPath = path.join(opts.currentCloudBackendDirectory, 'build');
                    thisBuildPath = path.join(opts.projectDirectory, 'build');
                    return [4 /*yield*/, Sanity.check(lastBuildPath, thisBuildPath, opts.rootStackFileName)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, builtProject];
            }
        });
    });
}
exports.buildProject = buildProject;
function _buildProject(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var userProjectConfig, stackMapping, transformers, transform, transformOutput, merged;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, transformConfig_1.loadProject(opts.projectDirectory, opts)];
                case 1:
                    userProjectConfig = _a.sent();
                    stackMapping = getStackMappingFromProjectConfig(userProjectConfig.config);
                    return [4 /*yield*/, opts.transformersFactory.apply(opts, opts.transformersFactoryArgs)];
                case 2:
                    transformers = _a.sent();
                    transform = new GraphQLTransform_1.GraphQLTransform({
                        transformers: transformers,
                        stackMapping: stackMapping,
                        transformConfig: userProjectConfig.config,
                    });
                    transformOutput = transform.transform(userProjectConfig.schema.toString());
                    if (userProjectConfig.config && userProjectConfig.config.Migration) {
                        transformOutput = adjustBuildForMigration(transformOutput, userProjectConfig.config.Migration);
                    }
                    merged = mergeUserConfigWithTransformOutput(userProjectConfig, transformOutput);
                    return [2 /*return*/, merged];
            }
        });
    });
}
/**
 * Returns a map where the keys are the names of the resources and the values are root.
 * This will be passed to the transform constructor to cause resources from a migration
 * to remain in the top level stack.
 */
function getStackMappingFromProjectConfig(config) {
    var stackMapping = getOrDefault(config, 'StackMapping', {});
    var migrationConfig = config.Migration;
    if (migrationConfig && migrationConfig.V1) {
        var resourceIdsToHoist = migrationConfig.V1.Resources || [];
        for (var _i = 0, resourceIdsToHoist_1 = resourceIdsToHoist; _i < resourceIdsToHoist_1.length; _i++) {
            var idToHoist = resourceIdsToHoist_1[_i];
            stackMapping[idToHoist] = 'root';
        }
    }
    return stackMapping;
}
/**
 * This adjusts a project build to account for the resources created by a previous
 * version of the Amplify CLI. Mainly this prevents the deletion of DynamoDB tables
 * while still allowing the transform to customize that logical resource.
 * @param resources The resources to change.
 * @param idsToHoist The logical ids to hoist into the root of the template.
 */
function adjustBuildForMigration(resources, migrationConfig) {
    if (migrationConfig && migrationConfig.V1) {
        var resourceIdsToHoist = migrationConfig.V1.Resources || [];
        if (resourceIdsToHoist.length === 0) {
            return resources;
        }
        var resourceIdMap = resourceIdsToHoist.reduce(function (acc, k) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[k] = true, _a)));
        }, {});
        for (var _i = 0, _a = Object.keys(resources.stacks); _i < _a.length; _i++) {
            var stackKey = _a[_i];
            var template = resources.stacks[stackKey];
            for (var _b = 0, _c = Object.keys(template.Resources); _b < _c.length; _b++) {
                var resourceKey = _c[_b];
                if (resourceIdMap[resourceKey]) {
                    // Handle any special detials for migrated details.
                    var resource = template.Resources[resourceKey];
                    template.Resources[resourceKey] = formatMigratedResource(resource);
                }
            }
        }
        var rootStack = resources.rootStack;
        for (var _d = 0, _e = Object.keys(rootStack.Resources); _d < _e.length; _d++) {
            var resourceKey = _e[_d];
            if (resourceIdMap[resourceKey]) {
                // Handle any special detials for migrated details.
                var resource = rootStack.Resources[resourceKey];
                rootStack.Resources[resourceKey] = formatMigratedResource(resource);
            }
        }
    }
    return resources;
}
/**
 * Provided a build configuration & current-cloud-backend directory, calculate
 * any missing stack mappings that might have been caused by the stack mapping
 * bug in June 2019 (https://github.com/aws-amplify/amplify-cli/issues/1652).
 * This allows APIs that were deployed with the bug to continue
 * working without changes.
 */
function ensureMissingStackMappings(config) {
    return __awaiter(this, void 0, void 0, function () {
        var currentCloudBackendDirectory, transformOutput, missingStackMappings, copyOfCloudBackend, stackMapping, customStacks_1, stackNames, _i, stackNames_1, stackFileName, stackName, lastDeployedStack_1, resourceIdsInStack_3, _a, resourceIdsInStack_1, resourceId, outputIdsInStack_3, _b, outputIdsInStack_1, outputId, lastDeployedStack, resourceIdsInStack, _c, resourceIdsInStack_2, resourceId, outputIdsInStack, _d, outputIdsInStack_2, outputId, conf;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    currentCloudBackendDirectory = config.currentCloudBackendDirectory;
                    transformOutput = undefined;
                    if (!currentCloudBackendDirectory) return [3 /*break*/, 5];
                    missingStackMappings = {};
                    return [4 /*yield*/, _buildProject(config)];
                case 1:
                    transformOutput = _e.sent();
                    return [4 /*yield*/, fileUtils_1.readFromPath(currentCloudBackendDirectory)];
                case 2:
                    copyOfCloudBackend = _e.sent();
                    stackMapping = transformOutput.stackMapping;
                    if (!(copyOfCloudBackend && copyOfCloudBackend.build && copyOfCloudBackend.build.stacks)) return [3 /*break*/, 5];
                    customStacks_1 = Object.keys(copyOfCloudBackend.stacks || {});
                    stackNames = Object.keys(copyOfCloudBackend.build.stacks).filter(function (stack) { return !customStacks_1.includes(stack); });
                    // We walk through each of the stacks that were deployed in the most recent deployment.
                    // If we find a resource that was deployed into a different stack than it should have
                    // we make a note of it and include it in the missing stack mapping.
                    for (_i = 0, stackNames_1 = stackNames; _i < stackNames_1.length; _i++) {
                        stackFileName = stackNames_1[_i];
                        stackName = stackFileName.slice(0, stackFileName.length - path.extname(stackFileName).length);
                        lastDeployedStack_1 = JSON.parse(copyOfCloudBackend.build.stacks[stackFileName]);
                        if (lastDeployedStack_1) {
                            resourceIdsInStack_3 = Object.keys(lastDeployedStack_1.Resources);
                            for (_a = 0, resourceIdsInStack_1 = resourceIdsInStack_3; _a < resourceIdsInStack_1.length; _a++) {
                                resourceId = resourceIdsInStack_1[_a];
                                if (stackMapping[resourceId] && stackName !== stackMapping[resourceId]) {
                                    missingStackMappings[resourceId] = stackName;
                                }
                            }
                            outputIdsInStack_3 = Object.keys(lastDeployedStack_1.Outputs || {});
                            for (_b = 0, outputIdsInStack_1 = outputIdsInStack_3; _b < outputIdsInStack_1.length; _b++) {
                                outputId = outputIdsInStack_1[_b];
                                if (stackMapping[outputId] && stackName !== stackMapping[outputId]) {
                                    missingStackMappings[outputId] = stackName;
                                }
                            }
                        }
                    }
                    lastDeployedStack = JSON.parse(copyOfCloudBackend.build[config.rootStackFileName]);
                    resourceIdsInStack = Object.keys(lastDeployedStack.Resources);
                    for (_c = 0, resourceIdsInStack_2 = resourceIdsInStack; _c < resourceIdsInStack_2.length; _c++) {
                        resourceId = resourceIdsInStack_2[_c];
                        if (stackMapping[resourceId] && 'root' !== stackMapping[resourceId]) {
                            missingStackMappings[resourceId] = 'root';
                        }
                    }
                    outputIdsInStack = Object.keys(lastDeployedStack.Outputs || {});
                    for (_d = 0, outputIdsInStack_2 = outputIdsInStack; _d < outputIdsInStack_2.length; _d++) {
                        outputId = outputIdsInStack_2[_d];
                        if (stackMapping[outputId] && 'root' !== stackMapping[outputId]) {
                            missingStackMappings[outputId] = 'root';
                        }
                    }
                    if (!Object.keys(missingStackMappings).length) return [3 /*break*/, 5];
                    return [4 /*yield*/, transformConfig_1.loadConfig(config.projectDirectory)];
                case 3:
                    conf = _e.sent();
                    conf = __assign(__assign({}, conf), { StackMapping: __assign(__assign({}, getOrDefault(conf, 'StackMapping', {})), missingStackMappings) });
                    return [4 /*yield*/, transformConfig_1.writeConfig(config.projectDirectory, conf)];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5: return [2 /*return*/, transformOutput];
            }
        });
    });
}
/**
 * Merge user config on top of transform output when needed.
 */
function mergeUserConfigWithTransformOutput(userConfig, transformOutput) {
    // Override user defined resolvers.
    var userResolvers = userConfig.resolvers || {};
    var transformResolvers = transformOutput.resolvers;
    for (var _i = 0, _a = Object.keys(userResolvers); _i < _a.length; _i++) {
        var userResolver = _a[_i];
        transformResolvers[userResolver] = userConfig.resolvers[userResolver];
    }
    // Override user defined stacks.
    var userStacks = userConfig.stacks || {};
    var transformStacks = transformOutput.stacks;
    var rootStack = transformOutput.rootStack;
    // Get all the transform stacks. Custom stacks will depend on all of them
    // so they can always access data sources created by the transform.
    var resourceTypesToDependOn = {
        'AWS::CloudFormation::Stack': true,
        'AWS::AppSync::GraphQLApi': true,
        'AWS::AppSync::GraphQLSchema': true,
    };
    var allResourceIds = Object.keys(rootStack.Resources).filter(function (k) {
        var resource = rootStack.Resources[k];
        return resourceTypesToDependOn[resource.Type];
    });
    // Looping through the parameters defined by the transform (aka. rootStack)
    var parametersKeys = Object.keys(rootStack.Parameters);
    var customStackParams = parametersKeys.reduce(function (acc, k) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[k] = cloudform_types_1.Fn.Ref(k), _a)));
    }, {});
    // customStackParams is a map that will be passed as the "parameters" value
    // to any nested stacks.
    customStackParams[graphql_transformer_common_1.ResourceConstants.PARAMETERS.AppSyncApiId] = cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId');
    // Load the root stack's parameters as we will update them with the Child Stack's parameters
    // if they are not already present in the root stack.
    var updatedParameters = rootStack.Parameters;
    for (var _b = 0, _c = Object.keys(userStacks); _b < _c.length; _b++) {
        var userStack = _c[_b];
        if (transformOutput.stacks[userStack]) {
            throw new Error("You cannot provide a stack named " + userStack + " as it             will be overwritten by a stack generated by the GraphQL Transform.");
        }
        var userDefinedStack = userConfig.stacks[userStack];
        /**
         * First loop through the parameters in the user defined stack and see
         * if there are any Parameters that are present in the child but not the
         * root stack - if so, add it to the root stack.
         */
        for (var _d = 0, _e = Object.keys(userDefinedStack.Parameters); _d < _e.length; _d++) {
            var key = _e[_d];
            if (customStackParams[key] == null) {
                customStackParams[key] = cloudform_types_1.Fn.Ref(key);
                /**
                 * First check to the ensure that the key does not already exist in the Root stack
                 * This helps to prevent the customer from overwriting parameters that are used by the library
                 */
                if (updatedParameters[key]) {
                    throw new Error("Cannot redefine CloudFormation parameter " + key + " in stack " + userStack + ".");
                }
                else {
                    // Add the entire parameter entry from the user defined stack's parameter
                    updatedParameters[key] = userDefinedStack.Parameters[key];
                }
            }
        }
        // Providing a parameter value when the parameters is not explicitly defined
        // in the template causes CloudFormation to throw an error. This will only
        // provide the value to the nested stack if the user has specified it.
        var parametersForStack = Object.keys(userDefinedStack.Parameters).reduce(function (acc, k) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[k] = customStackParams[k], _a)));
        }, {});
        transformStacks[userStack] = userDefinedStack;
        // Split on non alphabetic characters to make a valid resource id.
        var stackResourceId = userStack.split(/[^A-Za-z]/).join('');
        var customNestedStack = new cloudform_types_1.CloudFormation.Stack({
            Parameters: parametersForStack,
            TemplateURL: cloudform_types_1.Fn.Join('/', [
                'https://s3.amazonaws.com',
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentBucket),
                cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.S3DeploymentRootKey),
                'stacks',
                userStack,
            ]),
        }).dependsOn(allResourceIds);
        rootStack.Resources[stackResourceId] = customNestedStack;
    }
    // Update the Root Stack Params since we have added the Child Stack Params if they are missing.
    rootStack.Parameters = updatedParameters;
    return __assign(__assign({}, transformOutput), { resolvers: transformResolvers, stacks: transformStacks });
}
/**
 * Reads deployment assets from disk and uploads to the cloud via an uploader.
 * @param opts Deployment options.
 */
function uploadDeployment(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!opts.directory) {
                        throw new Error("You must provide a 'directory'");
                    }
                    else if (!fs.existsSync(opts.directory)) {
                        throw new Error("Invalid 'directory': directory does not exist at " + opts.directory);
                    }
                    if (!opts.upload || typeof opts.upload !== 'function') {
                        throw new Error("You must provide an 'upload' function");
                    }
                    return [4 /*yield*/, fileUtils_1.walkDirPosix(opts.directory, opts.upload)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.uploadDeployment = uploadDeployment;
/**
 * Writes a deployment to disk at a path.
 */
function writeDeploymentToDisk(deployment, directory, rootStackFileName, buildParameters) {
    if (rootStackFileName === void 0) { rootStackFileName = 'rootStack.json'; }
    return __awaiter(this, void 0, void 0, function () {
        var schema, fullSchemaPath, resolverFileNames, resolverRootPath, _i, resolverFileNames_1, resolverFileName, fullResolverPath, pipelineFunctions, pipelineFunctionRootPath, _a, pipelineFunctions_1, functionFileName, fullTemplatePath, stackNames, stackRootPath, _b, stackNames_2, stackFileName, fileNameParts, fullFileName, fullStackPath, stackString, functionNames, functionRootPath, _c, functionNames_1, functionName, fullFunctionPath, zipContents, rootStack, rootStackPath, jsonString, parametersOutputFilePath;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: 
                // Delete the last deployments resources.
                return [4 /*yield*/, fileUtils_1.emptyDirectory(directory)];
                case 1:
                    // Delete the last deployments resources.
                    _d.sent();
                    schema = deployment.schema;
                    fullSchemaPath = path.normalize(directory + "/schema.graphql");
                    fs.writeFileSync(fullSchemaPath, schema);
                    // Setup the directories if they do not exist.
                    initStacksAndResolversDirectories(directory);
                    resolverFileNames = Object.keys(deployment.resolvers);
                    resolverRootPath = resolverDirectoryPath(directory);
                    for (_i = 0, resolverFileNames_1 = resolverFileNames; _i < resolverFileNames_1.length; _i++) {
                        resolverFileName = resolverFileNames_1[_i];
                        fullResolverPath = path.normalize(resolverRootPath + '/' + resolverFileName);
                        fs.writeFileSync(fullResolverPath, deployment.resolvers[resolverFileName]);
                    }
                    pipelineFunctions = Object.keys(deployment.pipelineFunctions);
                    pipelineFunctionRootPath = pipelineFunctionDirectoryPath(directory);
                    for (_a = 0, pipelineFunctions_1 = pipelineFunctions; _a < pipelineFunctions_1.length; _a++) {
                        functionFileName = pipelineFunctions_1[_a];
                        fullTemplatePath = path.normalize(pipelineFunctionRootPath + '/' + functionFileName);
                        fs.writeFileSync(fullTemplatePath, deployment.pipelineFunctions[functionFileName]);
                    }
                    stackNames = Object.keys(deployment.stacks);
                    stackRootPath = stacksDirectoryPath(directory);
                    for (_b = 0, stackNames_2 = stackNames; _b < stackNames_2.length; _b++) {
                        stackFileName = stackNames_2[_b];
                        fileNameParts = stackFileName.split('.');
                        if (fileNameParts.length === 1) {
                            fileNameParts.push('json');
                        }
                        fullFileName = fileNameParts.join('.');
                        fileUtils_1.throwIfNotJSONExt(fullFileName);
                        fullStackPath = path.normalize(stackRootPath + '/' + fullFileName);
                        stackString = deployment.stacks[stackFileName];
                        stackString =
                            typeof stackString === 'string' ? deployment.stacks[stackFileName] : JSON.stringify(deployment.stacks[stackFileName], null, 4);
                        fs.writeFileSync(fullStackPath, stackString);
                    }
                    functionNames = Object.keys(deployment.functions);
                    functionRootPath = path.normalize(directory + "/functions");
                    if (!fs.existsSync(functionRootPath)) {
                        fs.mkdirSync(functionRootPath);
                    }
                    for (_c = 0, functionNames_1 = functionNames; _c < functionNames_1.length; _c++) {
                        functionName = functionNames_1[_c];
                        fullFunctionPath = path.normalize(functionRootPath + '/' + functionName);
                        zipContents = fs.readFileSync(deployment.functions[functionName]);
                        fs.writeFileSync(fullFunctionPath, zipContents);
                    }
                    rootStack = deployment.rootStack;
                    rootStackPath = path.normalize(directory + ("/" + rootStackFileName));
                    fs.writeFileSync(rootStackPath, JSON.stringify(rootStack, null, 4));
                    jsonString = JSON.stringify(buildParameters, null, 4);
                    parametersOutputFilePath = path.join(directory, PARAMETERS_FILE_NAME);
                    fs.writeFileSync(parametersOutputFilePath, jsonString);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Using the current cloudbackend as the source of truth of the current env,
 * move the deployment forward to the intermediate stage before allowing the
 * rest of the deployment to take place.
 * @param opts
 */
function migrateAPIProject(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var projectDirectory, cloudBackendDirectory, copyOfCloudBackend, projectConfig, cloudBackendConfig, transformConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectDirectory = opts.projectDirectory;
                    cloudBackendDirectory = opts.cloudBackendDirectory || projectDirectory;
                    return [4 /*yield*/, fileUtils_1.readFromPath(cloudBackendDirectory)];
                case 1:
                    copyOfCloudBackend = _a.sent();
                    if (copyOfCloudBackend.build && !copyOfCloudBackend.build[CLOUDFORMATION_FILE_NAME]) {
                        copyOfCloudBackend.build[CLOUDFORMATION_FILE_NAME] = copyOfCloudBackend[CLOUDFORMATION_FILE_NAME];
                    }
                    return [4 /*yield*/, fileUtils_1.readFromPath(projectDirectory)];
                case 2:
                    projectConfig = _a.sent();
                    return [4 /*yield*/, readV1ProjectConfiguration(cloudBackendDirectory)];
                case 3:
                    cloudBackendConfig = _a.sent();
                    transformConfig = makeTransformConfigFromOldProject(cloudBackendConfig);
                    return [4 /*yield*/, updateToIntermediateProject(projectDirectory, cloudBackendConfig, transformConfig)];
                case 4:
                    _a.sent();
                    // Return the old project structures in case of revert.
                    return [2 /*return*/, {
                            project: projectConfig,
                            cloudBackend: copyOfCloudBackend,
                        }];
            }
        });
    });
}
exports.migrateAPIProject = migrateAPIProject;
function revertAPIMigration(directory, oldProject) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.remove(directory)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fileUtils_1.writeToPath(directory, oldProject)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.revertAPIMigration = revertAPIMigration;
/**
 * Read the configuration for the old version of amplify CLI.
 */
function readV1ProjectConfiguration(projectDirectory) {
    return __awaiter(this, void 0, void 0, function () {
        var schema, cloudFormationTemplatePath, cloudFormationTemplateExists, cloudFormationTemplateStr, cloudFormationTemplate, parametersFilePath, parametersFileExists, parametersFileStr, parametersFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, transformConfig_1.readSchema(projectDirectory)];
                case 1:
                    schema = _a.sent();
                    cloudFormationTemplatePath = path.join(projectDirectory, CLOUDFORMATION_FILE_NAME);
                    return [4 /*yield*/, fs.exists(cloudFormationTemplatePath)];
                case 2:
                    cloudFormationTemplateExists = _a.sent();
                    if (!cloudFormationTemplateExists) {
                        throw new Error("Could not find cloudformation template at " + cloudFormationTemplatePath);
                    }
                    return [4 /*yield*/, fs.readFile(cloudFormationTemplatePath)];
                case 3:
                    cloudFormationTemplateStr = _a.sent();
                    cloudFormationTemplate = JSON.parse(cloudFormationTemplateStr.toString());
                    parametersFilePath = path.join(projectDirectory, 'parameters.json');
                    return [4 /*yield*/, fs.exists(parametersFilePath)];
                case 4:
                    parametersFileExists = _a.sent();
                    if (!parametersFileExists) {
                        throw new Error("Could not find parameters.json at " + parametersFilePath);
                    }
                    return [4 /*yield*/, fs.readFile(parametersFilePath)];
                case 5:
                    parametersFileStr = _a.sent();
                    parametersFile = JSON.parse(parametersFileStr.toString());
                    return [2 /*return*/, {
                            template: cloudFormationTemplate,
                            parameters: parametersFile,
                            schema: schema,
                        }];
            }
        });
    });
}
exports.readV1ProjectConfiguration = readV1ProjectConfiguration;
function makeTransformConfigFromOldProject(project) {
    var migrationResourceIds = [];
    for (var _i = 0, _a = Object.keys(project.template.Resources); _i < _a.length; _i++) {
        var key = _a[_i];
        var resource = project.template.Resources[key];
        switch (resource.Type) {
            case 'AWS::DynamoDB::Table': {
                migrationResourceIds.push(key);
                // When searchable is used we need to keep the output stream arn
                // output at the top level as well. TODO: Only do this when searchable is enabled.
                // migrationOutputIds.push(`GetAtt${key}StreamArn`);
                break;
            }
            case 'AWS::Elasticsearch::Domain': {
                migrationResourceIds.push(key);
                break;
            }
            case 'AWS::IAM::Role': {
                if (key === 'ElasticSearchAccessIAMRole') {
                    // A special case for deploying the migration to projects with @searchable.
                    // This keeps an IAM role needed by the old ES policy document around.
                    migrationResourceIds.push(key);
                }
                break;
            }
            default: {
                break;
            }
        }
    }
    return {
        Migration: {
            V1: {
                Resources: migrationResourceIds,
            },
        },
    };
}
exports.makeTransformConfigFromOldProject = makeTransformConfigFromOldProject;
function formatMigratedResource(obj) {
    var jsonNode = obj && typeof obj.toJSON === 'function' ? obj.toJSON() : obj;
    var withoutEncryption = removeSSE(jsonNode);
    return withoutEncryption;
}
function removeSSE(resource) {
    if (resource && resource.Properties && resource.Properties.SSESpecification) {
        delete resource.Properties.SSESpecification;
    }
    return resource;
}
/**
 * Updates the project to a temporary configuration that stages the real migration.
 */
function updateToIntermediateProject(projectDirectory, project, config) {
    return __awaiter(this, void 0, void 0, function () {
        var filteredResources, _i, _a, key, resource, alteredResource, filteredParameterValues, filteredTemplateParameters, _b, _c, key, param, templateCopy, oldCloudFormationTemplatePath, cloudFormationTemplateOutputPath, parametersInputPath;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: 
                // Write the config to disk.
                return [4 /*yield*/, transformConfig_1.writeConfig(projectDirectory, config)];
                case 1:
                    // Write the config to disk.
                    _d.sent();
                    filteredResources = {};
                    for (_i = 0, _a = Object.keys(project.template.Resources); _i < _a.length; _i++) {
                        key = _a[_i];
                        resource = project.template.Resources[key];
                        switch (resource.Type) {
                            case 'AWS::DynamoDB::Table':
                            case 'AWS::Elasticsearch::Domain':
                            case 'AWS::AppSync::GraphQLApi':
                            case 'AWS::AppSync::ApiKey':
                            case 'AWS::Cognito::UserPool':
                            case 'AWS::Cognito::UserPoolClient':
                                filteredResources[key] = formatMigratedResource(resource);
                                break;
                            case 'AWS::IAM::Role': {
                                if (key === 'ElasticSearchAccessIAMRole') {
                                    // A special case for the ES migration case.
                                    filteredResources[key] = resource;
                                }
                                break;
                            }
                            case 'AWS::AppSync::GraphQLSchema':
                                alteredResource = __assign({}, resource);
                                alteredResource.Properties.DefinitionS3Location = {
                                    'Fn::Sub': [
                                        's3://${S3DeploymentBucket}/${S3DeploymentRootKey}/schema.graphql',
                                        {
                                            S3DeploymentBucket: {
                                                Ref: 'S3DeploymentBucket',
                                            },
                                            S3DeploymentRootKey: {
                                                Ref: 'S3DeploymentRootKey',
                                            },
                                        },
                                    ],
                                };
                                filteredResources[key] = alteredResource;
                                break;
                            default:
                                break; // Everything else will live in a nested stack.
                        }
                    }
                    filteredParameterValues = {
                        DynamoDBBillingMode: 'PROVISIONED',
                    };
                    filteredTemplateParameters = {
                        env: {
                            Type: 'String',
                            Description: 'The environment name. e.g. Dev, Test, or Production',
                            Default: 'NONE',
                        },
                        S3DeploymentBucket: {
                            Type: 'String',
                            Description: 'The S3 bucket containing all deployment assets for the project.',
                        },
                        S3DeploymentRootKey: {
                            Type: 'String',
                            Description: 'An S3 key relative to the S3DeploymentBucket that points to the root of the deployment directory.',
                        },
                    };
                    for (_b = 0, _c = Object.keys(project.template.Parameters); _b < _c.length; _b++) {
                        key = _c[_b];
                        switch (key) {
                            case 'ResolverBucket':
                            case 'ResolverRootKey':
                            case 'DeploymentTimestamp':
                            case 'schemaGraphql':
                                break;
                            default: {
                                param = project.template.Parameters[key];
                                filteredTemplateParameters[key] = param;
                                if (project.parameters[key]) {
                                    filteredParameterValues[key] = project.parameters[key];
                                }
                                break;
                            }
                        }
                    }
                    templateCopy = __assign(__assign({}, project.template), { Resources: filteredResources, Parameters: filteredTemplateParameters });
                    oldCloudFormationTemplatePath = path.join(projectDirectory, CLOUDFORMATION_FILE_NAME);
                    if (fs.existsSync(oldCloudFormationTemplatePath)) {
                        fs.unlinkSync(oldCloudFormationTemplatePath);
                    }
                    cloudFormationTemplateOutputPath = path.join(projectDirectory, 'build', CLOUDFORMATION_FILE_NAME);
                    fs.writeFileSync(cloudFormationTemplateOutputPath, JSON.stringify(templateCopy, null, 4));
                    parametersInputPath = path.join(projectDirectory, PARAMETERS_FILE_NAME);
                    fs.writeFileSync(parametersInputPath, JSON.stringify(filteredParameterValues, null, 4));
                    // If the resolvers & stacks directories do not exist, create them.
                    initStacksAndResolversDirectories(projectDirectory);
                    return [2 /*return*/];
            }
        });
    });
}
function initStacksAndResolversDirectories(directory) {
    var resolverRootPath = resolverDirectoryPath(directory);
    if (!fs.existsSync(resolverRootPath)) {
        fs.mkdirSync(resolverRootPath);
    }
    var pipelineFunctionRootPath = pipelineFunctionDirectoryPath(directory);
    if (!fs.existsSync(pipelineFunctionRootPath)) {
        fs.mkdirSync(pipelineFunctionRootPath);
    }
    var stackRootPath = stacksDirectoryPath(directory);
    if (!fs.existsSync(stackRootPath)) {
        fs.mkdirSync(stackRootPath);
    }
}
function pipelineFunctionDirectoryPath(rootPath) {
    return path.normalize(rootPath + "/pipelineFunctions");
}
function resolverDirectoryPath(rootPath) {
    return path.normalize(rootPath + "/resolvers");
}
function stacksDirectoryPath(rootPath) {
    return path.normalize(rootPath + "/stacks");
}
function getOrDefault(o, k, d) {
    return o[k] || d;
}
//# sourceMappingURL=amplifyUtils.js.map