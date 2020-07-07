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

var _require = require('./TransformUtils'),
    hasUnaliasedSelection = _require.hasUnaliasedSelection;

var TYPENAME_KEY = '__typename';
var cache = new Map();
/**
 * A transform that adds `__typename` field on any `LinkedField` of a union or
 * interface type where there is no unaliased `__typename` selection.
 */

function generateTypeNameTransform(context) {
  cache = new Map();
  var schema = context.getSchema();
  var typenameField = {
    kind: 'ScalarField',
    alias: TYPENAME_KEY,
    args: [],
    directives: [],
    handles: null,
    loc: {
      kind: 'Generated'
    },
    metadata: null,
    name: TYPENAME_KEY,
    type: schema.expectStringType()
  };
  var state = {
    typenameField: typenameField
  };
  return IRTransformer.transform(context, {
    LinkedField: visitLinkedField
  }, function () {
    return state;
  });
}

function visitLinkedField(field, state) {
  var schema = this.getContext().getSchema();
  var transformedNode = cache.get(field);

  if (transformedNode != null) {
    return transformedNode;
  }

  transformedNode = this.traverse(field, state);

  if (schema.isAbstractType(schema.getRawType(transformedNode.type)) && !hasUnaliasedSelection(transformedNode, TYPENAME_KEY)) {
    transformedNode = (0, _objectSpread2["default"])({}, transformedNode, {
      selections: [state.typenameField].concat((0, _toConsumableArray2["default"])(transformedNode.selections))
    });
  }

  cache.set(field, transformedNode);
  return transformedNode;
}

module.exports = {
  transform: generateTypeNameTransform
};