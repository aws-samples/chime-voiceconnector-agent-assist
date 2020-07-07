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
 * `RelayStoreTypes`) that holds all records in memory (JS Map).
 */

var RelayMapRecordSourceMapImpl =
/*#__PURE__*/
function () {
  function RelayMapRecordSourceMapImpl(records) {
    var _this = this;

    this._records = new Map();

    if (records != null) {
      Object.keys(records).forEach(function (key) {
        _this._records.set(key, records[key]);
      });
    }
  }

  var _proto = RelayMapRecordSourceMapImpl.prototype;

  _proto.clear = function clear() {
    this._records = new Map();
  };

  _proto["delete"] = function _delete(dataID) {
    this._records.set(dataID, null);
  };

  _proto.get = function get(dataID) {
    return this._records.get(dataID);
  };

  _proto.getRecordIDs = function getRecordIDs() {
    return Array.from(this._records.keys());
  };

  _proto.getStatus = function getStatus(dataID) {
    if (!this._records.has(dataID)) {
      return UNKNOWN;
    }

    return this._records.get(dataID) == null ? NONEXISTENT : EXISTENT;
  };

  _proto.has = function has(dataID) {
    return this._records.has(dataID);
  };

  _proto.remove = function remove(dataID) {
    this._records["delete"](dataID);
  };

  _proto.set = function set(dataID, record) {
    this._records.set(dataID, record);
  };

  _proto.size = function size() {
    return this._records.size;
  };

  _proto.toJSON = function toJSON() {
    var obj = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this._records[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _step.value,
            key = _step$value[0],
            value = _step$value[1];
        obj[key] = value;
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

    return obj;
  };

  return RelayMapRecordSourceMapImpl;
}();

module.exports = RelayMapRecordSourceMapImpl;