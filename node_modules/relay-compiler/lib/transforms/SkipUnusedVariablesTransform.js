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

var inferRootArgumentDefinitions = require('../core/inferRootArgumentDefinitions');

/**
 * Refines the argument definitions for operations to remove unused arguments
 * due to statically pruned conditional branches (e.g. because of overriding
 * a variable used in `@include()` to be false).
 */
function skipUnusedVariablesTransform(context) {
  var contextWithUsedArguments = inferRootArgumentDefinitions(context);
  return context.withMutations(function (ctx) {
    var nextContext = ctx;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var node = _step.value;

        if (node.kind !== 'Root') {
          return "continue";
        }

        var usedArguments = new Set(contextWithUsedArguments.getRoot(node.name).argumentDefinitions.map(function (argDef) {
          return argDef.name;
        })); // Remove unused argument definitions

        var usedArgumentDefinitions = node.argumentDefinitions.filter(function (argDef) {
          return usedArguments.has(argDef.name);
        });

        if (usedArgumentDefinitions.length !== node.argumentDefinitions.length) {
          nextContext = nextContext.replace((0, _objectSpread2["default"])({}, node, {
            argumentDefinitions: usedArgumentDefinitions
          }));
        }
      };

      for (var _iterator = nextContext.documents()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ret = _loop();

        if (_ret === "continue") continue;
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

    return nextContext;
  });
}

module.exports = {
  transform: skipUnusedVariablesTransform
};