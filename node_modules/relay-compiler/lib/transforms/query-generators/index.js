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

var NodeQueryGenerator = require('./NodeQueryGenerator');

var QueryQueryGenerator = require('./QueryQueryGenerator');

var ViewerQueryGenerator = require('./ViewerQueryGenerator');

var _require = require('../../core/CompilerError'),
    createUserError = _require.createUserError;

var GENERATORS = [ViewerQueryGenerator, QueryQueryGenerator, NodeQueryGenerator];
/**
 * Builds a query to refetch the given fragment or throws if we have not way to
 * generate one.
 */

function buildRefetchOperation(schema, fragment, queryName) {
  for (var _i = 0, _GENERATORS = GENERATORS; _i < _GENERATORS.length; _i++) {
    var generator = _GENERATORS[_i];
    var refetchRoot = generator.buildRefetchOperation(schema, fragment, queryName);

    if (refetchRoot != null) {
      return refetchRoot;
    }
  }

  throw createUserError("Invalid use of @refetchable on fragment '".concat(fragment.name, "', only ") + 'supported are fragments on:\n' + GENERATORS.map(function (generator) {
    return " - ".concat(generator.description);
  }).join('\n'), [fragment.loc]);
}

module.exports = {
  buildRefetchOperation: buildRefetchOperation
};