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
var graphql_1 = require("graphql");
var errors_1 = require("./errors");
var TransformerContext_1 = require("./TransformerContext");
var validation_1 = require("./validation");
var TransformFormatter_1 = require("./TransformFormatter");
var util_1 = require("./util");
var graphql_transformer_common_1 = require("graphql-transformer-common");
function isFunction(obj) {
    return obj && typeof obj === 'function';
}
function makeSeenTransformationKey(directive, type, field, arg, index) {
    var key = '';
    if (directive && type && field && arg) {
        key = type.name.value + "." + field.name.value + "." + arg.name.value + "@" + directive.name.value;
    }
    if (directive && type && field) {
        key = type.name.value + "." + field.name.value + "@" + directive.name.value;
    }
    else {
        key = type.name.value + "@" + directive.name.value;
    }
    if (index !== undefined) {
        key += "[" + index + "]";
    }
    return key;
}
/**
 * If this instance of the directive validates against its definition return true.
 * If the definition does not apply to the instance return false.
 * @param directive The directive definition to validate against.
 * @param nodeKind The kind of the current node where the directive was found.
 */
function matchDirective(definition, directive, node) {
    if (!directive) {
        return false;
    }
    if (definition.name.value !== directive.name.value) {
        // The definition is for the wrong directive. Do not match.
        return false;
    }
    var isValidLocation = false;
    for (var _i = 0, _a = definition.locations; _i < _a.length; _i++) {
        var location_1 = _a[_i];
        // tslint:disable-next-line: switch-default
        switch (location_1.value) {
            case "SCHEMA":
                isValidLocation = node.kind === graphql_1.Kind.SCHEMA_DEFINITION || isValidLocation;
                break;
            case "SCALAR":
                isValidLocation = node.kind === graphql_1.Kind.SCALAR_TYPE_DEFINITION || isValidLocation;
                break;
            case "OBJECT":
                isValidLocation = node.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION || isValidLocation;
                break;
            case "FIELD_DEFINITION":
                isValidLocation = node.kind === graphql_1.Kind.FIELD_DEFINITION || isValidLocation;
                break;
            case "ARGUMENT_DEFINITION":
                isValidLocation = node.kind === graphql_1.Kind.INPUT_VALUE_DEFINITION || isValidLocation;
                break;
            case "INTERFACE":
                isValidLocation = node.kind === graphql_1.Kind.INTERFACE_TYPE_DEFINITION || isValidLocation;
                break;
            case "UNION":
                isValidLocation = node.kind === graphql_1.Kind.UNION_TYPE_DEFINITION || isValidLocation;
                break;
            case "ENUM":
                isValidLocation = node.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION || isValidLocation;
                break;
            case "ENUM_VALUE":
                isValidLocation = node.kind === graphql_1.Kind.ENUM_VALUE_DEFINITION || isValidLocation;
                break;
            case "INPUT_OBJECT":
                isValidLocation = node.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION || isValidLocation;
                break;
            case "INPUT_FIELD_DEFINITION":
                isValidLocation = node.kind === graphql_1.Kind.INPUT_VALUE_DEFINITION || isValidLocation;
                break;
        }
    }
    return isValidLocation;
}
function matchFieldDirective(definition, directive, node) {
    if (definition.name.value !== directive.name.value) {
        // The definition is for the wrong directive. Do not match.
        return false;
    }
    var isValidLocation = false;
    for (var _i = 0, _a = definition.locations; _i < _a.length; _i++) {
        var location_2 = _a[_i];
        // tslint:disable-next-line: switch-default
        switch (location_2.value) {
            case "FIELD_DEFINITION":
                isValidLocation = node.kind === graphql_1.Kind.FIELD_DEFINITION || isValidLocation;
                break;
        }
    }
    return isValidLocation;
}
function matchInputFieldDirective(definition, directive, node) {
    if (definition.name.value !== directive.name.value) {
        // The definition is for the wrong directive. Do not match.
        return false;
    }
    var isValidLocation = false;
    for (var _i = 0, _a = definition.locations; _i < _a.length; _i++) {
        var location_3 = _a[_i];
        // tslint:disable-next-line: switch-default
        switch (location_3.value) {
            case "INPUT_FIELD_DEFINITION":
                isValidLocation = node.kind === graphql_1.Kind.INPUT_VALUE_DEFINITION || isValidLocation;
                break;
        }
    }
    return isValidLocation;
}
function matchArgumentDirective(definition, directive, node) {
    if (definition.name.value !== directive.name.value) {
        // The definition is for the wrong directive. Do not match.
        return false;
    }
    var isValidLocation = false;
    for (var _i = 0, _a = definition.locations; _i < _a.length; _i++) {
        var location_4 = _a[_i];
        // tslint:disable-next-line: switch-default
        switch (location_4.value) {
            case "ARGUMENT_DEFINITION":
                isValidLocation = node.kind === graphql_1.Kind.INPUT_VALUE_DEFINITION || isValidLocation;
                break;
        }
    }
    return isValidLocation;
}
function matchEnumValueDirective(definition, directive, node) {
    if (definition.name.value !== directive.name.value) {
        // The definition is for the wrong directive. Do not match.
        return false;
    }
    var isValidLocation = false;
    for (var _i = 0, _a = definition.locations; _i < _a.length; _i++) {
        var location_5 = _a[_i];
        // tslint:disable-next-line: switch-default
        switch (location_5.value) {
            case "ENUM_VALUE":
                isValidLocation = node.kind === graphql_1.Kind.ENUM_VALUE_DEFINITION || isValidLocation;
                break;
        }
    }
    return isValidLocation;
}
var GraphQLTransform = /** @class */ (function () {
    function GraphQLTransform(options) {
        // A map from `${directive}.${typename}.${fieldName?}`: true
        // that specifies we have run already run a directive at a given location.
        // Only run a transformer function once per pair. This is refreshed each call to transform().
        this.seenTransformations = {};
        if (!options.transformers || options.transformers.length === 0) {
            throw new Error('Must provide at least one transformer.');
        }
        this.transformers = options.transformers;
        this.stackMappingOverrides = options.stackMapping || {};
        this.transformConfig = options.transformConfig || {};
        // check if this is an sync enabled project
    }
    /**
     * Reduces the final context by running the set of transformers on
     * the schema. Each transformer returns a new context that is passed
     * on to the next transformer. At the end of the transformation a
     * cloudformation template is returned.
     * @param schema The model schema.
     * @param references Any cloudformation references.
     */
    GraphQLTransform.prototype.transform = function (schema) {
        this.seenTransformations = {};
        var context = new TransformerContext_1.TransformerContext(schema);
        var validDirectiveNameMap = this.transformers.reduce(function (acc, t) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[t.directive.name.value] = true, _a)));
        }, {
            aws_subscribe: true,
            aws_auth: true,
            aws_api_key: true,
            aws_iam: true,
            aws_oidc: true,
            aws_cognito_user_pools: true,
            deprecated: true,
        });
        var allModelDefinitions = __spreadArrays(context.inputDocument.definitions);
        for (var _i = 0, _a = this.transformers; _i < _a.length; _i++) {
            var transformer = _a[_i];
            allModelDefinitions = allModelDefinitions.concat.apply(allModelDefinitions, __spreadArrays(transformer.typeDefinitions, [transformer.directive]));
        }
        var errors = validation_1.validateModelSchema({ kind: graphql_1.Kind.DOCUMENT, definitions: allModelDefinitions });
        if (errors && errors.length) {
            throw new errors_1.SchemaValidationError(errors);
        }
        // check if the project is sync enabled
        if (this.transformConfig.ResolverConfig) {
            this.createResourcesForSyncEnabledProject(context);
            context.setResolverConfig(this.transformConfig.ResolverConfig);
        }
        // Transformer version is populated, store it in the transformer context, to make it accessible to transformers
        context.setTransformerVersion(this.transformConfig.Version);
        for (var _b = 0, _c = this.transformers; _b < _c.length; _b++) {
            var transformer = _c[_b];
            if (isFunction(transformer.before)) {
                transformer.before(context);
            }
            // TODO: Validate that the transformer supports all the methods
            // required for the directive definition. Also verify that
            // directives are not used where they are not allowed.
            // Apply each transformer and accumulate the context.
            for (var _d = 0, _e = context.inputDocument.definitions; _d < _e.length; _d++) {
                var def = _e[_d];
                switch (def.kind) {
                    case 'ObjectTypeDefinition':
                        this.transformObject(transformer, def, validDirectiveNameMap, context);
                        // Walk the fields and call field transformers.
                        break;
                    case 'InterfaceTypeDefinition':
                        this.transformInterface(transformer, def, validDirectiveNameMap, context);
                        // Walk the fields and call field transformers.
                        break;
                    case 'ScalarTypeDefinition':
                        this.transformScalar(transformer, def, validDirectiveNameMap, context);
                        break;
                    case 'UnionTypeDefinition':
                        this.transformUnion(transformer, def, validDirectiveNameMap, context);
                        break;
                    case 'EnumTypeDefinition':
                        this.transformEnum(transformer, def, validDirectiveNameMap, context);
                        break;
                    case 'InputObjectTypeDefinition':
                        this.transformInputObject(transformer, def, validDirectiveNameMap, context);
                        break;
                    default:
                        continue;
                }
            }
        }
        // .transform() is meant to behave like a composition so the
        // after functions are called in the reverse order (as if they were popping off a stack)
        var reverseThroughTransformers = this.transformers.length - 1;
        while (reverseThroughTransformers >= 0) {
            var transformer = this.transformers[reverseThroughTransformers];
            // TODO: Validate the new context.
            // if (1 !== 1) {
            //   throw new Error(`Invalid context after transformer ${transformer.name}`);
            // }
            if (isFunction(transformer.after)) {
                transformer.after(context);
            }
            reverseThroughTransformers -= 1;
        }
        // Format the context into many stacks.
        this.updateContextForStackMappingOverrides(context);
        var formatter = new TransformFormatter_1.TransformFormatter();
        return formatter.format(context);
    };
    GraphQLTransform.prototype.updateContextForStackMappingOverrides = function (context) {
        for (var _i = 0, _a = Object.keys(this.stackMappingOverrides); _i < _a.length; _i++) {
            var resourceId = _a[_i];
            context.mapResourceToStack(this.stackMappingOverrides[resourceId], resourceId);
        }
    };
    GraphQLTransform.prototype.createResourcesForSyncEnabledProject = function (context) {
        var _a;
        var syncResources = (_a = {},
            _a[graphql_transformer_common_1.SyncResourceIDs.syncDataSourceID] = util_1.SyncUtils.createSyncTable(),
            _a);
        context.mergeResources(syncResources);
    };
    GraphQLTransform.prototype.transformObject = function (transformer, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.object)) {
                    var transformKey = makeSeenTransformationKey(dir, def, undefined, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.object(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'object()' method");
                }
            }
            index++;
        }
        for (var _b = 0, _c = def.fields; _b < _c.length; _b++) {
            var field = _c[_b];
            this.transformField(transformer, def, field, validDirectiveNameMap, context);
        }
    };
    GraphQLTransform.prototype.transformField = function (transformer, parent, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchFieldDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.field)) {
                    var transformKey = makeSeenTransformationKey(dir, parent, def, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.field(parent, def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'field()' method");
                }
            }
            index++;
        }
        for (var _b = 0, _c = def.arguments; _b < _c.length; _b++) {
            var arg = _c[_b];
            this.transformArgument(transformer, parent, def, arg, validDirectiveNameMap, context);
        }
    };
    GraphQLTransform.prototype.transformArgument = function (transformer, parent, field, arg, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = arg.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchArgumentDirective(transformer.directive, dir, arg)) {
                if (isFunction(transformer.argument)) {
                    var transformKey = makeSeenTransformationKey(dir, parent, field, arg, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.argument(arg, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'argument()' method");
                }
            }
            index++;
        }
    };
    GraphQLTransform.prototype.transformInterface = function (transformer, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.interface)) {
                    var transformKey = makeSeenTransformationKey(dir, def, undefined, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.interface(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'interface()' method");
                }
            }
            index++;
        }
        for (var _b = 0, _c = def.fields; _b < _c.length; _b++) {
            var field = _c[_b];
            this.transformField(transformer, def, field, validDirectiveNameMap, context);
        }
    };
    GraphQLTransform.prototype.transformScalar = function (transformer, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.scalar)) {
                    var transformKey = makeSeenTransformationKey(dir, def, undefined, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.scalar(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'scalar()' method");
                }
            }
            index++;
        }
    };
    GraphQLTransform.prototype.transformUnion = function (transformer, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.union)) {
                    var transformKey = makeSeenTransformationKey(dir, def, undefined, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.union(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'union()' method");
                }
            }
            index++;
        }
    };
    GraphQLTransform.prototype.transformEnum = function (transformer, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.enum)) {
                    var transformKey = makeSeenTransformationKey(dir, def, undefined, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.enum(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'enum()' method");
                }
            }
            index++;
        }
        for (var _b = 0, _c = def.values; _b < _c.length; _b++) {
            var value = _c[_b];
            this.transformEnumValue(transformer, def, value, validDirectiveNameMap, context);
        }
    };
    GraphQLTransform.prototype.transformEnumValue = function (transformer, enm, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchEnumValueDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.enumValue)) {
                    var transformKey = makeSeenTransformationKey(dir, enm, def, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.enumValue(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'enumValue()' method");
                }
            }
            index++;
        }
    };
    GraphQLTransform.prototype.transformInputObject = function (transformer, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.input)) {
                    var transformKey = makeSeenTransformationKey(dir, def, undefined, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.input(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'input()' method");
                }
            }
            index++;
        }
        for (var _b = 0, _c = def.fields; _b < _c.length; _b++) {
            var field = _c[_b];
            this.transformInputField(transformer, def, field, validDirectiveNameMap, context);
        }
    };
    GraphQLTransform.prototype.transformInputField = function (transformer, input, def, validDirectiveNameMap, context) {
        var index = 0;
        for (var _i = 0, _a = def.directives; _i < _a.length; _i++) {
            var dir = _a[_i];
            if (!validDirectiveNameMap[dir.name.value]) {
                throw new errors_1.UnknownDirectiveError("Unknown directive '" + dir.name.value + "'. Either remove the directive from the schema or add a transformer to handle it.");
            }
            if (matchInputFieldDirective(transformer.directive, dir, def)) {
                if (isFunction(transformer.inputValue)) {
                    var transformKey = makeSeenTransformationKey(dir, input, def, undefined, index);
                    if (!this.seenTransformations[transformKey]) {
                        transformer.inputValue(def, dir, context);
                        this.seenTransformations[transformKey] = true;
                    }
                }
                else {
                    throw new errors_1.InvalidTransformerError("The transformer '" + transformer.name + "' must implement the 'inputValue()' method");
                }
            }
            index++;
        }
    };
    return GraphQLTransform;
}());
exports.GraphQLTransform = GraphQLTransform;
//# sourceMappingURL=GraphQLTransform.js.map