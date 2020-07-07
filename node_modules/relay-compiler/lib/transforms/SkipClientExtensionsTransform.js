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

var IRTransformer = require('../core/IRTransformer');

function skipClientExtensionTransform(context) {
  return IRTransformer.transform(context, {
    Fragment: visitFragment,
    ClientExtension: visitClientExtension
  });
}

function visitFragment(node) {
  var context = this.getContext();

  if (context.getSchema().isServerType(node.type)) {
    return this.traverse(node);
  }

  return null;
}

function visitClientExtension(node, state) {
  return null;
}

module.exports = {
  transform: skipClientExtensionTransform
};