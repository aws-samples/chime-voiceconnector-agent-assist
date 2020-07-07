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

var crypto = require('crypto');

var nullthrows = require('nullthrows');

var _require = require('./GraphQLASTUtils'),
    getName = _require.getName;

function createEmptyState() {
  return {
    artifacts: new Map(),
    metadata: new Map()
  };
}

function serializeState(state) {
  var json = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = state.artifacts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _step.value,
          name = _step$value[0],
          artifacts = _step$value[1];
      json.push([name, Array.from(artifacts).map(function (filename) {
        var _state$metadata$get;

        return [filename, (_state$metadata$get = state.metadata.get(filename)) !== null && _state$metadata$get !== void 0 ? _state$metadata$get : ''];
      })]);
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

  return json;
}

function deserializeState(json) {
  var metadata = new Map();
  var artifacts = new Map();
  json.forEach(function (_ref) {
    var name = _ref[0],
        artifactArray = _ref[1];
    var artifactsFiles = new Set();
    artifactArray.forEach(function (_ref2) {
      var filename = _ref2[0],
          sha1hex = _ref2[1];
      artifactsFiles.add(filename);
      metadata.set(filename, sha1hex);
    });
    artifacts.set(name, artifactsFiles);
  });
  return {
    artifacts: artifacts,
    metadata: metadata
  };
}

function updateState(state, changes, generatedArtifacts, filesystem, resolveFullPath) {
  var nextState = {
    artifacts: new Map(state.artifacts),
    metadata: new Map(state.metadata)
  };
  var deletionCandidates = new Set();
  var addedNames = new Set();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = changes.added[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var ast = _step2.value.ast;
      addedNames.add(getName(ast));
    } // For every removed AST node, delete the generated artifacts tracked for that
    // node, unless the AST node was also added when the file was moved or the
    // AST changed which shows up as added and removed in changes.

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

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = changes.removed[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var ast = _step3.value.ast;
      var name = getName(ast);

      if (addedNames.has(name)) {
        // Update, we deal with that when iterating the added nodes.
        continue;
      }

      var entry = nextState.artifacts.get(name);

      if (entry == null) {
        // No existing artifacts to delete
        continue;
      }

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = entry.keys()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var outdatedFile = _step7.value;
          deletionCandidates.add(outdatedFile);
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

      nextState.artifacts["delete"](name);
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

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = generatedArtifacts.artifacts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _step4$value = _step4.value,
          _name = _step4$value[0],
          artifacts = _step4$value[1];
      var oldEntry = nextState.artifacts.get(_name);

      if (oldEntry != null) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = oldEntry[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _outdatedFile = _step8.value;

            if (!artifacts.has(_outdatedFile)) {
              deletionCandidates.add(_outdatedFile);
            }
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

      nextState.artifacts.set(_name, artifacts);
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = artifacts.keys()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _generatedArtifacts$m;

          var filename = _step9.value;
          nextState.metadata.set(filename, (_generatedArtifacts$m = generatedArtifacts.metadata.get(filename)) !== null && _generatedArtifacts$m !== void 0 ? _generatedArtifacts$m : '');
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
            _iterator9["return"]();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }
    }
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

  if (deletionCandidates.size === 0) {
    return nextState;
  }

  var nextGeneratedArtifacts = new Set();
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = eachNameAndArtifact(nextState)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _step5$value = _step5.value,
          artifact = _step5$value[1];
      nextGeneratedArtifacts.add(artifact);
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

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = deletionCandidates[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var candidate = _step6.value;
      var someoneElseArtifact = nextGeneratedArtifacts.has(candidate);

      if (someoneElseArtifact) {
        // Sometimes, there are artifacts that are generated by multiple files
        // If this candidate is also generated by someone else in
        // artifact map, we just skip it here
        continue;
      }

      var candidatePath = resolveFullPath(candidate);

      if (filesystem.existsSync(candidatePath)) {
        filesystem.unlinkSync(candidatePath);
        nextState.metadata["delete"](candidate);
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

  return nextState;
}

function producedFiles(dirs, artifactsMetadata) {
  var result = new Map();
  dirs.forEach(function (_ref3) {
    var baseDir = _ref3.baseDir,
        dir = _ref3.dir;
    var _dir$changes = dir.changes,
        deleted = _dir$changes.deleted,
        updated = _dir$changes.updated,
        created = _dir$changes.created,
        unchanged = _dir$changes.unchanged;

    if (deleted.length > 0) {
      throw new Error('Did not expect to see a deletion entry here.');
    }

    [].concat((0, _toConsumableArray2["default"])(updated), (0, _toConsumableArray2["default"])(created)).forEach(function (filename) {
      var name = dir.getPath(filename).substr(baseDir.length + 1);
      var sha1hex = sha1(nullthrows(dir.read(filename)));
      result.set(name, sha1hex);
    });
    unchanged.forEach(function (filename) {
      var _sha1hex;

      var name = dir.getPath(filename).substr(baseDir.length + 1);
      var sha1hex = artifactsMetadata.get(name);
      result.set(name, (_sha1hex = sha1hex) !== null && _sha1hex !== void 0 ? _sha1hex : sha1(nullthrows(dir.read(filename))));
    });
  });
  return result;
}

function* eachNameAndArtifact(artifacts) {
  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = artifacts.artifacts[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      var _step10$value = _step10.value,
          name = _step10$value[0],
          artifactsForSource = _step10$value[1];
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = artifactsForSource.keys()[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var artifactFile = _step11.value;
          yield [name, artifactFile];
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
            _iterator11["return"]();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError10 = true;
    _iteratorError10 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
        _iterator10["return"]();
      }
    } finally {
      if (_didIteratorError10) {
        throw _iteratorError10;
      }
    }
  }
}

function sha1(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

module.exports = {
  createEmptyState: createEmptyState,
  serializeState: serializeState,
  deserializeState: deserializeState,
  updateState: updateState,
  producedFiles: producedFiles,
  eachNameAndArtifact: eachNameAndArtifact
};