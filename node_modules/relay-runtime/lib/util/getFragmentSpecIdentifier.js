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

var getFragmentIdentifier = require('./getFragmentIdentifier');

var mapObject = require("fbjs/lib/mapObject");

var stableCopy = require('./stableCopy');

function getFragmentSpecIdentifier(fragmentNodes, fragmentRefs) {
  return JSON.stringify(stableCopy(mapObject(fragmentNodes, function (fragmentNode, key) {
    var fragmentRef = fragmentRefs[key];
    return getFragmentIdentifier(fragmentNode, fragmentRef);
  })));
}

module.exports = getFragmentSpecIdentifier;