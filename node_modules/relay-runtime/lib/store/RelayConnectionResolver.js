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

var invariant = require("fbjs/lib/invariant");

var ConnectionResolver = {
  initialize: function initialize() {
    return {
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: null,
        hasPrevPage: null,
        startCursor: null
      }
    };
  },
  reduce: function reduce(state, event) {
    var nextEdges = [];
    var nextPageInfo = (0, _objectSpread2["default"])({}, state.pageInfo);
    var seenNodes = new Set();

    function pushEdge(edge) {
      if (edge != null && edge.node != null && !seenNodes.has(edge.node.__id)) {
        seenNodes.add(edge.node.__id);
        nextEdges.push(edge);
        return edge;
      }
    }

    if (event.kind === 'update') {
      state.edges.forEach(function (edge) {
        var nextEdge = event.edgeData.hasOwnProperty(edge.__id) ? event.edgeData[edge.__id] : edge;
        pushEdge(nextEdge);
      });
    } else if (event.kind === 'fetch') {
      var eventPageInfo = event.pageInfo;

      if (event.args.after != null) {
        var _ref, _ref2;

        if (event.args.after !== state.pageInfo.endCursor) {
          return state;
        }

        state.edges.forEach(function (edge) {
          pushEdge(edge);
        });
        event.edges.forEach(function (nextEdge) {
          pushEdge(nextEdge);
        });
        nextPageInfo.endCursor = (_ref = eventPageInfo === null || eventPageInfo === void 0 ? void 0 : eventPageInfo.endCursor) !== null && _ref !== void 0 ? _ref : nextPageInfo.endCursor;
        nextPageInfo.hasNextPage = (_ref2 = eventPageInfo === null || eventPageInfo === void 0 ? void 0 : eventPageInfo.hasNextPage) !== null && _ref2 !== void 0 ? _ref2 : nextPageInfo.hasNextPage;
      } else if (event.args.before != null) {
        var _ref3, _ref4;

        if (event.args.before !== state.pageInfo.startCursor) {
          return state;
        }

        event.edges.forEach(function (nextEdge) {
          pushEdge(nextEdge);
        });
        state.edges.forEach(function (edge) {
          pushEdge(edge);
        });
        nextPageInfo.startCursor = (_ref3 = eventPageInfo === null || eventPageInfo === void 0 ? void 0 : eventPageInfo.startCursor) !== null && _ref3 !== void 0 ? _ref3 : nextPageInfo.startCursor;
        nextPageInfo.hasPrevPage = (_ref4 = eventPageInfo === null || eventPageInfo === void 0 ? void 0 : eventPageInfo.hasPrevPage) !== null && _ref4 !== void 0 ? _ref4 : nextPageInfo.hasPrevPage;
      } else if (event.args.before == null && event.args.after == null) {
        event.edges.forEach(function (nextEdge) {
          pushEdge(nextEdge);
        });

        if (eventPageInfo != null) {
          nextPageInfo = eventPageInfo;
        }
      }
    } else if (event.kind === 'insert') {
      state.edges.forEach(function (edge) {
        pushEdge(edge);
      });
      var nextEdge = pushEdge(event.edge);

      if (nextEdge != null) {
        var _nextEdge$cursor;

        nextPageInfo.endCursor = (_nextEdge$cursor = nextEdge.cursor) !== null && _nextEdge$cursor !== void 0 ? _nextEdge$cursor : nextPageInfo.endCursor;
      }
    } else if (event.kind === 'stream.edge') {
      if (event.args.after != null) {
        if (event.index === 0 && state.pageInfo.endCursor != null && event.args.after !== state.pageInfo.endCursor) {
          return state;
        }

        state.edges.forEach(function (edge) {
          pushEdge(edge);
        });

        var _nextEdge = pushEdge(event.edge);

        if (_nextEdge) {
          var _nextEdge$cursor2;

          nextPageInfo.endCursor = (_nextEdge$cursor2 = _nextEdge.cursor) !== null && _nextEdge$cursor2 !== void 0 ? _nextEdge$cursor2 : nextPageInfo.endCursor;
        }
      } else if (event.args.before != null) {
        if (event.index === 0 && state.pageInfo.startCursor != null && event.args.before !== state.pageInfo.startCursor) {
          return state;
        }

        var _nextEdge2 = pushEdge(event.edge);

        if (_nextEdge2) {
          var _nextEdge$cursor3;

          nextPageInfo.startCursor = (_nextEdge$cursor3 = _nextEdge2.cursor) !== null && _nextEdge$cursor3 !== void 0 ? _nextEdge$cursor3 : nextPageInfo.startCursor;
        }

        state.edges.forEach(function (edge) {
          pushEdge(edge);
        });
      } else if (event.args.after == null || event.args.before == null) {
        state.edges.forEach(function (edge) {
          pushEdge(edge);
        });

        var _nextEdge3 = pushEdge(event.edge);

        if (_nextEdge3 != null) {
          var _nextEdge$cursor4;

          nextPageInfo.endCursor = (_nextEdge$cursor4 = _nextEdge3.cursor) !== null && _nextEdge$cursor4 !== void 0 ? _nextEdge$cursor4 : nextPageInfo.endCursor;
        }
      }
    } else if (event.kind === 'stream.pageInfo') {
      nextEdges.push.apply(nextEdges, (0, _toConsumableArray2["default"])(state.edges));

      if (event.args.after != null) {
        var _event$pageInfo$endCu;

        nextPageInfo.endCursor = (_event$pageInfo$endCu = event.pageInfo.endCursor) !== null && _event$pageInfo$endCu !== void 0 ? _event$pageInfo$endCu : nextPageInfo.endCursor;
        nextPageInfo.hasNextPage = !!event.pageInfo.hasNextPage;
      } else if (event.args.before != null) {
        var _event$pageInfo$start;

        nextPageInfo.startCursor = (_event$pageInfo$start = event.pageInfo.startCursor) !== null && _event$pageInfo$start !== void 0 ? _event$pageInfo$start : nextPageInfo.startCursor;
        nextPageInfo.hasPrevPage = !!event.pageInfo.hasPrevPage;
      } else {
        // stream refetch
        nextPageInfo = event.pageInfo;
      }
    } else {
      event;
      !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'ConnectionResolver-test: Unexpected event kind `%s`.', event.kind) : invariant(false) : void 0;
    }

    return {
      edges: nextEdges,
      pageInfo: nextPageInfo
    };
  }
};
module.exports = ConnectionResolver;