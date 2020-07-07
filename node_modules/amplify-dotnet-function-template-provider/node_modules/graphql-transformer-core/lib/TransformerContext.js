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
var blankTemplate_1 = require("./util/blankTemplate");
var defaultSchema_1 = require("./defaultSchema");
function blankObject(name) {
    return {
        kind: 'ObjectTypeDefinition',
        name: {
            kind: 'Name',
            value: name,
        },
        fields: [],
        directives: [],
        interfaces: [],
    };
}
exports.blankObject = blankObject;
function objectExtension(name, fields) {
    if (fields === void 0) { fields = []; }
    return {
        kind: graphql_1.Kind.OBJECT_TYPE_EXTENSION,
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
        interfaces: [],
    };
}
exports.objectExtension = objectExtension;
var TransformerContextMetadata = /** @class */ (function () {
    function TransformerContextMetadata() {
        /**
         * Used by transformers to pass information between one another.
         */
        this.metadata = {};
    }
    TransformerContextMetadata.prototype.get = function (key) {
        return this.metadata[key];
    };
    TransformerContextMetadata.prototype.set = function (key, val) {
        return (this.metadata[key] = val);
    };
    TransformerContextMetadata.prototype.has = function (key) {
        return Boolean(this.metadata[key] !== undefined);
    };
    return TransformerContextMetadata;
}());
exports.TransformerContextMetadata = TransformerContextMetadata;
/**
 * The transformer context is responsible for accumulating the resources,
 * types, and parameters necessary to support an AppSync transform.
 */
var TransformerContext = /** @class */ (function () {
    function TransformerContext(inputSDL) {
        this.template = blankTemplate_1.default();
        this.nodeMap = {};
        this.metadata = new TransformerContextMetadata();
        this.stackMapping = new Map();
        var doc = graphql_1.parse(inputSDL);
        for (var _i = 0, _a = doc.definitions; _i < _a.length; _i++) {
            var def = _a[_i];
            if (def.kind === 'OperationDefinition' || def.kind === 'FragmentDefinition') {
                throw new Error("Found a " + def.kind + ". Transformers accept only documents consisting of TypeSystemDefinitions.");
            }
        }
        this.inputDocument = doc;
        this.fillNodeMapWithInput();
    }
    /**
     * Before running the transformers, first flush the input document
     * into the node map. If a schema definition node then leave everything
     * as is so customers can explicitly turn off mutations & subscriptions.
     * If a SDN is not provided then we add the default schema and empty
     * Query, Mutation, and Subscription
     */
    TransformerContext.prototype.fillNodeMapWithInput = function () {
        var extensionNodes = [];
        for (var _i = 0, _a = this.inputDocument.definitions; _i < _a.length; _i++) {
            var inputDef = _a[_i];
            switch (inputDef.kind) {
                case graphql_1.Kind.OBJECT_TYPE_DEFINITION:
                case graphql_1.Kind.SCALAR_TYPE_DEFINITION:
                case graphql_1.Kind.INTERFACE_TYPE_DEFINITION:
                case graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
                case graphql_1.Kind.ENUM_TYPE_DEFINITION:
                case graphql_1.Kind.UNION_TYPE_DEFINITION:
                    var typeDef = inputDef;
                    if (!this.getType(typeDef.name.value)) {
                        this.addType(typeDef);
                    }
                    break;
                case graphql_1.Kind.SCHEMA_DEFINITION:
                    if (!this.getSchema()) {
                        var typeDef_1 = inputDef;
                        this.putSchema(typeDef_1);
                    }
                    break;
                case graphql_1.Kind.OBJECT_TYPE_EXTENSION:
                case graphql_1.Kind.ENUM_TYPE_EXTENSION:
                case graphql_1.Kind.UNION_TYPE_EXTENSION:
                case graphql_1.Kind.INTERFACE_TYPE_EXTENSION:
                case graphql_1.Kind.INPUT_OBJECT_TYPE_EXTENSION:
                    extensionNodes.push(inputDef);
                    break;
                case graphql_1.Kind.SCALAR_TYPE_EXTENSION:
                default:
                /* pass any others */
            }
        }
        // We add the extension nodes last so that the order of input documents does not matter.
        // At this point, all input documents have been processed so the base types will be present.
        for (var _b = 0, extensionNodes_1 = extensionNodes; _b < extensionNodes_1.length; _b++) {
            var ext = extensionNodes_1[_b];
            switch (ext.kind) {
                case graphql_1.Kind.OBJECT_TYPE_EXTENSION:
                    this.addObjectExtension(ext);
                    break;
                case graphql_1.Kind.INTERFACE_TYPE_EXTENSION:
                    this.addInterfaceExtension(ext);
                    break;
                case graphql_1.Kind.UNION_TYPE_EXTENSION:
                    this.addUnionExtension(ext);
                    break;
                case graphql_1.Kind.ENUM_TYPE_EXTENSION:
                    this.addEnumExtension(ext);
                    break;
                case graphql_1.Kind.INPUT_OBJECT_TYPE_EXTENSION:
                    this.addInputExtension(ext);
                    break;
                case graphql_1.Kind.SCALAR_TYPE_EXTENSION:
                default:
                    continue;
            }
        }
        // If no schema definition is provided then fill with the default one.
        if (!this.getSchema()) {
            this.putSchema(defaultSchema_1.default);
        }
    };
    /**
     * Scans through the context nodeMap and returns all type definition nodes
     * that are of the given kind.
     * @param kind Kind value of type definition nodes expected.
     */
    TransformerContext.prototype.getTypeDefinitionsOfKind = function (kind) {
        var typeDefs = [];
        for (var _i = 0, _a = Object.keys(this.nodeMap); _i < _a.length; _i++) {
            var key = _a[_i];
            var definition = this.nodeMap[key];
            if (definition.kind === kind) {
                typeDefs.push(definition);
            }
        }
        return typeDefs;
    };
    TransformerContext.prototype.mergeResources = function (resources) {
        for (var _i = 0, _a = Object.keys(resources); _i < _a.length; _i++) {
            var resourceId = _a[_i];
            if (this.template.Resources[resourceId]) {
                throw new Error("Conflicting CloudFormation resource logical id: " + resourceId);
            }
        }
        this.template.Resources = __assign(__assign({}, this.template.Resources), resources);
    };
    TransformerContext.prototype.mergeParameters = function (params) {
        for (var _i = 0, _a = Object.keys(params); _i < _a.length; _i++) {
            var parameterName = _a[_i];
            if (this.template.Parameters[parameterName]) {
                throw new Error("Conflicting CloudFormation parameter name: " + parameterName);
            }
        }
        this.template.Parameters = __assign(__assign({}, this.template.Parameters), params);
    };
    TransformerContext.prototype.mergeConditions = function (conditions) {
        if (!this.template.Conditions) {
            this.template.Conditions = {};
        }
        for (var _i = 0, _a = Object.keys(conditions); _i < _a.length; _i++) {
            var conditionName = _a[_i];
            if (this.template.Conditions[conditionName]) {
                throw new Error("Conflicting CloudFormation condition name: " + conditionName);
            }
        }
        this.template.Conditions = __assign(__assign({}, this.template.Conditions), conditions);
    };
    TransformerContext.prototype.getResource = function (resource) {
        return this.template.Resources[resource];
    };
    TransformerContext.prototype.setResource = function (key, resource) {
        this.template.Resources[key] = resource;
    };
    TransformerContext.prototype.setOutput = function (key, output) {
        this.template.Outputs[key] = output;
    };
    TransformerContext.prototype.getOutput = function (key) {
        return this.template.Outputs[key];
    };
    TransformerContext.prototype.mergeOutputs = function (outputs) {
        for (var _i = 0, _a = Object.keys(outputs); _i < _a.length; _i++) {
            var outputName = _a[_i];
            if (this.template.Parameters[outputName]) {
                throw new Error("Conflicting CloudFormation parameter name: " + outputName);
            }
        }
        this.template.Outputs = __assign(__assign({}, this.template.Outputs), outputs);
    };
    TransformerContext.prototype.mergeMappings = function (mapping) {
        for (var _i = 0, _a = Object.keys(mapping); _i < _a.length; _i++) {
            var mappingName = _a[_i];
            if (this.template.Mappings[mappingName]) {
                throw new Error("Conflicting CloudFormation mapping name: " + mappingName);
            }
        }
        this.template.Mappings = __assign(__assign({}, this.template.Mappings), mapping);
    };
    /**
     * Add an object type definition node to the context. If the type already
     * exists an error will be thrown.
     * @param obj The object type definition node to add.
     */
    TransformerContext.prototype.putSchema = function (obj) {
        this.nodeMap.__schema = obj;
    };
    /**
     * Returns the schema definition record. If the user provides a schema
     * definition as part of the input document, that node is returned.
     * Otherwise a blank schema definition with default operation types
     * is returned.
     */
    TransformerContext.prototype.getSchema = function () {
        return this.nodeMap.__schema;
    };
    TransformerContext.prototype.getQueryTypeName = function () {
        var schemaNode = this.getSchema();
        var queryTypeName = schemaNode.operationTypes.find(function (op) { return op.operation === 'query'; });
        if (queryTypeName && queryTypeName.type && queryTypeName.type.name) {
            return queryTypeName.type.name.value;
        }
    };
    TransformerContext.prototype.getQuery = function () {
        var queryTypeName = this.getQueryTypeName();
        if (queryTypeName) {
            return this.nodeMap[queryTypeName];
        }
    };
    TransformerContext.prototype.getMutationTypeName = function () {
        var schemaNode = this.getSchema();
        var mutationTypeName = schemaNode.operationTypes.find(function (op) { return op.operation === 'mutation'; });
        if (mutationTypeName && mutationTypeName.type && mutationTypeName.type.name) {
            return mutationTypeName.type.name.value;
        }
    };
    TransformerContext.prototype.getMutation = function () {
        var mutationTypeName = this.getMutationTypeName();
        if (mutationTypeName) {
            return this.nodeMap[mutationTypeName];
        }
    };
    TransformerContext.prototype.getSubscriptionTypeName = function () {
        var schemaNode = this.getSchema();
        var subscriptionTypeName = schemaNode.operationTypes.find(function (op) { return op.operation === 'subscription'; });
        if (subscriptionTypeName && subscriptionTypeName.type && subscriptionTypeName.type.name) {
            return subscriptionTypeName.type.name.value;
        }
    };
    TransformerContext.prototype.getSubscription = function () {
        var subscriptionTypeName = this.getSubscriptionTypeName();
        if (subscriptionTypeName) {
            return this.nodeMap[subscriptionTypeName];
        }
    };
    /**
     * Add a generic type.
     * @param obj The type to add
     */
    TransformerContext.prototype.addType = function (obj) {
        if (this.nodeMap[obj.name.value]) {
            throw new Error("Conflicting type '" + obj.name.value + "' found.");
        }
        this.nodeMap[obj.name.value] = obj;
    };
    TransformerContext.prototype.putType = function (obj) {
        this.nodeMap[obj.name.value] = obj;
    };
    TransformerContext.prototype.getType = function (name) {
        return this.nodeMap[name];
    };
    /**
     * Add an object type definition node to the context. If the type already
     * exists an error will be thrown.
     * @param obj The object type definition node to add.
     */
    TransformerContext.prototype.addObject = function (obj) {
        if (this.nodeMap[obj.name.value]) {
            throw new Error("Conflicting type '" + obj.name.value + "' found.");
        }
        this.nodeMap[obj.name.value] = obj;
    };
    TransformerContext.prototype.updateObject = function (obj) {
        if (!this.nodeMap[obj.name.value]) {
            throw new Error("Type " + obj.name.value + " does not exist.");
        }
        this.nodeMap[obj.name.value] = obj;
    };
    TransformerContext.prototype.getObject = function (name) {
        if (this.nodeMap[name]) {
            var node = this.nodeMap[name];
            if (node.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION) {
                return node;
            }
        }
    };
    /**
     * Extends the context query object with additional fields.
     * If the customer uses a name other than 'Query' this will proxy to the
     * correct type.
     * @param fields The fields to add the query type.
     */
    TransformerContext.prototype.addQueryFields = function (fields) {
        var queryTypeName = this.getQueryTypeName();
        if (queryTypeName) {
            if (!this.getType(queryTypeName)) {
                this.addType(blankObject(queryTypeName));
            }
            var queryType = objectExtension(queryTypeName, fields);
            this.addObjectExtension(queryType);
        }
    };
    /**
     * Extends the context mutation object with additional fields.
     * If the customer uses a name other than 'Mutation' this will proxy to the
     * correct type.
     * @param fields The fields to add the mutation type.
     */
    TransformerContext.prototype.addMutationFields = function (fields) {
        var mutationTypeName = this.getMutationTypeName();
        if (mutationTypeName) {
            if (!this.getType(mutationTypeName)) {
                this.addType(blankObject(mutationTypeName));
            }
            var mutationType = objectExtension(mutationTypeName, fields);
            this.addObjectExtension(mutationType);
        }
    };
    /**
     * Extends the context subscription object with additional fields.
     * If the customer uses a name other than 'Subscription' this will proxy to the
     * correct type.
     * @param fields The fields to add the subscription type.
     */
    TransformerContext.prototype.addSubscriptionFields = function (fields) {
        var subscriptionTypeName = this.getSubscriptionTypeName();
        if (subscriptionTypeName) {
            if (!this.getType(subscriptionTypeName)) {
                this.addType(blankObject(subscriptionTypeName));
            }
            var subscriptionType = objectExtension(subscriptionTypeName, fields);
            this.addObjectExtension(subscriptionType);
        }
    };
    /**
     * Add an object type extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The object type definition node to add.
     */
    TransformerContext.prototype.addObjectExtension = function (obj) {
        if (!this.nodeMap[obj.name.value]) {
            throw new Error("Cannot extend non-existant type '" + obj.name.value + "'.");
        }
        // AppSync does not yet understand type extensions so fold the types in.
        var oldNode = this.getObject(obj.name.value);
        var newDirs = [];
        var oldDirs = oldNode.directives || [];
        // Filter out duplicate directives, do not add them
        if (obj.directives) {
            var _loop_1 = function (newDir) {
                if (Boolean(oldDirs.find(function (d) { return d.name.value === newDir.name.value; })) === false) {
                    newDirs.push(newDir);
                }
            };
            for (var _i = 0, _a = obj.directives; _i < _a.length; _i++) {
                var newDir = _a[_i];
                _loop_1(newDir);
            }
        }
        var mergedDirs = __spreadArrays(oldDirs, newDirs);
        // An extension cannot redeclare fields.
        var oldFields = oldNode.fields || [];
        var oldFieldMap = oldFields.reduce(function (acc, field) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[field.name.value] = field, _a)));
        }, {});
        var newFields = obj.fields || [];
        var mergedFields = __spreadArrays(oldFields);
        for (var _b = 0, newFields_1 = newFields; _b < newFields_1.length; _b++) {
            var newField = newFields_1[_b];
            if (oldFieldMap[newField.name.value]) {
                throw new Error("Object type extension '" + obj.name.value + "' cannot redeclare field " + newField.name.value);
            }
            mergedFields.push(newField);
        }
        // An extension cannot redeclare interfaces
        var oldInterfaces = oldNode.interfaces || [];
        var oldInterfaceMap = oldInterfaces.reduce(function (acc, field) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[field.name.value] = field, _a)));
        }, {});
        var newInterfaces = obj.interfaces || [];
        var mergedInterfaces = __spreadArrays(oldInterfaces);
        for (var _c = 0, newInterfaces_1 = newInterfaces; _c < newInterfaces_1.length; _c++) {
            var newInterface = newInterfaces_1[_c];
            if (oldInterfaceMap[newInterface.name.value]) {
                throw new Error("Object type extension '" + obj.name.value + "' cannot redeclare interface " + newInterface.name.value);
            }
            mergedInterfaces.push(newInterface);
        }
        this.nodeMap[oldNode.name.value] = __assign(__assign({}, oldNode), { interfaces: mergedInterfaces, directives: mergedDirs, fields: mergedFields });
    };
    /**
     * Add an input object type extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The input object type definition node to add.
     */
    TransformerContext.prototype.addInputExtension = function (obj) {
        if (!this.nodeMap[obj.name.value]) {
            throw new Error("Cannot extend non-existant input '" + obj.name.value + "'.");
        }
        // AppSync does not yet understand type extensions so fold the types in.
        var oldNode = this.getType(obj.name.value);
        var newDirs = obj.directives || [];
        var oldDirs = oldNode.directives || [];
        var mergedDirs = __spreadArrays(oldDirs, newDirs);
        // An extension cannot redeclare fields.
        var oldFields = oldNode.fields || [];
        var oldFieldMap = oldFields.reduce(function (acc, field) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[field.name.value] = field, _a)));
        }, {});
        var newFields = obj.fields || [];
        var mergedFields = __spreadArrays(oldFields);
        for (var _i = 0, newFields_2 = newFields; _i < newFields_2.length; _i++) {
            var newField = newFields_2[_i];
            if (oldFieldMap[newField.name.value]) {
                throw new Error("Input object type extension '" + obj.name.value + "' cannot redeclare field " + newField.name.value);
            }
            mergedFields.push(newField);
        }
        this.nodeMap[oldNode.name.value] = __assign(__assign({}, oldNode), { directives: mergedDirs, fields: mergedFields });
    };
    /**
     * Add an interface extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The interface type definition node to add.
     */
    TransformerContext.prototype.addInterfaceExtension = function (obj) {
        if (!this.nodeMap[obj.name.value]) {
            throw new Error("Cannot extend non-existant interface '" + obj.name.value + "'.");
        }
        // AppSync does not yet understand type extensions so fold the types in.
        var oldNode = this.getType(obj.name.value);
        var newDirs = obj.directives || [];
        var oldDirs = oldNode.directives || [];
        var mergedDirs = __spreadArrays(oldDirs, newDirs);
        // An extension cannot redeclare fields.
        var oldFields = oldNode.fields || [];
        var oldFieldMap = oldFields.reduce(function (acc, field) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[field.name.value] = field, _a)));
        }, {});
        var newFields = obj.fields || [];
        var mergedFields = __spreadArrays(oldFields);
        for (var _i = 0, newFields_3 = newFields; _i < newFields_3.length; _i++) {
            var newField = newFields_3[_i];
            if (oldFieldMap[newField.name.value]) {
                throw new Error("Interface type extension '" + obj.name.value + "' cannot redeclare field " + newField.name.value);
            }
            mergedFields.push(newField);
        }
        this.nodeMap[oldNode.name.value] = __assign(__assign({}, oldNode), { directives: mergedDirs, fields: mergedFields });
    };
    /**
     * Add an union extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The union type definition node to add.
     */
    TransformerContext.prototype.addUnionExtension = function (obj) {
        if (!this.nodeMap[obj.name.value]) {
            throw new Error("Cannot extend non-existant union '" + obj.name.value + "'.");
        }
        // AppSync does not yet understand type extensions so fold the types in.
        var oldNode = this.getType(obj.name.value);
        var newDirs = obj.directives || [];
        var oldDirs = oldNode.directives || [];
        var mergedDirs = __spreadArrays(oldDirs, newDirs);
        // An extension cannot redeclare possible values
        var oldTypes = oldNode.types || [];
        var oldTypeMap = oldTypes.reduce(function (acc, type) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[type.name.value] = true, _a)));
        }, {});
        var newTypes = obj.types || [];
        var mergedFields = __spreadArrays(oldTypes);
        for (var _i = 0, newTypes_1 = newTypes; _i < newTypes_1.length; _i++) {
            var newType = newTypes_1[_i];
            if (oldTypeMap[newType.name.value]) {
                throw new Error("Union type extension '" + obj.name.value + "' cannot redeclare type " + newType.name.value);
            }
            mergedFields.push(newType);
        }
        this.nodeMap[oldNode.name.value] = __assign(__assign({}, oldNode), { directives: mergedDirs, types: mergedFields });
    };
    /**
     * Add an enum extension definition node to the context. If a type with this
     * name does not already exist, an exception is thrown.
     * @param obj The enum type definition node to add.
     */
    TransformerContext.prototype.addEnumExtension = function (obj) {
        if (!this.nodeMap[obj.name.value]) {
            throw new Error("Cannot extend non-existant enum '" + obj.name.value + "'.");
        }
        // AppSync does not yet understand type extensions so fold the types in.
        var oldNode = this.getType(obj.name.value);
        var newDirs = obj.directives || [];
        var oldDirs = oldNode.directives || [];
        var mergedDirs = __spreadArrays(oldDirs, newDirs);
        // An extension cannot redeclare possible values
        var oldValues = oldNode.values || [];
        var oldValuesMap = oldValues.reduce(function (acc, type) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[type.name.value] = true, _a)));
        }, {});
        var newValues = obj.values || [];
        var mergedValues = __spreadArrays(oldValues);
        for (var _i = 0, newValues_1 = newValues; _i < newValues_1.length; _i++) {
            var newValue = newValues_1[_i];
            if (oldValuesMap[newValue.name.value]) {
                throw new Error("Enum type extension '" + obj.name.value + "' cannot redeclare value " + newValue.name.value);
            }
            mergedValues.push(newValue);
        }
        this.nodeMap[oldNode.name.value] = __assign(__assign({}, oldNode), { directives: mergedDirs, values: mergedValues });
    };
    /**
     * Add an input type definition node to the context.
     * @param inp The input type definition node to add.
     */
    TransformerContext.prototype.addInput = function (inp) {
        if (this.nodeMap[inp.name.value]) {
            throw new Error("Conflicting input type '" + inp.name.value + "' found.");
        }
        this.nodeMap[inp.name.value] = inp;
    };
    /**
     * Add an enum type definition node to the context.
     * @param en The enum type definition node to add.
     */
    TransformerContext.prototype.addEnum = function (en) {
        if (this.nodeMap[en.name.value]) {
            throw new Error("Conflicting enum type '" + en.name.value + "' found.");
        }
        this.nodeMap[en.name.value] = en;
    };
    /**
     * Add an item to the stack mapping.
     * @param stackName The destination stack name.
     * @param resource The resource id that should be put into the stack.
     */
    TransformerContext.prototype.mapResourceToStack = function (stackName, resource) {
        this.stackMapping.set(resource, stackName);
    };
    TransformerContext.prototype.getStackMapping = function () {
        return this.stackMapping;
    };
    /**
     * Setter and getter the sync config
     */
    TransformerContext.prototype.setResolverConfig = function (resolverConfig) {
        if (this.resolverConfig) {
            throw new Error("Resolver Configuration has already been added to the context");
        }
        this.resolverConfig = resolverConfig;
    };
    TransformerContext.prototype.getResolverConfig = function () {
        return this.resolverConfig;
    };
    TransformerContext.prototype.setTransformerVersion = function (version) {
        this.transformerVersion = version;
    };
    TransformerContext.prototype.getTransformerVersion = function () {
        return this.transformerVersion;
    };
    return TransformerContext;
}());
exports.TransformerContext = TransformerContext;
//# sourceMappingURL=TransformerContext.js.map