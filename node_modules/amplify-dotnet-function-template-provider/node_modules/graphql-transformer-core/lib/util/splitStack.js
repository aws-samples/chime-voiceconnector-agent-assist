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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cloudform_types_1 = require("cloudform-types");
var getTemplateReferences_1 = require("./getTemplateReferences");
var getIn_1 = require("./getIn");
var setIn_1 = require("./setIn");
var blankTemplate_1 = require("./blankTemplate");
function splitStack(opts) {
    var stack = opts.stack;
    var stackRules = opts.stackRules;
    var rootStackName = opts.rootStackName || 'root';
    var defaultParameterValues = opts.defaultParameterValues || {};
    var defaultParameterDefinitions = opts.defaultParameterDefinitions || {};
    var defaultDependencies = opts.defaultDependencies || [];
    var importExportPrefix = opts.importExportPrefix;
    /**
     * Returns a map where the keys are the Resource/Output ids and the values are
     * the names of the stack where that Resource/Output belongs. This fills
     * any missing values with that of the root stack and thus returns a full-mapping.
     */
    function createMapByStackRules(keys) {
        var stackMap = {};
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var mappedTo = stackRules.get(key);
            if (mappedTo) {
                stackMap[key] = mappedTo;
            }
            else {
                stackMap[key] = rootStackName;
            }
        }
        return stackMap;
    }
    /**
     * Returns a map where the keys are the resource ids and the values are the
     * names of the stack where that resource belongs.
     */
    function mapResourcesToStack(template) {
        return createMapByStackRules(Object.keys(template.Resources));
    }
    function mapMappingToStack(template) {
        return createMapByStackRules(Object.keys(template.Mappings));
    }
    /**
     * Returns a map where the keys are the Outputs ids and the values are the
     * names of the stack where that Output belongs.
     */
    function mapOutputsToStack(template) {
        return createMapByStackRules(Object.keys(template.Outputs));
    }
    /**
     * Uses the stackRules to split resources out into the different stacks.
     */
    function collectTemplates(template, resourceToStackMap, outputToStackMap, mappingsToStackMap) {
        var resourceIds = Object.keys(resourceToStackMap);
        var templateMap = {};
        var _loop_1 = function (resourceId) {
            var stackName = resourceToStackMap[resourceId];
            if (!templateMap[stackName]) {
                templateMap[stackName] = blankTemplate_1.default({
                    Description: 'An auto-generated nested stack.',
                    Parameters: __assign(__assign({}, template.Parameters), defaultParameterDefinitions),
                    Conditions: template.Conditions,
                });
            }
            var resource = template.Resources[resourceId];
            // Remove any dependsOn that will no longer be in the same template.
            var depends = resource.DependsOn;
            if (depends && Array.isArray(depends)) {
                resource.DependsOn = depends.filter(function (id) {
                    return resourceToStackMap[id] === stackName;
                });
            }
            else if (depends && typeof depends === 'string') {
                resource.DependsOn = resourceToStackMap[depends] === stackName ? depends : undefined;
            }
            templateMap[stackName].Resources[resourceId] = resource;
        };
        for (var _i = 0, resourceIds_1 = resourceIds; _i < resourceIds_1.length; _i++) {
            var resourceId = resourceIds_1[_i];
            _loop_1(resourceId);
        }
        var outputIds = Object.keys(outputToStackMap);
        for (var _a = 0, outputIds_1 = outputIds; _a < outputIds_1.length; _a++) {
            var outputId = outputIds_1[_a];
            var stackName = outputToStackMap[outputId];
            var output = template.Outputs[outputId];
            templateMap[stackName].Outputs[outputId] = output;
        }
        var mappingIds = Object.keys(mappingToStackMap);
        for (var _b = 0, mappingIds_1 = mappingIds; _b < mappingIds_1.length; _b++) {
            var mappingId = mappingIds_1[_b];
            var stackName = mappingsToStackMap[mappingId];
            var mappings = template.Mappings[mappingId];
            templateMap[stackName].Mappings[mappingId] = mappings;
        }
        // The root stack exposes all parameters at the top level.
        templateMap[rootStackName].Parameters = template.Parameters;
        templateMap[rootStackName].Conditions = template.Conditions;
        return templateMap;
    }
    /**
     * Looks at each stack to find all its Ref and GetAtt expressions
     * and relaces them with Import/Export (when siblings) and Parameter/Ref
     * (when parent-child).
     */
    function replaceReferences(stacks, resourceToStackMap) {
        // For each stack create a list of stacks that it depends on.
        var stackDependsOnMap = Object.keys(stacks).reduce(function (acc, k) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[k] = [], _a)));
        }, {});
        var stackParamsMap = Object.keys(stacks).reduce(function (acc, k) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[k] = {}, _a)));
        }, {});
        for (var _i = 0, _a = Object.keys(stacks); _i < _a.length; _i++) {
            var thisStackName = _a[_i];
            var template = stacks[thisStackName];
            var resourceToReferenceMap = getTemplateReferences_1.getTemplateReferences(template);
            var _loop_2 = function (resourceId) {
                var references = resourceToReferenceMap[resourceId];
                var referencedStackName = resourceToStackMap[resourceId];
                for (var _i = 0, references_1 = references; _i < references_1.length; _i++) {
                    var refList = references_1[_i];
                    var refNode = getIn_1.default(template, refList);
                    // Only update a Ref if it references a Resource in a different stack.
                    // Other Refs are params, conditions, or built in pseudo params which remain the same.
                    var refNeedsReplacing = refNode && refNode.Ref && referencedStackName && referencedStackName !== thisStackName;
                    // Do not update a GetAtt if resources are in the same stack.
                    // Do update a GetAtt if it ref's a resource in a different stack.
                    var getAttNeedsReplacing = refNode && refNode['Fn::GetAtt'] && referencedStackName && referencedStackName !== thisStackName;
                    var isChildReferencingRoot = thisStackName !== rootStackName && referencedStackName === rootStackName;
                    if (refNeedsReplacing && isChildReferencingRoot) {
                        // Replace the Ref with a reference to the parameter that we will pass in.
                        // The stackParamsMap holds a map of parameter values that will be passed into
                        // the nested stack from the root. The values are the full Ref or GetAtt nodes.
                        var parameterName = "Ref" + resourceId;
                        stackParamsMap[thisStackName][parameterName] = refNode;
                        template.Parameters[parameterName] = new cloudform_types_1.StringParameter({
                            Description: "Auto-generated parameter that forwards Fn.Ref(" + resourceId + ") through to nested stacks.",
                        });
                        setIn_1.default(template, refList, cloudform_types_1.Fn.Ref(parameterName));
                    }
                    else if (refNeedsReplacing) {
                        setIn_1.default(template, refList, makeImportValueForRef(resourceId));
                        var outputForInput = makeOutputForRef(resourceId);
                        var referencedStack = stacks[referencedStackName];
                        var exportLogicalId = "Ref" + resourceId;
                        if (referencedStack && referencedStack.Outputs && !referencedStack.Outputs[exportLogicalId]) {
                            if (template.Outputs[exportLogicalId]) {
                                // https://github.com/aws-amplify/amplify-cli/issues/1581
                                // Export names are unique and the transformer libraries
                                // enforce resource id uniqueness as well. Delete the existing
                                // output if we are adding it to another stack to prevent push failures.
                                delete template.Outputs[exportLogicalId];
                            }
                            referencedStack.Outputs[exportLogicalId] = outputForInput;
                        }
                        if (stackDependsOnMap[thisStackName] && !stackDependsOnMap[thisStackName].find(function (s) { return s === referencedStackName; })) {
                            stackDependsOnMap[thisStackName].push(referencedStackName);
                        }
                    }
                    else if (getAttNeedsReplacing && isChildReferencingRoot) {
                        // Replace the GetAtt with a reference to the parameter that we will pass in.
                        // The stackParamsMap holds a map of parameter values that will be passed into
                        // the nested stack from the root. The values are the full Ref or GetAtt nodes.
                        var _a = refNode['Fn::GetAtt'], resId = _a[0], attr = _a[1];
                        var parameterName = "GetAtt" + resourceId + attr;
                        stackParamsMap[thisStackName][parameterName] = refNode;
                        template.Parameters[parameterName] = new cloudform_types_1.StringParameter({
                            Description: "Auto-generated parameter that forwards Fn.GetAtt(" + resourceId + ", " + attr + ") through to nested stacks.",
                        });
                        setIn_1.default(template, refList, cloudform_types_1.Fn.Ref(parameterName));
                    }
                    else if (getAttNeedsReplacing) {
                        var _b = refNode['Fn::GetAtt'], resId = _b[0], attr = _b[1];
                        setIn_1.default(template, refList, makeImportValueForGetAtt(resourceId, attr));
                        var outputForInput = makeOutputForGetAtt(resourceId, attr);
                        var referencedStack = stacks[referencedStackName];
                        var exportLogicalId = "GetAtt" + resourceId + attr;
                        if (referencedStack && referencedStack.Outputs && !referencedStack.Outputs[exportLogicalId]) {
                            if (template.Outputs[exportLogicalId]) {
                                // https://github.com/aws-amplify/amplify-cli/issues/1581
                                // Export names are unique and the transformer libraries
                                // enforce resource id uniqueness as well. Delete the existing
                                // output if we are adding it to another stack to prevent push failures.
                                delete template.Outputs[exportLogicalId];
                            }
                            referencedStack.Outputs[exportLogicalId] = outputForInput;
                        }
                        if (stackDependsOnMap[thisStackName] && !stackDependsOnMap[thisStackName].find(function (s) { return s === referencedStackName; })) {
                            stackDependsOnMap[thisStackName].push(referencedStackName);
                        }
                    }
                }
            };
            for (var _b = 0, _c = Object.keys(resourceToReferenceMap); _b < _c.length; _b++) {
                var resourceId = _c[_b];
                _loop_2(resourceId);
            }
        }
        return {
            stackDependencyMap: stackDependsOnMap,
            stackParameterMap: stackParamsMap,
        };
    }
    /**
     * Create an import value node that replaces a Ref.
     */
    function makeImportValueForRef(resourceId) {
        return cloudform_types_1.Fn.ImportValue(cloudform_types_1.Fn.Join(':', [importExportPrefix, 'Ref', resourceId]));
    }
    /**
     * Make an ImportValue node that imports the corresponding export.
     * @param resourceId The resource being got
     * @param attribute The attribute on the resource
     */
    function makeImportValueForGetAtt(resourceId, attribute) {
        return cloudform_types_1.Fn.ImportValue(cloudform_types_1.Fn.Join(':', [importExportPrefix, 'GetAtt', resourceId, attribute]));
    }
    /**
     * Make an output record that exports the GetAtt.
     * @param resourceId The resource being got
     * @param attribute The attribute on the resource
     */
    function makeOutputForGetAtt(resourceId, attribute) {
        return {
            Value: cloudform_types_1.Fn.GetAtt(resourceId, attribute),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [importExportPrefix, 'GetAtt', resourceId, attribute]),
            },
        };
    }
    /**
     * Make an output record that exports the GetAtt.
     * @param resourceId The resource being got
     * @param attribute The attribute on the resource
     */
    function makeOutputForRef(resourceId) {
        return {
            Value: cloudform_types_1.Fn.Ref(resourceId),
            Export: {
                Name: cloudform_types_1.Fn.Join(':', [importExportPrefix, 'Ref', resourceId]),
            },
        };
    }
    /**
     * Forwards all root parameters to each nested stack and adds the GraphQL API
     * reference as a parameter.
     * @param root The root stack
     * @param stacks The list of stacks keyed by filename.
     */
    function updateRootWithNestedStacks(root, stacks, stackInfo) {
        var stackFileNames = Object.keys(stacks);
        var allParamNames = Object.keys(root.Parameters);
        // Forward all parent parameters
        var allParamValues = allParamNames.reduce(function (acc, name) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[name] = cloudform_types_1.Fn.Ref(name), _a)));
        }, defaultParameterValues);
        // Also forward the API id of the top level API.
        // allParamValues[ResourceConstants.RESOURCES.GraphQLAPILogicalID] = Fn.GetAtt(ResourceConstants.RESOURCES.GraphQLAPILogicalID, 'ApiId')
        for (var _i = 0, stackFileNames_1 = stackFileNames; _i < stackFileNames_1.length; _i++) {
            var stackName = stackFileNames_1[_i];
            var dependsOnStacks = stackInfo.stackDependencyMap[stackName] || [];
            var extraParams = stackInfo.stackParameterMap[stackName] || {};
            var stackResource = new cloudform_types_1.CloudFormation.Stack({
                Parameters: __assign(__assign({}, allParamValues), extraParams),
                TemplateURL: cloudform_types_1.Fn.Join('/', [
                    'https://s3.amazonaws.com',
                    cloudform_types_1.Fn.Ref(opts.deployment.deploymentBucketParameterName),
                    cloudform_types_1.Fn.Ref(opts.deployment.deploymentKeyParameterName),
                    'stacks',
                    stackName + '.json',
                ]),
            }).dependsOn(__spreadArrays(defaultDependencies, dependsOnStacks));
            root.Resources[stackName] = stackResource;
        }
        return root;
    }
    var templateJson = JSON.parse(JSON.stringify(stack));
    var resourceToStackMap = mapResourcesToStack(templateJson);
    var outputToStackMap = mapOutputsToStack(templateJson);
    var mappingToStackMap = mapMappingToStack(templateJson);
    var stackMapping = __assign(__assign(__assign({}, resourceToStackMap), outputToStackMap), mappingToStackMap);
    var stacks = collectTemplates(templateJson, resourceToStackMap, outputToStackMap, stackMapping);
    var stackInfo = replaceReferences(stacks, resourceToStackMap);
    var rootStack = stacks[rootStackName];
    delete stacks[rootStackName];
    rootStack = updateRootWithNestedStacks(rootStack, stacks, stackInfo);
    return {
        rootStack: rootStack,
        stacks: stacks,
        stackMapping: stackMapping,
    };
}
exports.default = splitStack;
//# sourceMappingURL=splitStack.js.map