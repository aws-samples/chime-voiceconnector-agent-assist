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

var RelayFeatureFlags = {
  // T45504512: new connection model
  ENABLE_VARIABLE_CONNECTION_KEY: false,
  ENABLE_CONNECTION_RESOLVERS: false,
  ENABLE_PARTIAL_RENDERING_DEFAULT: false,
  ENABLE_RELAY_CONTAINERS_SUSPENSE: true,
  ENABLE_MISSING_VIEWER_FIELD_HANDLER: true,
  ENABLE_UNIQUE_MUTATION_ROOT: true,
  USE_RECORD_SOURCE_MAP_IMPL: false
};
module.exports = RelayFeatureFlags;