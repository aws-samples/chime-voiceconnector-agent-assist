/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @emails oncall+relay
 * @format
 */
// flowlint ambiguous-object-type:error
'use strict';

var RelayDefaultHandlerProvider = require('../handlers/RelayDefaultHandlerProvider');

var RelayFeatureFlags = require('../util/RelayFeatureFlags');

var RelayModernQueryExecutor = require('./RelayModernQueryExecutor');

var RelayObservable = require('../network/RelayObservable');

var RelayOperationTracker = require('../store/RelayOperationTracker');

var RelayPublishQueue = require('./RelayPublishQueue');

var RelayRecordSource = require('./RelayRecordSource');

var defaultGetDataID = require('./defaultGetDataID');

var generateID = require('../util/generateID');

var getRelayDefaultMissingFieldHandlers = require('../handlers/getRelayDefaultMissingFieldHandlers');

var invariant = require("fbjs/lib/invariant");

var RelayModernEnvironment =
/*#__PURE__*/
function () {
  function RelayModernEnvironment(config) {
    var _this = this;

    var _config$log, _config$UNSTABLE_defa, _config$UNSTABLE_DO_N, _config$scheduler, _config$missingFieldH, _config$operationTrac;

    this.configName = config.configName;
    var handlerProvider = config.handlerProvider ? config.handlerProvider : RelayDefaultHandlerProvider;
    var operationLoader = config.operationLoader;

    if (process.env.NODE_ENV !== "production") {
      if (operationLoader != null) {
        !(typeof operationLoader === 'object' && typeof operationLoader.get === 'function' && typeof operationLoader.load === 'function') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected `operationLoader` to be an object ' + 'with get() and load() functions, got `%s`.', operationLoader) : invariant(false) : void 0;
      }
    }

    this.__log = (_config$log = config.log) !== null && _config$log !== void 0 ? _config$log : emptyFunction;
    this._defaultRenderPolicy = ((_config$UNSTABLE_defa = config.UNSTABLE_defaultRenderPolicy) !== null && _config$UNSTABLE_defa !== void 0 ? _config$UNSTABLE_defa : RelayFeatureFlags.ENABLE_PARTIAL_RENDERING_DEFAULT === true) ? 'partial' : 'full';
    this._operationLoader = operationLoader;
    this._network = config.network;
    this._getDataID = (_config$UNSTABLE_DO_N = config.UNSTABLE_DO_NOT_USE_getDataID) !== null && _config$UNSTABLE_DO_N !== void 0 ? _config$UNSTABLE_DO_N : defaultGetDataID;
    this._publishQueue = new RelayPublishQueue(config.store, handlerProvider, this._getDataID);
    this._scheduler = (_config$scheduler = config.scheduler) !== null && _config$scheduler !== void 0 ? _config$scheduler : null;
    this._store = config.store;
    this.options = config.options;

    this.__setNet = function (newNet) {
      return _this._network = newNet;
    };

    if (process.env.NODE_ENV !== "production") {
      var _require = require('./StoreInspector'),
          inspect = _require.inspect;

      this.DEBUG_inspect = function (dataID) {
        return inspect(_this, dataID);
      };
    } // Register this Relay Environment with Relay DevTools if it exists.
    // Note: this must always be the last step in the constructor.


    var _global = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : undefined;

    var devToolsHook = _global && _global.__RELAY_DEVTOOLS_HOOK__;

    if (devToolsHook) {
      devToolsHook.registerEnvironment(this);
    }

    this._missingFieldHandlers = (_config$missingFieldH = config.missingFieldHandlers) !== null && _config$missingFieldH !== void 0 ? _config$missingFieldH : getRelayDefaultMissingFieldHandlers();
    this._operationTracker = (_config$operationTrac = config.operationTracker) !== null && _config$operationTrac !== void 0 ? _config$operationTrac : new RelayOperationTracker();
  }

  var _proto = RelayModernEnvironment.prototype;

  _proto.getStore = function getStore() {
    return this._store;
  };

  _proto.getNetwork = function getNetwork() {
    return this._network;
  };

  _proto.getOperationTracker = function getOperationTracker() {
    return this._operationTracker;
  };

  _proto.UNSTABLE_getDefaultRenderPolicy = function UNSTABLE_getDefaultRenderPolicy() {
    return this._defaultRenderPolicy;
  };

  _proto.applyUpdate = function applyUpdate(optimisticUpdate) {
    var _this2 = this;

    var dispose = function dispose() {
      _this2._publishQueue.revertUpdate(optimisticUpdate);

      _this2._publishQueue.run();
    };

    this._publishQueue.applyUpdate(optimisticUpdate);

    this._publishQueue.run();

    return {
      dispose: dispose
    };
  };

  _proto.revertUpdate = function revertUpdate(update) {
    this._publishQueue.revertUpdate(update);

    this._publishQueue.run();
  };

  _proto.replaceUpdate = function replaceUpdate(update, newUpdate) {
    this._publishQueue.revertUpdate(update);

    this._publishQueue.applyUpdate(newUpdate);

    this._publishQueue.run();
  };

  _proto.applyMutation = function applyMutation(optimisticConfig) {
    var _this3 = this;

    var subscription = RelayObservable.create(function (sink) {
      var source = RelayObservable.create(function (_sink) {});
      var executor = RelayModernQueryExecutor.execute({
        operation: optimisticConfig.operation,
        operationLoader: _this3._operationLoader,
        optimisticConfig: optimisticConfig,
        publishQueue: _this3._publishQueue,
        scheduler: _this3._scheduler,
        sink: sink,
        source: source,
        store: _this3._store,
        updater: null,
        operationTracker: _this3._operationTracker,
        getDataID: _this3._getDataID
      });
      return function () {
        return executor.cancel();
      };
    }).subscribe({});
    return {
      dispose: function dispose() {
        return subscription.unsubscribe();
      }
    };
  };

  _proto.check = function check(operation) {
    if (this._missingFieldHandlers == null || this._missingFieldHandlers.length === 0) {
      return this._store.check(operation);
    }

    return this._checkSelectorAndHandleMissingFields(operation, this._missingFieldHandlers);
  };

  _proto.commitPayload = function commitPayload(operation, payload) {
    var _this4 = this;

    RelayObservable.create(function (sink) {
      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationLoader: _this4._operationLoader,
        optimisticConfig: null,
        publishQueue: _this4._publishQueue,
        scheduler: null,
        // make sure the first payload is sync
        sink: sink,
        source: RelayObservable.from({
          data: payload,
          extensions: {
            is_final: true
          }
        }),
        store: _this4._store,
        updater: null,
        operationTracker: _this4._operationTracker,
        getDataID: _this4._getDataID,
        isClientPayload: true
      });
      return function () {
        return executor.cancel();
      };
    }).subscribe({});
  };

  _proto.commitUpdate = function commitUpdate(updater) {
    this._publishQueue.commitUpdate(updater);

    this._publishQueue.run();
  };

  _proto.lookup = function lookup(readSelector) {
    return this._store.lookup(readSelector);
  };

  _proto.subscribe = function subscribe(snapshot, callback) {
    return this._store.subscribe(snapshot, callback);
  };

  _proto.retain = function retain(operation) {
    return this._store.retain(operation);
  };

  _proto._checkSelectorAndHandleMissingFields = function _checkSelectorAndHandleMissingFields(operation, handlers) {
    var target = RelayRecordSource.create();

    var result = this._store.check(operation, {
      target: target,
      handlers: handlers
    });

    if (target.size() > 0) {
      this._publishQueue.commitSource(target);

      this._publishQueue.run();
    }

    return result;
  }
  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation, each result of which is then
   * normalized and committed to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to: environment.execute({...}).subscribe({...}).
   */
  ;

  _proto.execute = function execute(_ref) {
    var _this5 = this;

    var operation = _ref.operation,
        cacheConfig = _ref.cacheConfig,
        updater = _ref.updater;

    var _this$__createLogObse = this.__createLogObserver(operation.request.node.params, operation.request.variables),
        logObserver = _this$__createLogObse[0],
        logRequestInfo = _this$__createLogObse[1];

    return RelayObservable.create(function (sink) {
      var source = _this5._network.execute(operation.request.node.params, operation.request.variables, cacheConfig || {}, null, logRequestInfo);

      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationLoader: _this5._operationLoader,
        optimisticConfig: null,
        publishQueue: _this5._publishQueue,
        scheduler: _this5._scheduler,
        sink: sink,
        source: source,
        store: _this5._store,
        updater: updater,
        operationTracker: _this5._operationTracker,
        getDataID: _this5._getDataID
      });
      return function () {
        return executor.cancel();
      };
    })["do"](logObserver);
  }
  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Mutation operation, the result of which is then normalized and
   * committed to the publish queue along with an optional optimistic response
   * or updater.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeMutation({...}).subscribe({...}).
   */
  ;

  _proto.executeMutation = function executeMutation(_ref2) {
    var _this6 = this;

    var operation = _ref2.operation,
        optimisticResponse = _ref2.optimisticResponse,
        optimisticUpdater = _ref2.optimisticUpdater,
        updater = _ref2.updater,
        uploadables = _ref2.uploadables;

    var _this$__createLogObse2 = this.__createLogObserver(operation.request.node.params, operation.request.variables),
        logObserver = _this$__createLogObse2[0],
        logRequestInfo = _this$__createLogObse2[1];

    return RelayObservable.create(function (sink) {
      var optimisticConfig;

      if (optimisticResponse || optimisticUpdater) {
        optimisticConfig = {
          operation: operation,
          response: optimisticResponse,
          updater: optimisticUpdater
        };
      }

      var source = _this6._network.execute(operation.request.node.params, operation.request.variables, {
        force: true
      }, uploadables, logRequestInfo);

      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationLoader: _this6._operationLoader,
        optimisticConfig: optimisticConfig,
        publishQueue: _this6._publishQueue,
        scheduler: _this6._scheduler,
        sink: sink,
        source: source,
        store: _this6._store,
        updater: updater,
        operationTracker: _this6._operationTracker,
        getDataID: _this6._getDataID
      });
      return function () {
        return executor.cancel();
      };
    })["do"](logObserver);
  }
  /**
   * Returns an Observable of GraphQLResponse resulting from executing the
   * provided Query or Subscription operation responses, the result of which is
   * then normalized and comitted to the publish queue.
   *
   * Note: Observables are lazy, so calling this method will do nothing until
   * the result is subscribed to:
   * environment.executeWithSource({...}).subscribe({...}).
   */
  ;

  _proto.executeWithSource = function executeWithSource(_ref3) {
    var _this7 = this;

    var operation = _ref3.operation,
        source = _ref3.source;
    return RelayObservable.create(function (sink) {
      var executor = RelayModernQueryExecutor.execute({
        operation: operation,
        operationLoader: _this7._operationLoader,
        operationTracker: _this7._operationTracker,
        optimisticConfig: null,
        publishQueue: _this7._publishQueue,
        scheduler: _this7._scheduler,
        sink: sink,
        source: source,
        store: _this7._store,
        getDataID: _this7._getDataID
      });
      return function () {
        return executor.cancel();
      };
    });
  };

  _proto.toJSON = function toJSON() {
    var _this$configName;

    return "RelayModernEnvironment(".concat((_this$configName = this.configName) !== null && _this$configName !== void 0 ? _this$configName : '', ")");
  };

  _proto.__createLogObserver = function __createLogObserver(params, variables) {
    var transactionID = generateID();
    var log = this.__log;
    var logObserver = {
      start: function start(subscription) {
        log({
          name: 'execute.start',
          transactionID: transactionID,
          params: params,
          variables: variables
        });
      },
      next: function next(response) {
        log({
          name: 'execute.next',
          transactionID: transactionID,
          response: response
        });
      },
      error: function error(_error) {
        log({
          name: 'execute.error',
          transactionID: transactionID,
          error: _error
        });
      },
      complete: function complete() {
        log({
          name: 'execute.complete',
          transactionID: transactionID
        });
      },
      unsubscribe: function unsubscribe() {
        log({
          name: 'execute.unsubscribe',
          transactionID: transactionID
        });
      }
    };

    var logRequestInfo = function logRequestInfo(info) {
      log({
        name: 'execute.info',
        transactionID: transactionID,
        info: info
      });
    };

    return [logObserver, logRequestInfo];
  };

  return RelayModernEnvironment;
}(); // Add a sigil for detection by `isRelayModernEnvironment()` to avoid a
// realm-specific instanceof check, and to aid in module tree-shaking to
// avoid requiring all of RelayRuntime just to detect its environment.


RelayModernEnvironment.prototype['@@RelayModernEnvironment'] = true;

function emptyFunction() {}

module.exports = RelayModernEnvironment;