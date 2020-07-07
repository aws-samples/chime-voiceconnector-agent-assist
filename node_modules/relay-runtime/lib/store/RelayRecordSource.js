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

var RelayFeatureFlags = require('../util/RelayFeatureFlags');

var RelayRecordSourceMapImpl = require('./RelayRecordSourceMapImpl');

var RelayRecordSourceObjectImpl = require('./RelayRecordSourceObjectImpl');

var RelayRecordSource =
/*#__PURE__*/
function () {
  function RelayRecordSource(records) {
    return RelayRecordSource.create(records);
  }

  RelayRecordSource.create = function create(records) {
    var RecordSourceImpl = RelayFeatureFlags.USE_RECORD_SOURCE_MAP_IMPL ? RelayRecordSourceMapImpl : RelayRecordSourceObjectImpl;
    return new RecordSourceImpl(records);
  };

  return RelayRecordSource;
}();

module.exports = RelayRecordSource;