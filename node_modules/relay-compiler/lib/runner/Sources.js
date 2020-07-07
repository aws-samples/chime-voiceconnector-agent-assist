/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * 
 * @emails oncall+relay
 */
// flowlint ambiguous-object-type:error
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var invariant = require("fbjs/lib/invariant");

var _require = require('./extractAST'),
    toASTRecord = _require.toASTRecord;

var _require2 = require('graphql'),
    Source = _require2.Source,
    parse = _require2.parse;

function md5(x) {
  return require('crypto').createHash('md5').update(x, 'utf8').digest('hex');
}

var Sources =
/*#__PURE__*/
function () {
  Sources.fromSavedState = function fromSavedState(_ref2) {
    var extractFromFile = _ref2.extractFromFile,
        savedState = _ref2.savedState;
    var state = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var _step$value = _step.value,
            file = _step$value.file,
            savedStateSources = _step$value.sources;
        var nodes = {};
        var sources = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = savedStateSources[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var text = _step2.value;
            var doc = parse(new Source(text, file));
            !doc.definitions.length ? process.env.NODE_ENV !== "production" ? invariant(false, 'expected not empty list of definitions') : invariant(false) : void 0;
            var entities = doc.definitions.map(function (node) {
              return toASTRecord(node);
            });
            entities.forEach(function (astRecord) {
              nodes[md5(astRecord.text)] = astRecord.ast;
            });
            sources.push(text);
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

        state[file] = {
          nodes: nodes,
          sources: sources
        };
      };

      for (var _iterator = savedState[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
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

    return new Sources({
      extractFromFile: extractFromFile,
      state: state
    });
  };

  function Sources(_ref3) {
    var extractFromFile = _ref3.extractFromFile,
        state = _ref3.state;
    this._extractFromFile = extractFromFile;
    this._state = (0, _objectSpread2["default"])({}, state);
  }

  var _proto = Sources.prototype;

  _proto.processChanges = function processChanges(baseDir, files) {
    var added = [];
    var removed = [];
    var state = (0, _objectSpread2["default"])({}, this._state);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = files[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _ref, _state$file$name;

        var _file = _step3.value;
        var newDefs = void 0;
        var newSources = void 0;

        try {
          var extracted = this._extractFromFile(baseDir, _file);

          if (extracted != null) {
            newDefs = extracted.nodes;
            newSources = extracted.sources;
          }
        } catch (error) {
          throw new Error("RelayCompiler: Sources module failed to parse ".concat(_file.name, ":\n").concat(error.message));
        }

        var hasEntry = state.hasOwnProperty(_file.name);
        var oldEntry = (_ref = (_state$file$name = state[_file.name]) === null || _state$file$name === void 0 ? void 0 : _state$file$name.nodes) !== null && _ref !== void 0 ? _ref : {}; // First case, we have new changes in the file
        // for example changed Query or Fragment

        if (newDefs != null && newDefs.length > 0) {
          // We need to add all entities from the changed file to added arrays
          var newEntry = {};
          var newTexts = new Set();
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = newDefs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var _step4$value = _step4.value,
                  _ast = _step4$value.ast,
                  text = _step4$value.text;
              var hashedText = md5(text);
              newTexts.add(hashedText);

              if (hasEntry && oldEntry[hashedText] != null) {
                // Entity text did not change, so we
                // don't need to change it in the state
                newEntry[hashedText] = oldEntry[hashedText];
              } else {
                // Here we have completely new text.
                // We need add it to the `added` changes
                newEntry[hashedText] = _ast;
                added.push({
                  file: _file.name,
                  ast: _ast
                });
              }
            } // Also, we need to delete all old entities
            // that are not included in the new changes

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

          if (hasEntry) {
            for (var _i = 0, _Object$keys = Object.keys(oldEntry); _i < _Object$keys.length; _i++) {
              var oldHashedText = _Object$keys[_i];
              var ast = oldEntry[oldHashedText];

              if (!newTexts.has(oldHashedText)) {
                removed.push({
                  file: _file.name,
                  ast: ast
                });
              }
            }
          } // Finally, update the state with the changes


          state[_file.name] = {
            nodes: newEntry,

            /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
             * Flow v0.111.0 was deployed. To see the error, delete this comment
             * and run Flow. */
            sources: newSources
          };
        } else {
          // Otherwise, file has been removed or there are no entities in the file
          if (hasEntry) {
            // We will put all ASTNodes from current state to removed collection
            for (var _i2 = 0, _Object$keys2 = Object.keys(oldEntry); _i2 < _Object$keys2.length; _i2++) {
              var _oldHashedText = _Object$keys2[_i2];
              var _ast2 = oldEntry[_oldHashedText];
              removed.push({
                file: _file.name,
                ast: _ast2
              });
            }

            delete state[_file.name];
          }
        }
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

    return {
      /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when Flow
       * v0.111.0 was deployed. To see the error, delete this comment and run
       * Flow. */
      changes: {
        added: added,
        removed: removed
      },
      sources: new Sources({
        extractFromFile: this._extractFromFile,
        state: state
      })
    };
  };

  _proto.nodes = function* nodes() {
    for (var _file2 in this._state) {
      var entry = this._state[_file2];

      for (var _i3 = 0, _Object$values = Object.values(entry.nodes); _i3 < _Object$values.length; _i3++) {
        var node = _Object$values[_i3];
        yield node;
      }
    }
  };

  _proto.serializeState = function serializeState() {
    var serializedState = [];

    for (var _file3 in this._state) {
      serializedState.push({
        file: _file3,
        sources: this._state[_file3].sources
      });
    }

    return serializedState;
  };

  return Sources;
}();

module.exports = Sources;