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

var DataChecker = require('./DataChecker');

var RelayFeatureFlags = require('../util/RelayFeatureFlags');

var RelayModernRecord = require('./RelayModernRecord');

var RelayOptimisticRecordSource = require('./RelayOptimisticRecordSource');

var RelayProfiler = require('../util/RelayProfiler');

var RelayReader = require('./RelayReader');

var RelayReferenceMarker = require('./RelayReferenceMarker');

var RelayStoreUtils = require('./RelayStoreUtils');

var deepFreeze = require('../util/deepFreeze');

var defaultGetDataID = require('./defaultGetDataID');

var hasOverlappingIDs = require('./hasOverlappingIDs');

var invariant = require("fbjs/lib/invariant");

var recycleNodesInto = require('../util/recycleNodesInto');

var resolveImmediate = require('../util/resolveImmediate');

var _require = require('./RelayModernSelector'),
    createReaderSelector = _require.createReaderSelector;

var DEFAULT_RELEASE_BUFFER_SIZE = 0;
/**
 * @public
 *
 * An implementation of the `Store` interface defined in `RelayStoreTypes`.
 *
 * Note that a Store takes ownership of all records provided to it: other
 * objects may continue to hold a reference to such records but may not mutate
 * them. The static Relay core is architected to avoid mutating records that may have been
 * passed to a store: operations that mutate records will either create fresh
 * records or clone existing records and modify the clones. Record immutability
 * is also enforced in development mode by freezing all records passed to a store.
 */

var RelayModernStore =
/*#__PURE__*/
function () {
  function RelayModernStore(source, options) {
    var _ref, _ref2, _ref3, _ref4;

    // Prevent mutation of a record from outside the store.
    if (process.env.NODE_ENV !== "production") {
      var storeIDs = source.getRecordIDs();

      for (var ii = 0; ii < storeIDs.length; ii++) {
        var record = source.get(storeIDs[ii]);

        if (record) {
          RelayModernRecord.freeze(record);
        }
      }
    }

    this._connectionEvents = new Map();
    this._connectionSubscriptions = new Map();
    this._currentWriteEpoch = 0;
    this._gcHoldCounter = 0;
    this._gcReleaseBufferSize = (_ref = options === null || options === void 0 ? void 0 : options.gcReleaseBufferSize) !== null && _ref !== void 0 ? _ref : DEFAULT_RELEASE_BUFFER_SIZE;
    this._gcScheduler = (_ref2 = options === null || options === void 0 ? void 0 : options.gcScheduler) !== null && _ref2 !== void 0 ? _ref2 : resolveImmediate;
    this._getDataID = (_ref3 = options === null || options === void 0 ? void 0 : options.UNSTABLE_DO_NOT_USE_getDataID) !== null && _ref3 !== void 0 ? _ref3 : defaultGetDataID;
    this._globalInvalidationEpoch = null;
    this._hasScheduledGC = false;
    this._index = 0;
    this._invalidationSubscriptions = new Set();
    this._invalidatedRecordIDs = new Set();
    this._operationLoader = (_ref4 = options === null || options === void 0 ? void 0 : options.operationLoader) !== null && _ref4 !== void 0 ? _ref4 : null;
    this._optimisticSource = null;
    this._recordSource = source;
    this._releaseBuffer = [];
    this._roots = new Map();
    this._shouldScheduleGC = false;
    this._subscriptions = new Set();
    this._updatedConnectionIDs = {};
    this._updatedRecordIDs = {};
  }

  var _proto = RelayModernStore.prototype;

  _proto.getSource = function getSource() {
    var _this$_optimisticSour;

    return (_this$_optimisticSour = this._optimisticSource) !== null && _this$_optimisticSour !== void 0 ? _this$_optimisticSour : this._recordSource;
  };

  _proto.getConnectionEvents_UNSTABLE = function getConnectionEvents_UNSTABLE(connectionID) {
    var events = this._connectionEvents.get(connectionID);

    if (events != null) {
      var _events$optimistic;

      return (_events$optimistic = events.optimistic) !== null && _events$optimistic !== void 0 ? _events$optimistic : events["final"];
    }
  };

  _proto.check = function check(operation, options) {
    var _this = this;

    var _this$_optimisticSour2, _ref5, _ref6;

    var selector = operation.root;
    var source = (_this$_optimisticSour2 = this._optimisticSource) !== null && _this$_optimisticSour2 !== void 0 ? _this$_optimisticSour2 : this._recordSource;
    var globalInvalidationEpoch = this._globalInvalidationEpoch;

    var rootEntry = this._roots.get(operation.request.identifier);

    var operationLastWrittenAt = rootEntry != null ? rootEntry.epoch : null; // Check if store has been globally invalidated

    if (globalInvalidationEpoch != null) {
      // If so, check if the operation we're checking was last written
      // before or after invalidation occured.
      if (operationLastWrittenAt == null || operationLastWrittenAt <= globalInvalidationEpoch) {
        // If the operation was written /before/ global invalidation ocurred,
        // or if this operation has never been written to the store before,
        // we will consider the data for this operation to be stale
        //  (i.e. not resolvable from the store).
        return 'stale';
      }
    }

    var target = (_ref5 = options === null || options === void 0 ? void 0 : options.target) !== null && _ref5 !== void 0 ? _ref5 : source;
    var handlers = (_ref6 = options === null || options === void 0 ? void 0 : options.handlers) !== null && _ref6 !== void 0 ? _ref6 : [];
    var operationAvailability = DataChecker.check(source, target, selector, handlers, this._operationLoader, this._getDataID, function (id) {
      return _this.getConnectionEvents_UNSTABLE(id);
    });
    return getAvailablityStatus(operationAvailability, operationLastWrittenAt);
  };

  _proto.retain = function retain(operation) {
    var _this2 = this;

    var id = operation.request.identifier;

    var dispose = function dispose() {
      // When disposing, instead of immediately decrementing the refCount and
      // potentially deleting/collecting the root, move the operation onto
      // the release buffer. When the operation is extracted from the release
      // buffer, we will determine if it needs to be collected.
      _this2._releaseBuffer.push(id); // Only when the release buffer is full do we actually:
      // - extract the least recent operation in the release buffer
      // - attempt to release it and run GC if it's no longer referenced
      //   (refCount reached 0).


      if (_this2._releaseBuffer.length > _this2._gcReleaseBufferSize) {
        var _id = _this2._releaseBuffer.shift();

        var _rootEntry = _this2._roots.get(_id);

        if (_rootEntry == null) {
          // If operation has already been fully released, we don't need
          // to do anything.
          return;
        }

        if (_rootEntry.refCount > 0) {
          // If the operation is still retained by other callers
          // decrement the refCount
          _rootEntry.refCount -= 1;
        } else {
          // Otherwise fully release the query and run GC.
          _this2._roots["delete"](_id);

          _this2._scheduleGC();
        }
      }
    };

    var rootEntry = this._roots.get(id);

    if (rootEntry != null) {
      // If we've previously retained this operation, inrement the refCount
      rootEntry.refCount += 1;
    } else {
      // Otherwise create a new entry for the operation
      this._roots.set(id, {
        operation: operation,
        refCount: 0,
        epoch: null
      });
    }

    return {
      dispose: dispose
    };
  };

  _proto.lookup = function lookup(selector) {
    var source = this.getSource();
    var snapshot = RelayReader.read(source, selector);

    if (process.env.NODE_ENV !== "production") {
      deepFreeze(snapshot);
    }

    return snapshot;
  } // This method will return a list of updated owners form the subscriptions
  ;

  _proto.notify = function notify(sourceOperation, invalidateStore) {
    var _this3 = this;

    // Increment the current write when notifying after executing
    // a set of changes to the store.
    this._currentWriteEpoch++;

    if (invalidateStore === true) {
      this._globalInvalidationEpoch = this._currentWriteEpoch;
    }

    var source = this.getSource();
    var updatedOwners = [];

    this._subscriptions.forEach(function (subscription) {
      var owner = _this3._updateSubscription(source, subscription);

      if (owner != null) {
        updatedOwners.push(owner);
      }
    });

    this._invalidationSubscriptions.forEach(function (subscription) {
      _this3._updateInvalidationSubscription(subscription, invalidateStore === true);
    });

    this._connectionSubscriptions.forEach(function (subscription, id) {
      if (subscription.stale) {
        subscription.stale = false;
        subscription.callback(subscription.snapshot);
      }
    });

    this._updatedConnectionIDs = {};
    this._updatedRecordIDs = {};

    this._invalidatedRecordIDs.clear(); // If a source operation was provided (indicating the operation
    // that produced this update to the store), record the current epoch
    // at which this operation was written.


    if (sourceOperation != null) {
      // We only track the epoch at which the operation was written if
      // it was previously retained, to keep the size of our operation
      // epoch map bounded. If a query wasn't retained, we assume it can
      // may be deleted at any moment and thus is not relevant for us to track
      // for the purposes of invalidation.
      var id = sourceOperation.request.identifier;

      var rootEntry = this._roots.get(id);

      if (rootEntry != null) {
        rootEntry.epoch = this._currentWriteEpoch;
      }
    }

    return updatedOwners;
  };

  _proto.publish = function publish(source, idsMarkedForInvalidation) {
    var _this4 = this;

    var _this$_optimisticSour3;

    var target = (_this$_optimisticSour3 = this._optimisticSource) !== null && _this$_optimisticSour3 !== void 0 ? _this$_optimisticSour3 : this._recordSource;
    updateTargetFromSource(target, source, // We increment the current epoch at the end of the set of updates,
    // in notify(). Here, we pass what will be the incremented value of
    // the epoch to use to write to invalidated records.
    this._currentWriteEpoch + 1, idsMarkedForInvalidation, this._updatedRecordIDs, this._invalidatedRecordIDs);

    this._connectionSubscriptions.forEach(function (subscription, id) {
      var hasStoreUpdates = hasOverlappingIDs(subscription.snapshot.seenRecords, _this4._updatedRecordIDs);

      if (!hasStoreUpdates) {
        return;
      }

      var nextSnapshot = _this4._updateConnection_UNSTABLE(subscription.resolver, subscription.snapshot, source, null);

      if (nextSnapshot) {
        subscription.snapshot = nextSnapshot;
        subscription.stale = true;
      }
    });
  };

  _proto.subscribe = function subscribe(snapshot, callback) {
    var _this5 = this;

    var subscription = {
      backup: null,
      callback: callback,
      snapshot: snapshot,
      stale: false
    };

    var dispose = function dispose() {
      _this5._subscriptions["delete"](subscription);
    };

    this._subscriptions.add(subscription);

    return {
      dispose: dispose
    };
  };

  _proto.holdGC = function holdGC() {
    var _this6 = this;

    this._gcHoldCounter++;

    var dispose = function dispose() {
      if (_this6._gcHoldCounter > 0) {
        _this6._gcHoldCounter--;

        if (_this6._gcHoldCounter === 0 && _this6._shouldScheduleGC) {
          _this6._scheduleGC();

          _this6._shouldScheduleGC = false;
        }
      }
    };

    return {
      dispose: dispose
    };
  };

  _proto.toJSON = function toJSON() {
    return 'RelayModernStore()';
  } // Internal API
  ;

  _proto.__getUpdatedRecordIDs = function __getUpdatedRecordIDs() {
    return this._updatedRecordIDs;
  } // Returns the owner (RequestDescriptor) if the subscription was affected by the
  // latest update, or null if it was not affected.
  ;

  _proto._updateSubscription = function _updateSubscription(source, subscription) {
    var backup = subscription.backup,
        callback = subscription.callback,
        snapshot = subscription.snapshot,
        stale = subscription.stale;
    var hasOverlappingUpdates = hasOverlappingIDs(snapshot.seenRecords, this._updatedRecordIDs);

    if (!stale && !hasOverlappingUpdates) {
      return;
    }

    var nextSnapshot = hasOverlappingUpdates || !backup ? RelayReader.read(source, snapshot.selector) : backup;
    var nextData = recycleNodesInto(snapshot.data, nextSnapshot.data);
    nextSnapshot = {
      data: nextData,
      isMissingData: nextSnapshot.isMissingData,
      seenRecords: nextSnapshot.seenRecords,
      selector: nextSnapshot.selector
    };

    if (process.env.NODE_ENV !== "production") {
      deepFreeze(nextSnapshot);
    }

    subscription.snapshot = nextSnapshot;
    subscription.stale = false;

    if (nextSnapshot.data !== snapshot.data) {
      callback(nextSnapshot);
      return snapshot.selector.owner;
    }
  };

  _proto.lookupInvalidationState = function lookupInvalidationState(dataIDs) {
    var _this7 = this;

    var invalidations = new Map();
    dataIDs.forEach(function (dataID) {
      var _RelayModernRecord$ge;

      var record = _this7.getSource().get(dataID);

      invalidations.set(dataID, (_RelayModernRecord$ge = RelayModernRecord.getInvalidationEpoch(record)) !== null && _RelayModernRecord$ge !== void 0 ? _RelayModernRecord$ge : null);
    });
    invalidations.set('global', this._globalInvalidationEpoch);
    return {
      dataIDs: dataIDs,
      invalidations: invalidations
    };
  };

  _proto.checkInvalidationState = function checkInvalidationState(prevInvalidationState) {
    var latestInvalidationState = this.lookupInvalidationState(prevInvalidationState.dataIDs);
    var currentInvalidations = latestInvalidationState.invalidations;
    var prevInvalidations = prevInvalidationState.invalidations; // Check if global invalidation has changed

    if (currentInvalidations.get('global') !== prevInvalidations.get('global')) {
      return true;
    } // Check if the invalidation state for any of the ids has changed.


    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = prevInvalidationState.dataIDs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dataID = _step.value;

        if (currentInvalidations.get(dataID) !== prevInvalidations.get(dataID)) {
          return true;
        }
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

    return false;
  };

  _proto.subscribeToInvalidationState = function subscribeToInvalidationState(invalidationState, callback) {
    var _this8 = this;

    var subscription = {
      callback: callback,
      invalidationState: invalidationState
    };

    var dispose = function dispose() {
      _this8._invalidationSubscriptions["delete"](subscription);
    };

    this._invalidationSubscriptions.add(subscription);

    return {
      dispose: dispose
    };
  };

  _proto._updateInvalidationSubscription = function _updateInvalidationSubscription(subscription, invalidatedStore) {
    var _this9 = this;

    var callback = subscription.callback,
        invalidationState = subscription.invalidationState;
    var dataIDs = invalidationState.dataIDs;
    var isSubscribedToInvalidatedIDs = invalidatedStore || dataIDs.some(function (dataID) {
      return _this9._invalidatedRecordIDs.has(dataID);
    });

    if (!isSubscribedToInvalidatedIDs) {
      return;
    }

    callback();
  };

  _proto.lookupConnection_UNSTABLE = function lookupConnection_UNSTABLE(connectionReference, resolver) {
    var _connectionEvents$opt;

    !RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernStore: Connection resolvers are not yet supported.') : invariant(false) : void 0;
    var id = connectionReference.id;
    var initialState = resolver.initialize();

    var connectionEvents = this._connectionEvents.get(id);

    var events = connectionEvents != null ? (_connectionEvents$opt = connectionEvents.optimistic) !== null && _connectionEvents$opt !== void 0 ? _connectionEvents$opt : connectionEvents["final"] : null;
    var initialSnapshot = {
      edgeSnapshots: {},
      id: id,
      reference: connectionReference,
      seenRecords: {},
      state: initialState
    };

    if (events == null || events.length === 0) {
      return initialSnapshot;
    }

    return this._reduceConnection_UNSTABLE(resolver, connectionReference, initialSnapshot, events);
  };

  _proto.subscribeConnection_UNSTABLE = function subscribeConnection_UNSTABLE(snapshot, resolver, callback) {
    var _this10 = this;

    !RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernStore: Connection resolvers are not yet supported.') : invariant(false) : void 0;
    var id = String(this._index++);
    var subscription = {
      backup: null,
      callback: callback,
      id: id,
      resolver: resolver,
      snapshot: snapshot,
      stale: false
    };

    var dispose = function dispose() {
      _this10._connectionSubscriptions["delete"](id);
    };

    this._connectionSubscriptions.set(id, subscription);

    return {
      dispose: dispose
    };
  };

  _proto.publishConnectionEvents_UNSTABLE = function publishConnectionEvents_UNSTABLE(events, final) {
    var _this11 = this;

    if (events.length === 0) {
      return;
    }

    !RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernStore: Connection resolvers are not yet supported.') : invariant(false) : void 0;
    var pendingConnectionEvents = new Map();
    events.forEach(function (event) {
      var connectionID = event.connectionID;
      var pendingEvents = pendingConnectionEvents.get(connectionID);

      if (pendingEvents == null) {
        pendingEvents = [];
        pendingConnectionEvents.set(connectionID, pendingEvents);
      }

      pendingEvents.push(event);

      var connectionEvents = _this11._connectionEvents.get(connectionID);

      if (connectionEvents == null) {
        connectionEvents = {
          "final": [],
          optimistic: null
        };

        _this11._connectionEvents.set(connectionID, connectionEvents);
      }

      if (final) {
        connectionEvents["final"].push(event);
      } else {
        var optimisticEvents = connectionEvents.optimistic;

        if (optimisticEvents == null) {
          optimisticEvents = connectionEvents["final"].slice();
          connectionEvents.optimistic = optimisticEvents;
        }

        optimisticEvents.push(event);
      }
    });

    this._connectionSubscriptions.forEach(function (subscription, id) {
      var pendingEvents = pendingConnectionEvents.get(subscription.snapshot.reference.id);

      if (pendingEvents == null) {
        return;
      }

      var nextSnapshot = _this11._updateConnection_UNSTABLE(subscription.resolver, subscription.snapshot, null, pendingEvents);

      if (nextSnapshot) {
        subscription.snapshot = nextSnapshot;
        subscription.stale = true;
      }
    });
  };

  _proto._updateConnection_UNSTABLE = function _updateConnection_UNSTABLE(resolver, snapshot, source, pendingEvents) {
    var _pendingEvents;

    var nextSnapshot = this._reduceConnection_UNSTABLE(resolver, snapshot.reference, snapshot, (_pendingEvents = pendingEvents) !== null && _pendingEvents !== void 0 ? _pendingEvents : [], source);

    var state = recycleNodesInto(snapshot.state, nextSnapshot.state);

    if (process.env.NODE_ENV !== "production") {
      deepFreeze(nextSnapshot);
    }

    if (state !== snapshot.state) {
      return (0, _objectSpread2["default"])({}, nextSnapshot, {
        state: state
      });
    }
  };

  _proto._reduceConnection_UNSTABLE = function _reduceConnection_UNSTABLE(resolver, connectionReference, snapshot, events) {
    var _this12 = this;

    var _edgesField$concreteT;

    var source = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var edgesField = connectionReference.edgesField,
        id = connectionReference.id,
        variables = connectionReference.variables;
    var fragment = {
      kind: 'Fragment',
      name: edgesField.name,
      type: (_edgesField$concreteT = edgesField.concreteType) !== null && _edgesField$concreteT !== void 0 ? _edgesField$concreteT : '__Any',
      metadata: null,
      argumentDefinitions: [],
      selections: edgesField.selections
    };
    var seenRecords = {};
    var edgeSnapshots = (0, _objectSpread2["default"])({}, snapshot.edgeSnapshots);
    var initialState = snapshot.state;

    if (source) {
      var edgeData = {};
      Object.keys(edgeSnapshots).forEach(function (edgeID) {
        var prevSnapshot = edgeSnapshots[edgeID];
        var nextSnapshot = RelayReader.read(_this12.getSource(), createReaderSelector(fragment, edgeID, variables, prevSnapshot.selector.owner));
        var data = recycleNodesInto(prevSnapshot.data, nextSnapshot.data);
        nextSnapshot = {
          data: data,
          isMissingData: nextSnapshot.isMissingData,
          seenRecords: nextSnapshot.seenRecords,
          selector: nextSnapshot.selector
        };

        if (data !== prevSnapshot.data) {
          edgeData[edgeID] = data;
          /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
           * Flow v0.111.0 was deployed. To see the error, delete this comment
           * and run Flow. */

          edgeSnapshots[edgeID] = nextSnapshot;
        }
      });

      if (Object.keys(edgeData).length !== 0) {
        initialState = resolver.reduce(initialState, {
          kind: 'update',
          edgeData: edgeData
        });
      }
    }

    var state = events.reduce(function (prevState, event) {
      if (event.kind === 'fetch') {
        var edges = [];
        event.edgeIDs.forEach(function (edgeID) {
          if (edgeID == null) {
            edges.push(edgeID);
            return;
          }

          var edgeSnapshot = RelayReader.read(_this12.getSource(), createReaderSelector(fragment, edgeID, variables, event.request));
          Object.assign(seenRecords, edgeSnapshot.seenRecords);
          var itemData = edgeSnapshot.data;
          /* $FlowFixMe(>=0.111.0) This comment suppresses an error found
           * when Flow v0.111.0 was deployed. To see the error, delete this
           * comment and run Flow. */

          edgeSnapshots[edgeID] = edgeSnapshot;
          edges.push(itemData);
        });
        return resolver.reduce(prevState, {
          kind: 'fetch',
          args: event.args,
          edges: edges,
          pageInfo: event.pageInfo,
          stream: event.stream
        });
      } else if (event.kind === 'insert') {
        var edgeSnapshot = RelayReader.read(_this12.getSource(), createReaderSelector(fragment, event.edgeID, variables, event.request));
        Object.assign(seenRecords, edgeSnapshot.seenRecords);
        var itemData = edgeSnapshot.data;
        /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
         * Flow v0.111.0 was deployed. To see the error, delete this comment
         * and run Flow. */

        edgeSnapshots[event.edgeID] = edgeSnapshot;
        return resolver.reduce(prevState, {
          args: event.args,
          edge: itemData,
          kind: 'insert'
        });
      } else if (event.kind === 'stream.edge') {
        var _edgeSnapshot = RelayReader.read(_this12.getSource(), createReaderSelector(fragment, event.edgeID, variables, event.request));

        Object.assign(seenRecords, _edgeSnapshot.seenRecords);
        var _itemData = _edgeSnapshot.data;
        /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
         * Flow v0.111.0 was deployed. To see the error, delete this comment
         * and run Flow. */

        edgeSnapshots[event.edgeID] = _edgeSnapshot;
        return resolver.reduce(prevState, {
          args: event.args,
          edge: _itemData,
          index: event.index,
          kind: 'stream.edge'
        });
      } else if (event.kind === 'stream.pageInfo') {
        return resolver.reduce(prevState, {
          args: event.args,
          kind: 'stream.pageInfo',
          pageInfo: event.pageInfo
        });
      } else {
        event.kind;
        !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernStore: Unexpected connection event kind `%s`.', event.kind) : invariant(false) : void 0;
      }
    }, initialState);
    return {
      edgeSnapshots: edgeSnapshots,
      id: id,
      reference: connectionReference,
      seenRecords: seenRecords,
      state: state
    };
  };

  _proto.snapshot = function snapshot() {
    !(this._optimisticSource == null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernStore: Unexpected call to snapshot() while a previous ' + 'snapshot exists.') : invariant(false) : void 0;

    this._connectionSubscriptions.forEach(function (subscription) {
      subscription.backup = subscription.snapshot;
    });

    this._subscriptions.forEach(function (subscription) {
      subscription.backup = subscription.snapshot;
    });

    this._optimisticSource = RelayOptimisticRecordSource.create(this.getSource());
  };

  _proto.restore = function restore() {
    var _this13 = this;

    !(this._optimisticSource != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernStore: Unexpected call to restore(), expected a snapshot ' + 'to exist (make sure to call snapshot()).') : invariant(false) : void 0;
    this._optimisticSource = null;

    this._connectionEvents.forEach(function (events) {
      events.optimistic = null;
    });

    this._subscriptions.forEach(function (subscription) {
      var backup = subscription.backup;
      subscription.backup = null;

      if (backup) {
        if (backup.data !== subscription.snapshot.data) {
          subscription.stale = true;
        }

        subscription.snapshot = {
          data: subscription.snapshot.data,
          isMissingData: backup.isMissingData,
          seenRecords: backup.seenRecords,
          selector: backup.selector
        };
      } else {
        subscription.stale = true;
      }
    });

    this._connectionSubscriptions.forEach(function (subscription) {
      var backup = subscription.backup;
      subscription.backup = null;

      if (backup) {
        if (backup.state !== subscription.snapshot.state) {
          subscription.stale = true;
        }

        subscription.snapshot = backup;
      } else {
        // This subscription was established after the creation of the
        // connection snapshot so there's nothing to restore to. Recreate the
        // connection from scratch and check ifs value changes.
        var baseSnapshot = _this13.lookupConnection_UNSTABLE(subscription.snapshot.reference, subscription.resolver);

        var nextState = recycleNodesInto(subscription.snapshot.state, baseSnapshot.state);

        if (nextState !== subscription.snapshot.state) {
          subscription.stale = true;
        }

        subscription.snapshot = (0, _objectSpread2["default"])({}, baseSnapshot, {
          state: nextState
        });
      }
    });
  };

  _proto._scheduleGC = function _scheduleGC() {
    var _this14 = this;

    if (this._gcHoldCounter > 0) {
      this._shouldScheduleGC = true;
      return;
    }

    if (this._hasScheduledGC) {
      return;
    }

    this._hasScheduledGC = true;

    this._gcScheduler(function () {
      _this14.__gc();

      _this14._hasScheduledGC = false;
    });
  };

  _proto.__gc = function __gc() {
    var _this15 = this;

    // Don't run GC while there are optimistic updates applied
    if (this._optimisticSource != null) {
      return;
    }

    var references = new Set();
    var connectionReferences = new Set(); // Mark all records that are traversable from a root

    this._roots.forEach(function (_ref7) {
      var operation = _ref7.operation;
      var selector = operation.root;
      RelayReferenceMarker.mark(_this15._recordSource, selector, references, connectionReferences, function (id) {
        return _this15.getConnectionEvents_UNSTABLE(id);
      }, _this15._operationLoader);
    });

    if (references.size === 0) {
      // Short-circuit if *nothing* is referenced
      this._recordSource.clear();
    } else {
      // Evict any unreferenced nodes
      var storeIDs = this._recordSource.getRecordIDs();

      for (var ii = 0; ii < storeIDs.length; ii++) {
        var dataID = storeIDs[ii];

        if (!references.has(dataID)) {
          this._recordSource.remove(dataID);
        }
      }
    }

    if (connectionReferences.size === 0) {
      this._connectionEvents.clear();
    } else {
      // Evict any unreferenced connections
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._connectionEvents.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var connectionID = _step2.value;

          if (!connectionReferences.has(connectionID)) {
            this._connectionEvents["delete"](connectionID);
          }
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
    }
  };

  return RelayModernStore;
}();
/**
 * Updates the target with information from source, also updating a mapping of
 * which records in the target were changed as a result.
 * Additionally, will marc records as invalidated at the current write epoch
 * given the set of record ids marked as stale in this update.
 */


function updateTargetFromSource(target, source, currentWriteEpoch, idsMarkedForInvalidation, updatedRecordIDs, invalidatedRecordIDs) {
  // First, update any records that were marked for invalidation.
  // For each provided dataID that was invalidated, we write the
  // INVALIDATED_AT_KEY on the record, indicating
  // the epoch at which the record was invalidated.
  if (idsMarkedForInvalidation) {
    idsMarkedForInvalidation.forEach(function (dataID) {
      var targetRecord = target.get(dataID);
      var sourceRecord = source.get(dataID); // If record was deleted during the update (and also invalidated),
      // we don't need to count it as an invalidated id

      if (sourceRecord === null) {
        return;
      }

      var nextRecord;

      if (targetRecord != null) {
        // If the target record exists, use it to set the epoch
        // at which it was invalidated. This record will be updated with
        // any changes from source in the section below
        // where we update the target records based on the source.
        nextRecord = RelayModernRecord.clone(targetRecord);
      } else {
        // If the target record doesn't exist, it means that a new record
        // in the source was created (and also invalidated), so we use that
        // record to set the epoch at which it was invalidated. This record
        // will be updated with any changes from source in the section below
        // where we update the target records based on the source.
        nextRecord = sourceRecord != null ? RelayModernRecord.clone(sourceRecord) : null;
      }

      if (!nextRecord) {
        return;
      }

      RelayModernRecord.setValue(nextRecord, RelayStoreUtils.INVALIDATED_AT_KEY, currentWriteEpoch);
      invalidatedRecordIDs.add(dataID);
      target.set(dataID, nextRecord);
    });
  } // Update the target based on the changes present in source


  var dataIDs = source.getRecordIDs();

  for (var ii = 0; ii < dataIDs.length; ii++) {
    var dataID = dataIDs[ii];
    var sourceRecord = source.get(dataID);
    var targetRecord = target.get(dataID); // Prevent mutation of a record from outside the store.

    if (process.env.NODE_ENV !== "production") {
      if (sourceRecord) {
        RelayModernRecord.freeze(sourceRecord);
      }
    }

    if (sourceRecord && targetRecord) {
      var nextRecord = RelayModernRecord.update(targetRecord, sourceRecord);

      if (nextRecord !== targetRecord) {
        // Prevent mutation of a record from outside the store.
        if (process.env.NODE_ENV !== "production") {
          RelayModernRecord.freeze(nextRecord);
        }

        updatedRecordIDs[dataID] = true;
        target.set(dataID, nextRecord);
      }
    } else if (sourceRecord === null) {
      target["delete"](dataID);

      if (targetRecord !== null) {
        updatedRecordIDs[dataID] = true;
      }
    } else if (sourceRecord) {
      target.set(dataID, sourceRecord);
      updatedRecordIDs[dataID] = true;
    } // don't add explicit undefined

  }
}
/**
 * Returns an OperationAvailability given the Availability returned
 * by checking an operation, and when that operation was last written to the store.
 * Specifically, the provided Availablity of a an operation will contain the
 * value of when a record referenced by the operation was most recently
 * invalidated; given that value, and given when this operation was last
 * written to the store, this function will return the overall
 * OperationAvailability for the operation.
 */


function getAvailablityStatus(opearionAvailability, operationLastWrittenAt) {
  var mostRecentlyInvalidatedAt = opearionAvailability.mostRecentlyInvalidatedAt,
      status = opearionAvailability.status;

  if (typeof mostRecentlyInvalidatedAt !== 'number') {
    // If the record has never been invalidated, it isn't stale,
    // so return the availability status of the operation.
    return status;
  }

  if (operationLastWrittenAt == null) {
    // If we've never written this operation before and there was an invalidation,
    // then we don't have enough information to determine staleness,
    // so by default we will consider it stale.
    return 'stale';
  } // If the record was invalidated before the operation we're reading was
  // last written, we can consider it not stale; otherwise consider it stale.


  return mostRecentlyInvalidatedAt > operationLastWrittenAt ? 'stale' : status;
}

RelayProfiler.instrumentMethods(RelayModernStore.prototype, {
  lookup: 'RelayModernStore.prototype.lookup',
  notify: 'RelayModernStore.prototype.notify',
  publish: 'RelayModernStore.prototype.publish',
  __gc: 'RelayModernStore.prototype.__gc'
});
module.exports = RelayModernStore;