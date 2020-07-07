/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
// flowlint ambiguous-object-type:error
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var IRTransformer = require('../core/IRTransformer');

var getLiteralArgumentValues = require('../core/getLiteralArgumentValues');

var getNormalizationOperationName = require('../core/getNormalizationOperationName');

var _require = require('../core/CompilerError'),
    createUserError = _require.createUserError;

var _require2 = require('relay-runtime'),
    getModuleComponentKey = _require2.getModuleComponentKey,
    getModuleOperationKey = _require2.getModuleOperationKey;

var SUPPORTED_ARGUMENT_NAME = 'supported';
var JS_FIELD_TYPE = 'JSDependency';
var JS_FIELD_MODULE_ARG = 'module';
var JS_FIELD_ID_ARG = 'id';
var JS_FIELD_NAME = 'js';
var SCHEMA_EXTENSION = "\n  directive @match on FIELD\n\n  directive @module(\n    name: String!\n  ) on FRAGMENT_SPREAD\n";

/**
 * This transform rewrites LinkedField nodes with @match and rewrites them
 * into `LinkedField` nodes with a `supported` argument.
 */
function matchTransform(context) {
  return IRTransformer.transform(context, {
    // TODO: type IRTransformer to allow changing result type
    FragmentSpread: visitFragmentSpread,
    LinkedField: visitLinkedField,
    InlineFragment: visitInlineFragment,
    ScalarField: visitScalarField
  }, function (node) {
    return {
      documentName: node.name,
      parentType: node.type,
      path: []
    };
  });
}

function visitInlineFragment(node, state) {
  return this.traverse(node, (0, _objectSpread2["default"])({}, state, {
    parentType: node.typeCondition
  }));
}

function visitScalarField(field) {
  var context = this.getContext();
  var schema = context.getSchema();

  if (field.name === JS_FIELD_NAME) {
    var jsModuleType = schema.getTypeFromString(JS_FIELD_TYPE);

    if (jsModuleType == null || !schema.isServerType(jsModuleType)) {
      throw new createUserError("'".concat(JS_FIELD_NAME, "' should be defined on the server schema."), [field.loc]);
    }

    if (schema.isScalar(jsModuleType) && schema.areEqualTypes(schema.getRawType(field.type), jsModuleType)) {
      throw new createUserError("Direct use of the '".concat(JS_FIELD_NAME, "' field is not allowed, use ") + '@match/@module instead.', [field.loc]);
    }
  }

  return field;
}

function visitLinkedField(node, state) {
  var context = this.getContext();
  var schema = context.getSchema();
  state.path.push(node.alias);
  var transformedNode = this.traverse(node, (0, _objectSpread2["default"])({}, state, {
    parentType: node.type
  }));
  state.path.pop();
  var matchDirective = transformedNode.directives.find(function (directive) {
    return directive.name === 'match';
  });

  if (matchDirective == null) {
    return transformedNode;
  }

  var parentType = state.parentType;
  var rawType = schema.getRawType(parentType);

  if (!(schema.isInterface(rawType) || schema.isObject(rawType))) {
    throw createUserError("@match used on incompatible field '".concat(transformedNode.name, "'.") + '@match may only be used with fields whose parent type is an ' + "interface or object, got invalid type '".concat(schema.getTypeString(parentType), "'."), [node.loc]);
  }

  var currentField = schema.getFieldConfig(schema.expectField(schema.assertCompositeType(rawType), transformedNode.name));
  var supportedArgumentDefinition = currentField.args.find(function (_ref4) {
    var name = _ref4.name;
    return name === SUPPORTED_ARGUMENT_NAME;
  });
  var supportedArgType = supportedArgumentDefinition != null ? schema.getNullableType(supportedArgumentDefinition.type) : null;
  var supportedArgOfType = supportedArgType != null && schema.isList(supportedArgType) ? schema.getListItemType(supportedArgType) : null;

  if (supportedArgumentDefinition == null || supportedArgType == null || supportedArgOfType == null || !schema.isString(schema.getNullableType(supportedArgOfType))) {
    throw createUserError("@match used on incompatible field '".concat(transformedNode.name, "'. ") + '@match may only be used with fields that accept a ' + "'supported: [String!]!' argument.", [node.loc]);
  }

  var rawFieldType = schema.getRawType(transformedNode.type);

  if (!schema.isAbstractType(rawFieldType)) {
    throw createUserError("@match used on incompatible field '".concat(transformedNode.name, "'.") + '@match may only be used with fields that return a union or interface.', [node.loc]);
  }

  var seenTypes = new Map();
  var selections = [];
  transformedNode.selections.forEach(function (matchSelection) {
    if (matchSelection.kind === 'ScalarField' && matchSelection.name === '__typename') {
      selections.push(matchSelection);
      return;
    }

    var moduleImport = matchSelection.kind === 'InlineFragment' ? matchSelection.selections[0] : null;

    if (matchSelection.kind !== 'InlineFragment' || moduleImport == null || moduleImport.kind !== 'ModuleImport') {
      throw createUserError('Invalid @match selection: all selections should be ' + 'fragment spreads with @module.', [matchSelection.loc]);
    }

    var matchedType = matchSelection.typeCondition;
    var previousTypeUsage = seenTypes.get(matchedType);

    if (previousTypeUsage) {
      throw createUserError('Invalid @match selection: each concrete variant/implementor of ' + "'".concat(schema.getTypeString(rawFieldType), "' may be matched against at-most once, ") + "but '".concat(schema.getTypeString(matchedType), "' was matched against multiple times."), [matchSelection.loc, previousTypeUsage.loc]);
    }

    seenTypes.set(matchedType, matchSelection);
    selections.push(matchSelection);
  });

  if (seenTypes.size === 0) {
    throw createUserError('Invalid @match selection: expected at least one @module selection. ' + "Remove @match or add a '...Fragment @module()' selection.", [matchDirective.loc]);
  }

  var supportedArg = transformedNode.args.find(function (arg) {
    return arg.name === SUPPORTED_ARGUMENT_NAME;
  });

  if (supportedArg != null) {
    throw createUserError("Invalid @match selection: the '".concat(SUPPORTED_ARGUMENT_NAME, "' argument ") + 'is automatically added and cannot be supplied explicitly.', [supportedArg.loc]);
  }

  return {
    kind: 'LinkedField',
    alias: transformedNode.alias,
    args: [].concat((0, _toConsumableArray2["default"])(transformedNode.args), [{
      kind: 'Argument',
      name: SUPPORTED_ARGUMENT_NAME,
      type: supportedArgumentDefinition.type,
      value: {
        kind: 'Literal',
        loc: node.loc,
        value: Array.from(seenTypes.keys()).map(function (type) {
          return schema.getTypeString(type);
        })
      },
      loc: node.loc
    }]),
    connection: false,
    directives: [],
    handles: null,
    loc: node.loc,
    metadata: null,
    name: transformedNode.name,
    type: transformedNode.type,
    selections: selections
  };
} // Transform @module


function visitFragmentSpread(spread, _ref5) {
  var _ref, _moduleDirective$args2, _ref2, _moduleDirective$args3, _ref3, _moduleDirective$args4;

  var documentName = _ref5.documentName,
      path = _ref5.path;
  var transformedNode = this.traverse(spread);
  var moduleDirective = transformedNode.directives.find(function (directive) {
    return directive.name === 'module';
  });

  if (moduleDirective == null) {
    return transformedNode;
  }

  if (spread.args.length !== 0) {
    var _spread$args$;

    throw createUserError('@module does not support @arguments.', [(_spread$args$ = spread.args[0]) === null || _spread$args$ === void 0 ? void 0 : _spread$args$.loc].filter(Boolean));
  }

  var context = this.getContext();
  var schema = context.getSchema();
  var jsModuleType = schema.asScalarFieldType(schema.getTypeFromString(JS_FIELD_TYPE));

  if (jsModuleType == null || !schema.isServerType(jsModuleType)) {
    throw new createUserError("'".concat(JS_FIELD_NAME, "' should be defined on the server schema."), [spread.loc]);
  }

  if (!schema.isScalar(jsModuleType)) {
    throw createUserError('Using @module requires the schema to define a scalar ' + "'".concat(JS_FIELD_TYPE, "' type."));
  }

  var fragment = context.getFragment(spread.name, spread.loc);

  if (!schema.isObject(fragment.type)) {
    throw createUserError("@module used on invalid fragment spread '...".concat(spread.name, "'. @module ") + 'may only be used with fragments on a concrete (object) type, ' + "but the fragment has abstract type '".concat(schema.getTypeString(fragment.type), "'."), [spread.loc, fragment.loc]);
  }

  var field = schema.getFieldByName(fragment.type, JS_FIELD_NAME);

  if (!field) {
    throw createUserError("@module used on invalid fragment spread '...".concat(spread.name, "'. @module ") + "requires the fragment type '".concat(schema.getTypeString(fragment.type), "' to have a ") + "'".concat(JS_FIELD_NAME, "(").concat(JS_FIELD_MODULE_ARG, ": String! ") + "[".concat(JS_FIELD_ID_ARG, ": String]): ").concat(JS_FIELD_TYPE, "' field (your ") + "schema may choose to omit the 'id'  argument but if present it " + "must accept a 'String').", [moduleDirective.loc]);
  }

  var jsField = schema.getFieldConfig(field);
  var jsFieldModuleArg = jsField ? jsField.args.find(function (arg) {
    return arg.name === JS_FIELD_MODULE_ARG;
  }) : null;
  var jsFieldIdArg = jsField ? jsField.args.find(function (arg) {
    return arg.name === JS_FIELD_ID_ARG;
  }) : null;

  if (jsFieldModuleArg == null || !schema.isString(schema.getNullableType(jsFieldModuleArg.type)) || jsFieldIdArg != null && !schema.isString(jsFieldIdArg.type) || jsField.type !== jsModuleType) {
    throw createUserError("@module used on invalid fragment spread '...".concat(spread.name, "'. @module ") + "requires the fragment type '".concat(schema.getTypeString(fragment.type), "' to have a ") + "'".concat(JS_FIELD_NAME, "(").concat(JS_FIELD_MODULE_ARG, ": String! ") + "[".concat(JS_FIELD_ID_ARG, ": String]): ").concat(JS_FIELD_TYPE, "' field (your ") + "schema may choose to omit the 'id'  argument but if present it " + "must accept a 'String').", [moduleDirective.loc]);
  }

  if (spread.directives.length !== 1) {
    throw createUserError("@module used on invalid fragment spread '...".concat(spread.name, "'. @module ") + 'may not have additional directives.', [spread.loc]);
  }

  var _getLiteralArgumentVa = getLiteralArgumentValues(moduleDirective.args),
      moduleName = _getLiteralArgumentVa.name;

  if (typeof moduleName !== 'string') {
    var _moduleDirective$args;

    throw createUserError("Expected the 'name' argument of @module to be a literal string", [((_moduleDirective$args = moduleDirective.args.find(function (arg) {
      return arg.name === 'name';
    })) !== null && _moduleDirective$args !== void 0 ? _moduleDirective$args : spread).loc]);
  }

  var moduleId = [documentName].concat((0, _toConsumableArray2["default"])(path)).join('.');
  var normalizationName = getNormalizationOperationName(spread.name) + '.graphql';
  var componentKey = getModuleComponentKey(documentName);
  var componentField = {
    alias: componentKey,
    args: [{
      kind: 'Argument',
      name: JS_FIELD_MODULE_ARG,
      type: jsFieldModuleArg.type,
      value: {
        kind: 'Literal',
        loc: (_ref = (_moduleDirective$args2 = moduleDirective.args[0]) === null || _moduleDirective$args2 === void 0 ? void 0 : _moduleDirective$args2.loc) !== null && _ref !== void 0 ? _ref : moduleDirective.loc,
        value: moduleName
      },
      loc: moduleDirective.loc
    }, jsFieldIdArg != null ? {
      kind: 'Argument',
      name: JS_FIELD_ID_ARG,
      type: jsFieldIdArg.type,
      value: {
        kind: 'Literal',
        loc: (_ref2 = (_moduleDirective$args3 = moduleDirective.args[0]) === null || _moduleDirective$args3 === void 0 ? void 0 : _moduleDirective$args3.loc) !== null && _ref2 !== void 0 ? _ref2 : moduleDirective.loc,
        value: moduleId
      },
      loc: moduleDirective.loc
    } : null].filter(Boolean),
    directives: [],
    handles: null,
    kind: 'ScalarField',
    loc: moduleDirective.loc,
    metadata: {
      skipNormalizationNode: true
    },
    name: JS_FIELD_NAME,
    type: jsModuleType
  };
  var operationKey = getModuleOperationKey(documentName);
  var operationField = {
    alias: operationKey,
    args: [{
      kind: 'Argument',
      name: JS_FIELD_MODULE_ARG,
      type: jsFieldModuleArg.type,
      value: {
        kind: 'Literal',
        loc: moduleDirective.loc,
        value: normalizationName
      },
      loc: moduleDirective.loc
    }, jsFieldIdArg != null ? {
      kind: 'Argument',
      name: JS_FIELD_ID_ARG,
      type: jsFieldIdArg.type,
      value: {
        kind: 'Literal',
        loc: (_ref3 = (_moduleDirective$args4 = moduleDirective.args[0]) === null || _moduleDirective$args4 === void 0 ? void 0 : _moduleDirective$args4.loc) !== null && _ref3 !== void 0 ? _ref3 : moduleDirective.loc,
        value: moduleId
      },
      loc: moduleDirective.loc
    } : null].filter(Boolean),
    directives: [],
    handles: null,
    kind: 'ScalarField',
    loc: moduleDirective.loc,
    metadata: {
      skipNormalizationNode: true
    },
    name: JS_FIELD_NAME,
    type: jsModuleType
  };
  return {
    kind: 'InlineFragment',
    directives: [],
    loc: moduleDirective.loc,
    metadata: null,
    selections: [{
      kind: 'ModuleImport',
      loc: moduleDirective.loc,
      documentName: documentName,
      id: moduleId,
      module: moduleName,
      name: spread.name,
      selections: [(0, _objectSpread2["default"])({}, spread, {
        directives: spread.directives.filter(function (directive) {
          return directive !== moduleDirective;
        })
      }), operationField, componentField]
    }],
    typeCondition: fragment.type
  };
}

module.exports = {
  SCHEMA_EXTENSION: SCHEMA_EXTENSION,
  transform: matchTransform
};