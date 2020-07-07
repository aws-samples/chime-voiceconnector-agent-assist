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

/**
 * Validates that all global variables used in operations are defined at the
 * root. This isn't a real transform as it returns the original context, but
 * has to happen before other transforms strip certain variable usages.
 */
function validateGlobalVariablesTransform(context) {
  var contextWithUsedArguments = inferRootArgumentDefinitions(context);
  eachWithCombinedError(context.documents(), function (node) {
    if (node.kind !== 'Root') {
      return;
    }

    var nodeWithUsedArguments = contextWithUsedArguments.getRoot(node.name);
    var definedArguments = argumentDefinitionsToMap(node.argumentDefinitions);
    var usedArguments = argumentDefinitionsToMap(nodeWithUsedArguments.argumentDefinitions); // All used arguments must be defined

    var undefinedVariables = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = usedArguments.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var argDef = _step.value;

        if (!definedArguments.has(argDef.name)) {
          undefinedVariables.push(argDef);
        }
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

    if (undefinedVariables.length !== 0) {
      throw createUserError("Operation '".concat(node.name, "' references undefined variable(s):\n").concat(undefinedVariables.map(function (argDef) {
        return "- $".concat(argDef.name, ": ").concat(context.getSchema().getTypeString(argDef.type));
      }).join('\n'), "."), undefinedVariables.map(function (argDef) {
        return argDef.loc;
      }));
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
  transform: validateGlobalVariablesTransform
};