/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+relay
 */
// flowlint ambiguous-object-type:error
'use strict';

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var invariant = require("fbjs/lib/invariant");

var StrictMap =
/*#__PURE__*/
function () {
  function StrictMap(iterable) {
    this._map = new Map(iterable);
    return this;
  }

  var _proto = StrictMap.prototype;

  _proto.clear = function clear() {
    this._map.clear();
  };

  _proto["delete"] = function _delete(key) {
    return this._map["delete"](key);
  };

  _proto.entries = function entries() {
    return this._map.entries();
  };

  _proto.forEach = function forEach(callbackfn, thisArg) {
    this._map.forEach(callbackfn, thisArg);
  };

  _proto.map = function map(f) {
    var result = new StrictMap();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this._map[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _step.value,
            key = _step$value[0],
            val = _step$value[1];
        result.set(key, f(val, key, this));
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

    return result;
  };

  _proto.asyncMap =
  /*#__PURE__*/
  function () {
    var _asyncMap = _asyncToGenerator(function* (f) {
      var _this = this;

      var entryPromises = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop = function _loop() {
          var _step2$value = _step2.value,
              key = _step2$value[0],
              val = _step2$value[1];
          entryPromises.push(f(val, key, _this).then(function (resultVal) {
            return [key, resultVal];
          }));
        };

        for (var _iterator2 = this._map[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop();
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

      var entries = yield Promise.all(entryPromises);
      return new StrictMap(entries);
    });

    function asyncMap(_x) {
      return _asyncMap.apply(this, arguments);
    }

    return asyncMap;
  }();

  _proto.get = function get(key) {
    !this.has(key) ? process.env.NODE_ENV !== "production" ? invariant(false, 'StrictMap: trying to read non-existent key `%s`.', String(key)) : invariant(false) : void 0; // $FlowFixMe - we checked the key exists

    return this._map.get(key);
  };

  _proto.has = function has(key) {
    return this._map.has(key);
  };

  _proto.keys = function keys() {
    return this._map.keys();
  };

  _proto.set = function set(key, value) {
    this._map.set(key, value);

    return this;
  };

  _proto.values = function values() {
    return this._map.values();
  };

  return StrictMap;
}();

module.exports = StrictMap;