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

var IRValidator = require('../core/IRValidator');

var _require = require('../core/CompilerError'),
    createUserError = _require.createUserError;

var NODEKIND_DIRECTIVE_MAP = {
  Defer: 'defer',
  Stream: 'stream'
};
/*
 * Validate that server-only directives are not used inside client fields
 */

function validateServerOnlyDirectives(context) {
  IRValidator.validate(context, {
    ClientExtension: visitClientExtension,
    Defer: visitTransformedDirective,
    Stream: visitTransformedDirective,
    LinkedField: visitLinkedField,
    ScalarField: stopVisit
  }, function () {
    return {
      rootClientSelection: null
    };
  });
  return context;
} // If an empty visitor is defined, we no longer automatically visit child nodes
// such as arguments.


function stopVisit() {} // Only visits selections as an optimization to not look at arguments


function visitLinkedField(node, state) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = node.selections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var selection = _step.value;
      this.visit(selection, state);
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

function visitClientExtension(node, state) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = node.selections[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var selection = _step2.value;
      this.visit(selection, {
        rootClientSelection: selection
      });
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

function visitTransformedDirective(node, state) {
  if (state.rootClientSelection) {
    throwError("@".concat(NODEKIND_DIRECTIVE_MAP[node.kind]), node.loc, state.rootClientSelection.loc);
  } // directive used only on client fields


  if (node.selections.every(function (sel) {
    return sel.kind === 'ClientExtension';
  })) {
    var _clientExtension$sele;

    var clientExtension = node.selections[0];
    throwError("@".concat(NODEKIND_DIRECTIVE_MAP[node.kind]), node.loc, clientExtension && clientExtension.kind === 'ClientExtension' ? (_clientExtension$sele = clientExtension.selections[0]) === null || _clientExtension$sele === void 0 ? void 0 : _clientExtension$sele.loc : null);
  }

  this.traverse(node, state);
}

function throwError(directiveName, directiveLoc, clientExtensionLoc) {
  throw createUserError("Unexpected directive: ".concat(directiveName, ". ") + 'This directive can only be used on fields/fragments that are ' + 'fetched from the server schema, but it is used ' + 'inside a client-only selection.', clientExtensionLoc == null || directiveLoc === clientExtensionLoc ? [directiveLoc] : [directiveLoc, clientExtensionLoc]);
}

module.exports = {
  transform: validateServerOnlyDirectives
};