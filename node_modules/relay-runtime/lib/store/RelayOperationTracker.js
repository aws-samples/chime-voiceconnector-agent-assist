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

var invariant = require("fbjs/lib/invariant");

var RelayOperationTracker =
/*#__PURE__*/
function () {
  function RelayOperationTracker() {
    this._ownersToPendingOperations = new Map();
    this._pendingOperationsToOwners = new Map();
    this._ownersToPromise = new Map();
  }
  /**
   * Update the map of current processing operations with the set of
   * affected owners and notify subscribers
   */


  var _proto = RelayOperationTracker.prototype;

  _proto.update = function update(pendingOperation, affectedOwners) {
    if (affectedOwners.size === 0) {
      return;
    }

    var newlyAffectedOwners = new Set();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = affectedOwners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var owner = _step.value;

        var pendingOperationsAffectingOwner = this._ownersToPendingOperations.get(owner);

        if (pendingOperationsAffectingOwner != null) {
          // In this case the `owner` already affected by some operations
          // We just need to detect, is it the same operation that we already
          // have in the list, or it's a new operation
          if (!pendingOperationsAffectingOwner.has(pendingOperation)) {
            pendingOperationsAffectingOwner.add(pendingOperation);
            newlyAffectedOwners.add(owner);
          }
        } else {
          // This is a new `owner` that is affected by the operation
          this._ownersToPendingOperations.set(owner, new Set([pendingOperation]));

          newlyAffectedOwners.add(owner);
        }
      } // No new owners were affected by this operation, we may stop here

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

    if (newlyAffectedOwners.size === 0) {
      return;
    } // But, if some owners were affected we need to add them to
    // the `_pendingOperationsToOwners` set


    var ownersAffectedByOperation = this._pendingOperationsToOwners.get(pendingOperation) || new Set();
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = newlyAffectedOwners[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _owner = _step2.value;

        this._resolveOwnerResolvers(_owner);

        ownersAffectedByOperation.add(_owner);
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

    this._pendingOperationsToOwners.set(pendingOperation, ownersAffectedByOperation);
  }
  /**
   * Once pending operation is completed we need to remove it
   * from all tracking maps
   */
  ;

  _proto.complete = function complete(pendingOperation) {
    var affectedOwners = this._pendingOperationsToOwners.get(pendingOperation);

    if (affectedOwners == null) {
      return;
    } // These were the owners affected only by `pendingOperation`


    var completedOwners = new Set(); // These were the owners affected by `pendingOperation`
    // and some other operations

    var updatedOwners = new Set();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = affectedOwners[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var owner = _step3.value;

        var pendingOperationsAffectingOwner = this._ownersToPendingOperations.get(owner);

        if (!pendingOperationsAffectingOwner) {
          continue;
        }

        pendingOperationsAffectingOwner["delete"](pendingOperation);

        if (pendingOperationsAffectingOwner.size > 0) {
          updatedOwners.add(owner);
        } else {
          completedOwners.add(owner);
        }
      } // Complete subscriptions for all owners, affected by `pendingOperation`

    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
          _iterator3["return"]();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = completedOwners[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var _owner2 = _step4.value;

        this._resolveOwnerResolvers(_owner2);

        this._ownersToPendingOperations["delete"](_owner2);
      } // Update all owner that were updated by `pendingOperation` but still
      // are affected by other operations

    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
          _iterator4["return"]();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = updatedOwners[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var _owner3 = _step5.value;

        this._resolveOwnerResolvers(_owner3);
      } // Finally, remove pending operation

    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
          _iterator5["return"]();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    this._pendingOperationsToOwners["delete"](pendingOperation);
  };

  _proto._resolveOwnerResolvers = function _resolveOwnerResolvers(owner) {
    var promiseEntry = this._ownersToPromise.get(owner);

    if (promiseEntry != null) {
      promiseEntry.resolve();
    }

    this._ownersToPromise["delete"](owner);
  };

  _proto.getPromiseForPendingOperationsAffectingOwner = function getPromiseForPendingOperationsAffectingOwner(owner) {
    if (!this._ownersToPendingOperations.has(owner)) {
      return null;
    }

    var cachedPromiseEntry = this._ownersToPromise.get(owner);

    if (cachedPromiseEntry != null) {
      return cachedPromiseEntry.promise;
    }

    var resolve;
    var promise = new Promise(function (r) {
      resolve = r;
    });
    !(resolve != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayOperationTracker: Expected resolver to be defined. If you' + 'are seeing this, it is likely a bug in Relay.') : invariant(false) : void 0;

    this._ownersToPromise.set(owner, {
      promise: promise,
      resolve: resolve
    });

    return promise;
  };

  return RelayOperationTracker;
}();

module.exports = RelayOperationTracker;