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

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var SignedSource = require('signedsource');

function writeForSchema(schema, licenseHeader, codegenDir, getModuleName) {
  var header = '/**\n' + licenseHeader.map(function (line) {
    return " * ".concat(line, "\n");
  }).join('') + ' *\n' + " * ".concat(SignedSource.getSigningToken(), "\n") + ' * @flow strict\n' + ' */\n' + '\n';
  var enumTypes = schema.getTypes().filter(function (type) {
    return schema.isEnum(type);
  });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = enumTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var type = _step.value;
      var enumType = schema.assertEnumType(type);
      var name = schema.getTypeString(type);
      var values = (0, _toConsumableArray2["default"])(schema.getEnumValues(enumType)).sort();
      var enumFileContent = header + "export type ".concat(name, " =\n  | '") + values.join("'\n  | '") + "'\n  | '%future added value';\n";
      codegenDir.writeFile("".concat(getModuleName(name), ".js"), SignedSource.signFile(enumFileContent));
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

module.exports = {
  writeForSchema: writeForSchema
};