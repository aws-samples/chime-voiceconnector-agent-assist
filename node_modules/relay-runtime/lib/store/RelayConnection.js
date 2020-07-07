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

// Intentionally inexact
// Note: The phantom TEdge type allows propagation of the `edges` field
// selections.
// eslint-disable-next-line no-unused-vars
var CONNECTION_KEY = '__connection';
var CONNECTION_TYPENAME = '__ConnectionRecord';

function createConnectionID(parentID, label) {
  return "connection:".concat(parentID, ":").concat(label);
}

function createConnectionRecord(connectionID) {
  return {
    __id: connectionID,
    __typename: '__ConnectionRecord',
    events: []
  };
}

module.exports = {
  createConnectionID: createConnectionID,
  createConnectionRecord: createConnectionRecord,
  CONNECTION_KEY: CONNECTION_KEY,
  CONNECTION_TYPENAME: CONNECTION_TYPENAME
};