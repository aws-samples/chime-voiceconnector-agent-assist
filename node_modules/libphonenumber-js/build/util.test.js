"use strict";

var _util = require("./util");

describe('util', function () {
  it('`matchesEntirely()` should work in edge cases', function () {
    // No text.
    (0, _util.matchesEntirely)(undefined, '').should.equal(true); // "OR" in regexp.

    (0, _util.matchesEntirely)('911231231', '4\d{8}|[1-9]\d{7}').should.equal(false);
  });
  it('should merge arrays', function () {
    (0, _util.mergeArrays)([1, 2], [2, 3]).should.deep.equal([1, 2, 3]);
  });
});
//# sourceMappingURL=util.test.js.map