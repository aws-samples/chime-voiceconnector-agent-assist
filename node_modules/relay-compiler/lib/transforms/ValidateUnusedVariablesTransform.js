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

var inferRootArgumentDefinitions = require('../core/inferRootArgumentDefinitions');

var _require = require('../core/CompilerError'),
    createUserError = _require.createUserError,
    eachWithCombinedError = _require.eachWithCombinedError;

var SCHEMA_EXTENSION = 'directive @DEPRECATED__relay_ignore_unused_variables_error on QUERY | MUTATION | SUBSCRIPTION';
/**
 * Validates that there are no unused variables in the operation.
 * former `graphql-js`` NoUnusedVariablesRule
 */

function validateUnusedVariablesTransform(context) {
  var contextWithUsedArguments = inferRootArgumentDefinitions(context);
  eachWithCombinedError(context.documents(), function (node) {
    if (node.kind !== 'Root') {
      return;
    }

    var rootArgumentLocations = new Map(node.argumentDefinitions.map(function (arg) {
      return [arg.name, arg.loc];
    }));
    var nodeWithUsedArguments = contextWithUsedArguments.getRoot(node.name);
    var usedArguments = argumentDefinitionsToMap(nodeWithUsedArguments.argumentDefinitions);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = usedArguments.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var usedArgumentName = _step.value;
        rootArgumentLocations["delete"](usedArgumentName);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var ignoreErrorDirective = node.directives.find(function (_ref) {
      var name = _ref.name;
      return name === 'DEPRECATED__relay_ignore_unused_variables_error';
    });

    if (rootArgumentLocations.size > 0 && !ignoreErrorDirective) {
      var isPlural = rootArgumentLocations.size > 1;
      throw createUserError("Variable".concat(isPlural ? 's' : '', " '$").concat(Array.from(rootArgumentLocations.keys()).join("', '$"), "' ").concat(isPlural ? 'are' : 'is', " never used in operation '").concat(node.name, "'."), Array.from(rootArgumentLocations.values()));
    }

    if (rootArgumentLocations.size === 0 && ignoreErrorDirective) {
      throw createUserError("Invalid usage of '@DEPRECATED__relay_ignore_unused_variables_error.'" + "No unused variables found in the query '".concat(node.name, "'"), [ignoreErrorDirective.loc]);
    }
  });
  return context;
}

function argumentDefinitionsToMap(argDefs) {
  var map = new Map();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = argDefs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var argDef = _step2.value;
      map.set(argDef.name, argDef);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return map;
}

module.exports = {
  transform: validateUnusedVariablesTransform,
  SCHEMA_EXTENSION: SCHEMA_EXTENSION
};