"use strict";
/**
 * Date & time utility functions to abstract the `aws-sdk` away from users.
 * (v2 => v3 modularization is a breaking change)
 *
 * @see https://github.com/aws/aws-sdk-js/blob/6edf586dcc1de7fe8fbfbbd9a0d2b1847921e6e1/lib/util.js#L262
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = {
    /**
     * Milliseconds to offset the date to compensate for clock skew between device & services
     */
    clockOffset: 0,
    getDateWithClockOffset: function () {
        if (exports.DateUtils.clockOffset) {
            return new Date(new Date().getTime() + exports.DateUtils.clockOffset);
        }
        else {
            return new Date();
        }
    },
    /**
     * @returns {number} Clock offset in milliseconds
     */
    getClockOffset: function () {
        return exports.DateUtils.clockOffset;
    },
    /**
     * @param {number} offset Clock offset in milliseconds
     */
    setClockOffset: function (offset) {
        exports.DateUtils.clockOffset = offset;
    },
};
//# sourceMappingURL=DateUtils.js.map