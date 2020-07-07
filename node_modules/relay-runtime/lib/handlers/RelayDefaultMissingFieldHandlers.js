/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
'use strict';

var _require = require('../store/RelayStoreUtils'),
    ROOT_TYPE = _require.ROOT_TYPE;

var _require2 = require('../store/ViewerPattern'),
    VIEWER_ID = _require2.VIEWER_ID;

var missingViewerFieldHandler = {
  kind: 'linked',
  handle: function handle(field, record, argValues) {
    if (record != null && record.__typename === ROOT_TYPE && field.name === 'viewer') {
      return VIEWER_ID;
    }
  }
};
module.exports = [missingViewerFieldHandler];