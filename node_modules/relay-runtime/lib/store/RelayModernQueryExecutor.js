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

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var RelayConnectionInterface = require('../handlers/connection/RelayConnectionInterface');

var RelayError = require('../util/RelayError');

var RelayModernRecord = require('./RelayModernRecord');

var RelayObservable = require('../network/RelayObservable');

var RelayRecordSource = require('./RelayRecordSource');

var RelayResponseNormalizer = require('./RelayResponseNormalizer');

var invariant = require("fbjs/lib/invariant");

var stableCopy = require('../util/stableCopy');

var warning = require("fbjs/lib/warning");

var _require = require('./ClientID'),
    generateClientID = _require.generateClientID;

var _require2 = require('./RelayModernSelector'),
    createNormalizationSelector = _require2.createNormalizationSelector;

var _require3 = require('./RelayStoreUtils'),
    ROOT_TYPE = _require3.ROOT_TYPE,
    TYPENAME_KEY = _require3.TYPENAME_KEY,
    getStorageKey = _require3.getStorageKey;

function execute(config) {
  return new Executor(config);
}
/**
 * Coordinates the execution of a query, handling network callbacks
 * including optimistic payloads, standard payloads, resolution of match
 * dependencies, etc.
 */


var Executor =
/*#__PURE__*/
function () {
  function Executor(_ref) {
    var _this = this;

    var operation = _ref.operation,
        operationLoader = _ref.operationLoader,
        optimisticConfig = _ref.optimisticConfig,
        publishQueue = _ref.publishQueue,
        scheduler = _ref.scheduler,
        sink = _ref.sink,
        source = _ref.source,
        store = _ref.store,
        updater = _ref.updater,
        operationTracker = _ref.operationTracker,
        getDataID = _ref.getDataID,
        isClientPayload = _ref.isClientPayload;
    this._getDataID = getDataID;
    this._incrementalPayloadsPending = false;
    this._incrementalResults = new Map();
    this._nextSubscriptionId = 0;
    this._operation = operation;
    this._operationLoader = operationLoader;
    this._operationTracker = operationTracker;
    this._operationUpdateEpochs = new Map();
    this._optimisticUpdates = null;
    this._pendingModulePayloadsCount = 0;
    this._publishQueue = publishQueue;
    this._scheduler = scheduler;
    this._sink = sink;
    this._source = new Map();
    this._state = 'started';
    this._store = store;
    this._subscriptions = new Map();
    this._updater = updater;
    this._isClientPayload = isClientPayload === true;
    var id = this._nextSubscriptionId++;
    source.subscribe({
      complete: function complete() {
        return _this._complete(id);
      },
      error: function error(_error2) {
        return _this._error(_error2);
      },
      next: function next(response) {
        try {
          _this._next(id, response);
        } catch (error) {
          sink.error(error);
        }
      },
      start: function start(subscription) {
        return _this._start(id, subscription);
      }
    });

    if (optimisticConfig != null) {
      this._processOptimisticResponse(optimisticConfig.response != null ? {
        data: optimisticConfig.response
      } : null, optimisticConfig.updater);
    }
  } // Cancel any pending execution tasks and mark the executor as completed.


  var _proto = Executor.prototype;

  _proto.cancel = function cancel() {
    var _this2 = this;

    if (this._state === 'completed') {
      return;
    }

    this._state = 'completed';

    if (this._subscriptions.size !== 0) {
      this._subscriptions.forEach(function (sub) {
        return sub.unsubscribe();
      });

      this._subscriptions.clear();
    }

    var optimisticUpdates = this._optimisticUpdates;

    if (optimisticUpdates !== null) {
      this._optimisticUpdates = null;
      optimisticUpdates.forEach(function (update) {
        return _this2._publishQueue.revertUpdate(update);
      });

      this._publishQueue.run();
    }

    this._incrementalResults.clear();

    this._completeOperationTracker();
  };

  _proto._schedule = function _schedule(task) {
    var _this3 = this;

    var scheduler = this._scheduler;

    if (scheduler != null) {
      var _id2 = this._nextSubscriptionId++;

      RelayObservable.create(function (sink) {
        var cancellationToken = scheduler.schedule(function () {
          try {
            task();
            sink.complete();
          } catch (error) {
            sink.error(error);
          }
        });
        return function () {
          return scheduler.cancel(cancellationToken);
        };
      }).subscribe({
        complete: function complete() {
          return _this3._complete(_id2);
        },
        error: function error(_error3) {
          return _this3._error(_error3);
        },
        start: function start(subscription) {
          return _this3._start(_id2, subscription);
        }
      });
    } else {
      task();
    }
  };

  _proto._complete = function _complete(id) {
    this._subscriptions["delete"](id);

    if (this._subscriptions.size === 0) {
      this.cancel();

      this._sink.complete();
    }
  };

  _proto._error = function _error(error) {
    this.cancel();

    this._sink.error(error);
  };

  _proto._start = function _start(id, subscription) {
    this._subscriptions.set(id, subscription);
  } // Handle a raw GraphQL response.
  ;

  _proto._next = function _next(_id, response) {
    var _this4 = this;

    this._schedule(function () {
      _this4._handleNext(response);

      _this4._maybeCompleteSubscriptionOperationTracking();
    });
  };

  _proto._handleNext = function _handleNext(response) {
    var _response$extensions, _response$extensions2;

    if (this._state === 'completed') {
      return;
    }

    if (response.data == null) {
      var errors = response.errors;
      var messages = errors ? errors.map(function (_ref2) {
        var message = _ref2.message;
        return message;
      }).join('\n') : '(No errors)';
      var error = RelayError.create('RelayNetwork', 'No data returned for operation `' + this._operation.request.node.params.name + '`, got error(s):\n' + messages + '\n\nSee the error `source` property for more information.');
      error.source = {
        errors: errors,
        operation: this._operation.request.node,
        variables: this._operation.request.variables
      };
      throw error;
    } // Above check ensures that response.data != null


    var responseWithData = response;
    var isOptimistic = ((_response$extensions = response.extensions) === null || _response$extensions === void 0 ? void 0 : _response$extensions.isOptimistic) === true;

    if (isOptimistic && this._state !== 'started') {
      !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: optimistic payload received after server payload.') : invariant(false) : void 0;
    }

    var isFinal = ((_response$extensions2 = response.extensions) === null || _response$extensions2 === void 0 ? void 0 : _response$extensions2.is_final) === true;
    this._state = isFinal ? 'loading_final' : 'loading_incremental';

    if (isFinal) {
      this._incrementalPayloadsPending = false;
    }

    if (isOptimistic) {
      this._processOptimisticResponse(responseWithData, null);
    } else {
      var path = response.path,
          label = response.label;

      if (path != null || label != null) {
        if (typeof label === 'string' && Array.isArray(path)) {
          this._processIncrementalResponse({
            path: path,
            label: label,
            response: responseWithData
          });
        } else {
          !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: invalid incremental payload, expected ' + '`path` and `label` to either both be null/undefined, or ' + '`path` to be an `Array<string | number>` and `label` to be a ' + '`string`.') : invariant(false) : void 0;
        }
      } else {
        this._processResponse(responseWithData);
      }
    }

    this._sink.next(response);
  };

  _proto._processOptimisticResponse = function _processOptimisticResponse(response, updater) {
    var _this5 = this;

    !(this._optimisticUpdates === null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'environment.execute: only support one optimistic response per ' + 'execute.') : invariant(false) : void 0;

    if (response == null && updater == null) {
      return;
    }

    var optimisticUpdates = [];

    if (response) {
      var payload = normalizeResponse(response, this._operation.root, ROOT_TYPE, {
        getDataID: this._getDataID,
        path: [],
        request: this._operation.request
      });
      validateOptimisticResponsePayload(payload);
      optimisticUpdates.push({
        operation: this._operation,
        payload: payload,
        updater: updater
      });

      this._processOptimisticFollowups(payload, optimisticUpdates);
    } else if (updater) {
      optimisticUpdates.push({
        operation: this._operation,
        payload: {
          connectionEvents: null,
          errors: null,
          fieldPayloads: null,
          incrementalPlaceholders: null,
          moduleImportPayloads: null,
          source: RelayRecordSource.create()
        },
        updater: updater
      });
    }

    this._optimisticUpdates = optimisticUpdates;
    optimisticUpdates.forEach(function (update) {
      return _this5._publishQueue.applyUpdate(update);
    });

    this._publishQueue.run();
  };

  _proto._processOptimisticFollowups = function _processOptimisticFollowups(payload, optimisticUpdates) {
    if (payload.moduleImportPayloads && payload.moduleImportPayloads.length) {
      var moduleImportPayloads = payload.moduleImportPayloads;
      var operationLoader = this._operationLoader;
      !operationLoader ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected an operationLoader to be ' + 'configured when using `@match`.') : invariant(false) : void 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = moduleImportPayloads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var moduleImportPayload = _step.value;
          var operation = operationLoader.get(moduleImportPayload.operationReference);

          if (operation == null) {
            this._processAsyncOptimisticModuleImport(operationLoader, moduleImportPayload);
          } else {
            var moduleImportOptimisitcUpdates = this._processOptimisticModuleImport(operation, moduleImportPayload);

            optimisticUpdates.push.apply(optimisticUpdates, (0, _toConsumableArray2["default"])(moduleImportOptimisitcUpdates));
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
    }
  };

  _proto._normalizeModuleImport = function _normalizeModuleImport(moduleImportPayload, operation) {
    var selector = createNormalizationSelector(operation, moduleImportPayload.dataID, moduleImportPayload.variables);
    return normalizeResponse({
      data: moduleImportPayload.data
    }, selector, moduleImportPayload.typeName, {
      getDataID: this._getDataID,
      path: moduleImportPayload.path,
      request: this._operation.request
    });
  };

  _proto._processOptimisticModuleImport = function _processOptimisticModuleImport(operation, moduleImportPayload) {
    var optimisticUpdates = [];

    var modulePayload = this._normalizeModuleImport(moduleImportPayload, operation);

    validateOptimisticResponsePayload(modulePayload);
    optimisticUpdates.push({
      operation: this._operation,
      payload: modulePayload,
      updater: null
    });

    this._processOptimisticFollowups(modulePayload, optimisticUpdates);

    return optimisticUpdates;
  };

  _proto._processAsyncOptimisticModuleImport = function _processAsyncOptimisticModuleImport(operationLoader, moduleImportPayload) {
    var _this6 = this;

    operationLoader.load(moduleImportPayload.operationReference).then(function (operation) {
      if (operation == null || _this6._state !== 'started') {
        return;
      }

      var moduleImportOptimisitcUpdates = _this6._processOptimisticModuleImport(operation, moduleImportPayload);

      moduleImportOptimisitcUpdates.forEach(function (update) {
        return _this6._publishQueue.applyUpdate(update);
      });

      if (_this6._optimisticUpdates == null) {
        process.env.NODE_ENV !== "production" ? warning(false, 'RelayModernQueryExecutor: Unexpected ModuleImport optimisitc ' + 'update in operation %s.' + _this6._operation.request.node.params.name) : void 0;
      } else {
        var _this$_optimisticUpda;

        (_this$_optimisticUpda = _this6._optimisticUpdates).push.apply(_this$_optimisticUpda, (0, _toConsumableArray2["default"])(moduleImportOptimisitcUpdates));

        _this6._publishQueue.run();
      }
    });
  };

  _proto._processResponse = function _processResponse(response) {
    var _this7 = this;

    if (this._optimisticUpdates !== null) {
      this._optimisticUpdates.forEach(function (update) {
        return _this7._publishQueue.revertUpdate(update);
      });

      this._optimisticUpdates = null;
    }

    var payload = normalizeResponse(response, this._operation.root, ROOT_TYPE, {
      getDataID: this._getDataID,
      path: [],
      request: this._operation.request
    });
    this._incrementalPayloadsPending = false;

    this._incrementalResults.clear();

    this._source.clear();

    this._publishQueue.commitPayload(this._operation, payload, this._updater);

    var updatedOwners = this._publishQueue.run(this._operation);

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups(payload);
  }
  /**
   * Handles any follow-up actions for a Relay payload for @match, @defer,
   * and @stream directives.
   */
  ;

  _proto._processPayloadFollowups = function _processPayloadFollowups(payload) {
    var _this8 = this;

    if (this._state === 'completed') {
      return;
    }

    var incrementalPlaceholders = payload.incrementalPlaceholders,
        moduleImportPayloads = payload.moduleImportPayloads;

    if (moduleImportPayloads && moduleImportPayloads.length !== 0) {
      var operationLoader = this._operationLoader;
      !operationLoader ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected an operationLoader to be ' + 'configured when using `@match`.') : invariant(false) : void 0;
      moduleImportPayloads.forEach(function (moduleImportPayload) {
        _this8._processModuleImportPayload(moduleImportPayload, operationLoader);
      });
    }

    if (incrementalPlaceholders && incrementalPlaceholders.length !== 0) {
      this._incrementalPayloadsPending = this._state !== 'loading_final';
      incrementalPlaceholders.forEach(function (incrementalPlaceholder) {
        _this8._processIncrementalPlaceholder(payload, incrementalPlaceholder);
      });

      if (this._state === 'loading_final') {
        // The query has defer/stream selections that are enabled, but the
        // server indicated that this is a "final" payload: no incremental
        // payloads will be delivered. If it's not a client payload, warn that
        // the query was (likely) executed on the server in non-streaming mode,
        // with incremental delivery disabled.
        process.env.NODE_ENV !== "production" ? warning(this._isClientPayload, 'RelayModernEnvironment: Operation `%s` contains @defer/@stream ' + 'directives but was executed in non-streaming mode. See ' + 'https://fburl.com/relay-incremental-delivery-non-streaming-warning.', this._operation.request.node.params.name) : void 0; // But eagerly process any deferred payloads

        incrementalPlaceholders.forEach(function (placeholder) {
          if (placeholder.kind === 'defer') {
            _this8._processDeferResponse(placeholder.label, placeholder.path, placeholder, {
              data: placeholder.data
            });
          }
        });
      }
    }
  };

  _proto._maybeCompleteSubscriptionOperationTracking = function _maybeCompleteSubscriptionOperationTracking() {
    var isSubscriptionOperation = this._operation.request.node.params.operationKind === 'subscription';

    if (!isSubscriptionOperation) {
      return;
    }

    if (this._pendingModulePayloadsCount === 0 && this._incrementalPayloadsPending === false) {
      this._completeOperationTracker();
    }
  }
  /**
   * Processes a ModuleImportPayload, asynchronously resolving the normalization
   * AST and using it to normalize the field data into a RelayResponsePayload.
   * The resulting payload may contain other incremental payloads (match,
   * defer, stream, etc); these are handled by calling
   * `_processPayloadFollowups()`.
   */
  ;

  _proto._processModuleImportPayload = function _processModuleImportPayload(moduleImportPayload, operationLoader) {
    var _this9 = this;

    var syncOperation = operationLoader.get(moduleImportPayload.operationReference);

    if (syncOperation != null) {
      // If the operation module is available synchronously, normalize the
      // data synchronously.
      this._schedule(function () {
        _this9._handleModuleImportPayload(moduleImportPayload, syncOperation);

        _this9._maybeCompleteSubscriptionOperationTracking();
      });
    } else {
      // Otherwise load the operation module and schedule a task to normalize
      // the data when the module is available.
      var _id3 = this._nextSubscriptionId++;

      this._pendingModulePayloadsCount++;

      var decrementPendingCount = function decrementPendingCount() {
        _this9._pendingModulePayloadsCount--;

        _this9._maybeCompleteSubscriptionOperationTracking();
      }; // Observable.from(operationLoader.load()) wouldn't catch synchronous
      // errors thrown by the load function, which is user-defined. Guard
      // against that with Observable.from(new Promise(<work>)).


      RelayObservable.from(new Promise(function (resolve, reject) {
        operationLoader.load(moduleImportPayload.operationReference).then(resolve, reject);
      })).map(function (operation) {
        if (operation != null) {
          _this9._schedule(function () {
            _this9._handleModuleImportPayload(moduleImportPayload, operation);
          });
        }
      }).subscribe({
        complete: function complete() {
          _this9._complete(_id3);

          decrementPendingCount();
        },
        error: function error(_error4) {
          _this9._error(_error4);

          decrementPendingCount();
        },
        start: function start(subscription) {
          return _this9._start(_id3, subscription);
        }
      });
    }
  };

  _proto._handleModuleImportPayload = function _handleModuleImportPayload(moduleImportPayload, operation) {
    var relayPayload = this._normalizeModuleImport(moduleImportPayload, operation);

    this._publishQueue.commitPayload(this._operation, relayPayload);

    var updatedOwners = this._publishQueue.run();

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups(relayPayload);
  }
  /**
   * The executor now knows that GraphQL responses are expected for a given
   * label/path:
   * - Store the placeholder in order to process any future responses that may
   *   arrive.
   * - Then process any responses that had already arrived.
   *
   * The placeholder contains the normalization selector, path (for nested
   * defer/stream), and other metadata used to normalize the incremental
   * response(s).
   */
  ;

  _proto._processIncrementalPlaceholder = function _processIncrementalPlaceholder(relayPayload, placeholder) {
    var _this10 = this;

    var _relayPayload$fieldPa;

    // Update the label => path => placeholder map
    var label = placeholder.label,
        path = placeholder.path;
    var pathKey = path.map(String).join('.');

    var resultForLabel = this._incrementalResults.get(label);

    if (resultForLabel == null) {
      resultForLabel = new Map();

      this._incrementalResults.set(label, resultForLabel);
    }

    var resultForPath = resultForLabel.get(pathKey);
    var pendingResponses = resultForPath != null && resultForPath.kind === 'response' ? resultForPath.responses : null;
    resultForLabel.set(pathKey, {
      kind: 'placeholder',
      placeholder: placeholder
    }); // Store references to the parent node to allow detecting concurrent
    // modifications to the parent before items arrive and to replay
    // handle field payloads to account for new information on source records.

    var parentID;

    if (placeholder.kind === 'stream' || placeholder.kind === 'connection_edge') {
      parentID = placeholder.parentID;
    } else if (placeholder.kind === 'defer' || placeholder.kind === 'connection_page_info') {
      parentID = placeholder.selector.dataID;
    } else {
      placeholder;
      !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Unsupported incremental placeholder kind `%s`.', placeholder.kind) : invariant(false) : void 0;
    }

    var parentRecord = relayPayload.source.get(parentID);
    var parentPayloads = ((_relayPayload$fieldPa = relayPayload.fieldPayloads) !== null && _relayPayload$fieldPa !== void 0 ? _relayPayload$fieldPa : []).filter(function (fieldPayload) {
      var fieldID = generateClientID(fieldPayload.dataID, fieldPayload.fieldKey);
      return (// handlers applied to the streamed field itself
        fieldPayload.dataID === parentID || // handlers applied to a field on an ancestor object, where
        // ancestor.field links to the parent record (example: connections)
        fieldID === parentID
      );
    }); // If an incremental payload exists for some id that record should also
    // exist.

    !(parentRecord != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected record `%s` to exist.', parentID) : invariant(false) : void 0;
    var nextParentRecord;
    var nextParentPayloads;

    var previousParentEntry = this._source.get(parentID);

    if (previousParentEntry != null) {
      // If a previous entry exists, merge the previous/next records and
      // payloads together.
      nextParentRecord = RelayModernRecord.update(previousParentEntry.record, parentRecord);
      var handlePayloads = new Map();

      var dedupePayload = function dedupePayload(payload) {
        var key = stableStringify(payload);
        handlePayloads.set(key, payload);
      };

      previousParentEntry.fieldPayloads.forEach(dedupePayload);
      parentPayloads.forEach(dedupePayload);
      nextParentPayloads = Array.from(handlePayloads.values());
    } else {
      nextParentRecord = parentRecord;
      nextParentPayloads = parentPayloads;
    }

    this._source.set(parentID, {
      record: nextParentRecord,
      fieldPayloads: nextParentPayloads
    }); // If there were any queued responses, process them now that placeholders
    // are in place


    if (pendingResponses != null) {
      pendingResponses.forEach(function (incrementalResponse) {
        _this10._schedule(function () {
          _this10._processIncrementalResponse(incrementalResponse);
        });
      });
    }
  }
  /**
   * Lookup the placeholder the describes how to process an incremental
   * response, normalize/publish it, and process any nested defer/match/stream
   * metadata.
   */
  ;

  _proto._processIncrementalResponse = function _processIncrementalResponse(incrementalResponse) {
    var label = incrementalResponse.label,
        path = incrementalResponse.path,
        response = incrementalResponse.response;

    var resultForLabel = this._incrementalResults.get(label);

    if (resultForLabel == null) {
      resultForLabel = new Map();

      this._incrementalResults.set(label, resultForLabel);
    }

    if (label.indexOf('$defer$') !== -1) {
      var pathKey = path.map(String).join('.');
      var resultForPath = resultForLabel.get(pathKey);

      if (resultForPath == null) {
        resultForPath = {
          kind: 'response',
          responses: [incrementalResponse]
        };
        resultForLabel.set(pathKey, resultForPath);
        return;
      } else if (resultForPath.kind === 'response') {
        resultForPath.responses.push(incrementalResponse);
        return;
      }

      var placeholder = resultForPath.placeholder;

      if (placeholder.kind === 'connection_page_info') {
        this._processConnectionPageInfoResponse(label, path, placeholder, response);
      } else {
        !(placeholder.kind === 'defer') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' + 'to be data for @defer, was `@%s`.', pathKey, label, placeholder.kind) : invariant(false) : void 0;

        this._processDeferResponse(label, path, placeholder, response);
      }
    } else {
      // @stream payload path values end in the field name and item index,
      // but Relay records paths relative to the parent of the stream node:
      // therefore we strip the last two elements just to lookup the path
      // (the item index is used later to insert the element in the list)
      var _pathKey = path.slice(0, -2).map(String).join('.');

      var _resultForPath = resultForLabel.get(_pathKey);

      if (_resultForPath == null) {
        _resultForPath = {
          kind: 'response',
          responses: [incrementalResponse]
        };
        resultForLabel.set(_pathKey, _resultForPath);
        return;
      } else if (_resultForPath.kind === 'response') {
        _resultForPath.responses.push(incrementalResponse);

        return;
      }

      var _placeholder = _resultForPath.placeholder;

      if (_placeholder.kind === 'connection_edge') {
        this._processConnectionEdgeResponse(label, path, _placeholder, response);
      } else {
        !(_placeholder.kind === 'stream') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected data for path `%s` for label `%s` ' + 'to be data for @stream, was `@%s`.', _pathKey, label, _placeholder.kind) : invariant(false) : void 0;

        this._processStreamResponse(label, path, _placeholder, response);
      }
    }
  };

  _proto._processConnectionPageInfoResponse = function _processConnectionPageInfoResponse(label, path, placeholder, response) {
    var _relayPayload$connect;

    var relayPayload = normalizeResponse(response, placeholder.selector, placeholder.typeName, {
      getDataID: this._getDataID,
      path: placeholder.path,
      request: this._operation.request
    });

    var _RelayConnectionInter = RelayConnectionInterface.get(),
        END_CURSOR = _RelayConnectionInter.END_CURSOR,
        HAS_NEXT_PAGE = _RelayConnectionInter.HAS_NEXT_PAGE,
        HAS_PREV_PAGE = _RelayConnectionInter.HAS_PREV_PAGE,
        PAGE_INFO = _RelayConnectionInter.PAGE_INFO,
        START_CURSOR = _RelayConnectionInter.START_CURSOR;

    var pageRecord = relayPayload.source.get(placeholder.selector.dataID);
    var pageInfoID = pageRecord != null ? RelayModernRecord.getLinkedRecordID(pageRecord, PAGE_INFO) : null;
    var pageInfoRecord = pageInfoID != null ? relayPayload.source.get(pageInfoID) : null;
    var endCursor;
    var hasNextPage;
    var hasPrevPage;
    var startCursor;

    if (pageInfoRecord != null) {
      endCursor = RelayModernRecord.getValue(pageInfoRecord, END_CURSOR);
      hasNextPage = RelayModernRecord.getValue(pageInfoRecord, HAS_NEXT_PAGE);
      hasPrevPage = RelayModernRecord.getValue(pageInfoRecord, HAS_PREV_PAGE);
      startCursor = RelayModernRecord.getValue(pageInfoRecord, START_CURSOR);
    }

    relayPayload = (0, _objectSpread2["default"])({}, relayPayload, {
      connectionEvents: ((_relayPayload$connect = relayPayload.connectionEvents) !== null && _relayPayload$connect !== void 0 ? _relayPayload$connect : []).concat({
        kind: 'stream.pageInfo',
        args: placeholder.args,
        connectionID: placeholder.connectionID,
        pageInfo: {
          endCursor: typeof endCursor === 'string' ? endCursor : null,
          startCursor: typeof startCursor === 'string' ? startCursor : null,
          hasNextPage: typeof hasNextPage === 'boolean' ? hasNextPage : null,
          hasPrevPage: typeof hasPrevPage === 'boolean' ? hasPrevPage : null
        },
        request: this._operation.request
      })
    });

    this._publishQueue.commitPayload(this._operation, relayPayload);

    var updatedOwners = this._publishQueue.run();

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups(relayPayload);
  };

  _proto._processDeferResponse = function _processDeferResponse(label, path, placeholder, response) {
    var parentID = placeholder.selector.dataID;
    var relayPayload = normalizeResponse(response, placeholder.selector, placeholder.typeName, {
      getDataID: this._getDataID,
      path: placeholder.path,
      request: this._operation.request
    });

    this._publishQueue.commitPayload(this._operation, relayPayload); // Load the version of the parent record from which this incremental data
    // was derived


    var parentEntry = this._source.get(parentID);

    !(parentEntry != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected the parent record `%s` for @defer ' + 'data to exist.', parentID) : invariant(false) : void 0;
    var fieldPayloads = parentEntry.fieldPayloads;

    if (fieldPayloads.length !== 0) {
      var handleFieldsRelayPayload = {
        connectionEvents: null,
        errors: null,
        fieldPayloads: fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: RelayRecordSource.create()
      };

      this._publishQueue.commitPayload(this._operation, handleFieldsRelayPayload);
    }

    var updatedOwners = this._publishQueue.run();

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups(relayPayload);
  };

  _proto._processConnectionEdgeResponse = function _processConnectionEdgeResponse(label, path, placeholder, response) {
    var _relayPayload$connect2;

    var parentID = placeholder.parentID,
        node = placeholder.node,
        variables = placeholder.variables;

    var _this$_normalizeStrea = this._normalizeStreamItem(response, parentID, node, variables, path, placeholder.path),
        relayPayload = _this$_normalizeStrea.relayPayload,
        itemID = _this$_normalizeStrea.itemID,
        itemIndex = _this$_normalizeStrea.itemIndex;

    relayPayload = (0, _objectSpread2["default"])({}, relayPayload, {
      connectionEvents: ((_relayPayload$connect2 = relayPayload.connectionEvents) !== null && _relayPayload$connect2 !== void 0 ? _relayPayload$connect2 : []).concat({
        kind: 'stream.edge',
        args: placeholder.args,
        connectionID: placeholder.connectionID,
        edgeID: itemID,
        index: itemIndex,
        request: this._operation.request
      })
    });

    this._publishQueue.commitPayload(this._operation, relayPayload);

    var updatedOwners = this._publishQueue.run();

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups(relayPayload);
  }
  /**
   * Process the data for one item in a @stream field.
   */
  ;

  _proto._processStreamResponse = function _processStreamResponse(label, path, placeholder, response) {
    var parentID = placeholder.parentID,
        node = placeholder.node,
        variables = placeholder.variables; // Find the LinkedField where @stream was applied

    var field = node.selections[0];
    !(field != null && field.kind === 'LinkedField' && field.plural === true) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected @stream to be used on a plural field.') : invariant(false) : void 0;

    var _this$_normalizeStrea2 = this._normalizeStreamItem(response, parentID, field, variables, path, placeholder.path),
        fieldPayloads = _this$_normalizeStrea2.fieldPayloads,
        itemID = _this$_normalizeStrea2.itemID,
        itemIndex = _this$_normalizeStrea2.itemIndex,
        prevIDs = _this$_normalizeStrea2.prevIDs,
        relayPayload = _this$_normalizeStrea2.relayPayload,
        storageKey = _this$_normalizeStrea2.storageKey; // Publish the new item and update the parent record to set
    // field[index] = item *if* the parent record hasn't been concurrently
    // modified.


    this._publishQueue.commitPayload(this._operation, relayPayload, function (store) {
      var currentParentRecord = store.get(parentID);

      if (currentParentRecord == null) {
        // parent has since been deleted, stream data is stale
        return;
      }

      var currentItems = currentParentRecord.getLinkedRecords(storageKey);

      if (currentItems == null) {
        // field has since been deleted, stream data is stale
        return;
      }

      if (currentItems.length !== prevIDs.length || currentItems.some(function (currentItem, index) {
        return prevIDs[index] !== (currentItem && currentItem.getDataID());
      })) {
        // field has been modified by something other than this query,
        // stream data is stale
        return;
      } // parent.field has not been concurrently modified:
      // update `parent.field[index] = item`


      var nextItems = (0, _toConsumableArray2["default"])(currentItems);
      nextItems[itemIndex] = store.get(itemID);
      currentParentRecord.setLinkedRecords(nextItems, storageKey);
    }); // Now that the parent record has been updated to include the new item,
    // also update any handle fields that are derived from the parent record.


    if (fieldPayloads.length !== 0) {
      var handleFieldsRelayPayload = {
        connectionEvents: null,
        errors: null,
        fieldPayloads: fieldPayloads,
        incrementalPlaceholders: null,
        moduleImportPayloads: null,
        source: RelayRecordSource.create()
      };

      this._publishQueue.commitPayload(this._operation, handleFieldsRelayPayload);
    }

    var updatedOwners = this._publishQueue.run();

    this._updateOperationTracker(updatedOwners);

    this._processPayloadFollowups(relayPayload);
  };

  _proto._normalizeStreamItem = function _normalizeStreamItem(response, parentID, field, variables, path, normalizationPath) {
    var _field$alias, _field$concreteType, _this$_getDataID;

    var data = response.data;
    !(typeof data === 'object') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected the GraphQL @stream payload `data` ' + 'value to be an object.') : invariant(false) : void 0;
    var responseKey = (_field$alias = field.alias) !== null && _field$alias !== void 0 ? _field$alias : field.name;
    var storageKey = getStorageKey(field, variables); // Load the version of the parent record from which this incremental data
    // was derived

    var parentEntry = this._source.get(parentID);

    !(parentEntry != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected the parent record `%s` for @stream ' + 'data to exist.', parentID) : invariant(false) : void 0;
    var parentRecord = parentEntry.record,
        fieldPayloads = parentEntry.fieldPayloads; // Load the field value (items) that were created by *this* query executor
    // in order to check if there has been any concurrent modifications by some
    // other operation.

    var prevIDs = RelayModernRecord.getLinkedRecordIDs(parentRecord, storageKey);
    !(prevIDs != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected record `%s` to have fetched field ' + '`%s` with @stream.', parentID, field.name) : invariant(false) : void 0; // Determine the index in the field of the new item

    var finalPathEntry = path[path.length - 1];
    var itemIndex = parseInt(finalPathEntry, 10);
    !(itemIndex === finalPathEntry && itemIndex >= 0) ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected path for @stream to end in a ' + 'positive integer index, got `%s`', finalPathEntry) : invariant(false) : void 0;
    var typeName = (_field$concreteType = field.concreteType) !== null && _field$concreteType !== void 0 ? _field$concreteType : data[TYPENAME_KEY];
    !(typeof typeName === 'string') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected @stream field `%s` to have a ' + '__typename.', field.name) : invariant(false) : void 0; // Determine the __id of the new item: this must equal the value that would
    // be assigned had the item not been streamed

    var itemID = // https://github.com/prettier/prettier/issues/6403
    // prettier-ignore
    ((_this$_getDataID = this._getDataID(data, typeName)) !== null && _this$_getDataID !== void 0 ? _this$_getDataID : prevIDs && prevIDs[itemIndex]) || // Reuse previously generated client IDs
    generateClientID(parentID, storageKey, itemIndex);
    !(typeof itemID === 'string') ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernEnvironment: Expected id of elements of field `%s` to ' + 'be strings.', storageKey) : invariant(false) : void 0; // Build a selector to normalize the item data with

    var selector = createNormalizationSelector(field, itemID, variables); // Update the cached version of the parent record to reflect the new item:
    // this is used when subsequent stream payloads arrive to see if there
    // have been concurrent modifications to the list

    var nextParentRecord = RelayModernRecord.clone(parentRecord);
    var nextIDs = (0, _toConsumableArray2["default"])(prevIDs);
    nextIDs[itemIndex] = itemID;
    RelayModernRecord.setLinkedRecordIDs(nextParentRecord, storageKey, nextIDs);

    this._source.set(parentID, {
      record: nextParentRecord,
      fieldPayloads: fieldPayloads
    });

    var relayPayload = normalizeResponse(response, selector, typeName, {
      getDataID: this._getDataID,
      path: [].concat((0, _toConsumableArray2["default"])(normalizationPath), [responseKey, String(itemIndex)]),
      request: this._operation.request
    });
    return {
      fieldPayloads: fieldPayloads,
      itemID: itemID,
      itemIndex: itemIndex,
      prevIDs: prevIDs,
      relayPayload: relayPayload,
      storageKey: storageKey
    };
  };

  _proto._updateOperationTracker = function _updateOperationTracker(updatedOwners) {
    if (this._operationTracker != null && updatedOwners != null && updatedOwners.length > 0) {
      this._operationTracker.update(this._operation.request, new Set(updatedOwners));
    }
  };

  _proto._completeOperationTracker = function _completeOperationTracker() {
    if (this._operationTracker != null) {
      this._operationTracker.complete(this._operation.request);
    }
  };

  return Executor;
}();

function normalizeResponse(response, selector, typeName, options) {
  var data = response.data,
      errors = response.errors;
  var source = RelayRecordSource.create();
  var record = RelayModernRecord.create(selector.dataID, typeName);
  source.set(selector.dataID, record);
  var relayPayload = RelayResponseNormalizer.normalize(source, selector, data, options);
  return (0, _objectSpread2["default"])({}, relayPayload, {
    errors: errors
  });
}

function stableStringify(value) {
  var _JSON$stringify;

  return (_JSON$stringify = JSON.stringify(stableCopy(value))) !== null && _JSON$stringify !== void 0 ? _JSON$stringify : ''; // null-check for flow
}

function validateOptimisticResponsePayload(payload) {
  var incrementalPlaceholders = payload.incrementalPlaceholders;

  if (incrementalPlaceholders != null && incrementalPlaceholders.length !== 0) {
    !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'RelayModernQueryExecutor: optimistic responses cannot be returned ' + 'for operations that use incremental data delivery (@defer, ' + '@stream, and @stream_connection).') : invariant(false) : void 0;
  }
}

module.exports = {
  execute: execute
};