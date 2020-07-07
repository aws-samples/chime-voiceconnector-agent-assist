/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 */
// flowlint ambiguous-object-type:error
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var GraphQLNodeMap = require('./GraphQLNodeMap');

var _require = require('./GraphQLASTUtils'),
    getName = _require.getName;

var _require2 = require('graphql'),
    visit = _require2.visit;

function buildDependencyMap(nodes) {
  var dependencyMap = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = nodes.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var node = _step.value;
      var name = getName(node);

      if (dependencyMap.has(name)) {
        throw new Error("Duplicated definition for ".concat(name));
      }

      dependencyMap.set(name, findIncludedFragments(node));
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

  return dependencyMap;
}

function mergeMaps(maps) {
  var result = new Map();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = maps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var source = _step2.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = source.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _step3$value = _step3.value,
              key = _step3$value[0],
              value = _step3$value[1];

          if (result.has(key)) {
            throw new Error("Duplicate entry for '".concat(key, "'."));
          }

          result.set(key, value);
        }
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

  return result;
}

function forFullBuild(nodes, baseNodes) {
  var dependencyMap = mergeMaps([nodes].concat((0, _toConsumableArray2["default"])(baseNodes)).map(buildDependencyMap));
  var includedNames = includeReachable(new Set(nodes.keys()), dependencyMap);
  return buildResult(includedNames, nodes, mergeMaps(baseNodes));
}

function forChanges(nodes, changedNames) {
  var baseNodes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var projectDependencyMap = buildDependencyMap(nodes);
  var baseDependencyMap = mergeMaps(baseNodes.map(buildDependencyMap));
  var dependencyMap = mergeMaps([projectDependencyMap, baseDependencyMap]);
  var invertedDependencyMap = inverseDependencyMap(dependencyMap);
  var baseNameToNode = mergeMaps(baseNodes); // The first step of the process is to find all ancestors of changed nodes.
  // And we perform this search on complete dependency map (project + base)

  var directlyChangedAndAncestors = includeReachable(changedNames, invertedDependencyMap); // Now, we need to intersect obtained set with the project nodes

  var directlyChangedRelatedToProject = new Set();
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = directlyChangedAndAncestors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var node = _step4.value;

      if (nodes.has(node)) {
        directlyChangedRelatedToProject.add(node);
      }
    } // Finally, we need to find all descendants of project-related changed nodes
    // in the complete dependency map (project + base)

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

  var allRelated = includeReachable(directlyChangedRelatedToProject, dependencyMap);
  return buildResult(allRelated, nodes, baseNameToNode);
}

function buildResult(includedNames, nameToNode, baseNameToNode) {
  var baseNames = new Set();
  var nodes = [];
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = includedNames[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var name = _step5.value;
      var baseNode = baseNameToNode.get(name);

      if (baseNode != null) {
        nodes.push(baseNode);
        baseNames.add(name);
      }

      var node = nameToNode.get(name);

      if (node != null) {
        nodes.push(node);
      }
    }
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

  return {
    baseNames: baseNames,
    nodes: GraphQLNodeMap.from(nodes)
  };
}

function includeReachable(changed, deps) {
  var toVisit = Array.from(changed);
  var visited = new Set();

  while (toVisit.length > 0) {
    var current = toVisit.pop();
    visited.add(current);
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = (deps.get(current) || [])[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var dep = _step6.value;

        if (!visited.has(dep)) {
          toVisit.push(dep);
        }
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
          _iterator6["return"]();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }

  return visited;
}

function findIncludedFragments(node) {
  var result = [];
  visit(node, {
    FragmentSpread: function FragmentSpread(spread) {
      result.push(spread.name.value);
    }
  });
  return result;
}

function inverseDependencyMap(map) {
  var invertedMap = new Map();
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = map.entries()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var _step7$value = _step7.value,
          source = _step7$value[0],
          dests = _step7$value[1];
      var inverseDest = source;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = dests[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var dest = _step8.value;
          var inverseSource = dest;
          var inverseDests = invertedMap.get(inverseSource);

          if (inverseDests == null) {
            inverseDests = [];
            invertedMap.set(inverseSource, inverseDests);
          }

          inverseDests.push(inverseDest);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
            _iterator8["return"]();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
        _iterator7["return"]();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  return invertedMap;
}

module.exports = {
  forChanges: forChanges,
  forFullBuild: forFullBuild
};