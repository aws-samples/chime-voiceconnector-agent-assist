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

var RelayRecordState = require('./RelayRecordState');

var EXISTENT = RelayRecordState.EXISTENT,
    NONEXISTENT = RelayRecordState.NONEXISTENT,
    UNKNOWN = RelayRecordState.UNKNOWN;
/**
 * An implementation of the `MutableRecordSource` interface (defined in
 * `RelayStoreTypes`) that holds all records in memory.
 */

var RelayRecordSourceObjectImpl =
/*#__PURE__*/
function () {
  function RelayRecordSourceObjectImpl(records) {
    this._records = records || {};
  }

  var _proto = RelayRecordSourceObjectImpl.prototype;

  _proto.clear = function clear() {
    this._records = {};
  };

  _proto["delete"] = function _delete(dataID) {
    this._records[dataID] = null;
  };

  _proto.get = function get(dataID) {
    return this._records[dataID];
  };

  _proto.getRecordIDs = function getRecordIDs() {
    return Object.keys(this._records);
  };

  _proto.getStatus = function getStatus(dataID) {
    if (!this._records.hasOwnProperty(dataID)) {
      return UNKNOWN;
    }

    return this._records[dataID] == null ? NONEXISTENT : EXISTENT;
  };

  _proto.has = function has(dataID) {
    return this._records.hasOwnProperty(dataID);
  };

  _proto.remove = function remove(dataID) {
    delete this._records[dataID];
  };

  _proto.set = function set(dataID, record) {
    this._records[dataID] = record;
  };

  _proto.size = function size() {
    return Object.keys(this._records).length;
  };

  _proto.toJSON = function toJSON() {
    return this._records;
  };

  return RelayRecordSourceObjectImpl;
}();

module.exports = RelayRecordSourceObjectImpl;