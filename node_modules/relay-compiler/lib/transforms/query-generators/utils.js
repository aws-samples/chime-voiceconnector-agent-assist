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

function buildFragmentSpread(fragment) {
  var args = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = fragment.argumentDefinitions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var argDef = _step.value;

      if (argDef.kind !== 'LocalArgumentDefinition') {
        continue;
      }

      args.push({
        kind: 'Argument',
        loc: {
          kind: 'Derived',
          source: argDef.loc
        },
        name: argDef.name,
        type: argDef.type,
        value: {
          kind: 'Variable',
          loc: {
            kind: 'Derived',
            source: argDef.loc
          },
          variableName: argDef.name,
          type: argDef.type
        }
      });
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

  return {
    args: args,
    directives: [],
    kind: 'FragmentSpread',
    loc: {
      kind: 'Derived',
      source: fragment.loc
    },
    metadata: null,
    name: fragment.name
  };
}

function buildOperationArgumentDefinitions(argumentDefinitions) {
  return argumentDefinitions.map(function (argDef) {
    if (argDef.kind === 'LocalArgumentDefinition') {
      return argDef;
    } else {
      return {
        kind: 'LocalArgumentDefinition',
        name: argDef.name,
        type: argDef.type,
        defaultValue: null,
        loc: argDef.loc
      };
    }
  });
}

module.exports = {
  buildFragmentSpread: buildFragmentSpread,
  buildOperationArgumentDefinitions: buildOperationArgumentDefinitions
};