"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
require("moment-timezone");
require("moment-jdateformatparser");
var parseTimestamp = function (dateTime, format, timezone) {
    if (!dateTime || !format) {
        return null;
    }
    try {
        var momentFormatString = moment_1.default().toMomentFormatString(format);
        return timezone ? moment_1.default.tz(dateTime, momentFormatString, timezone) : moment_1.default(dateTime, momentFormatString);
    }
    catch (e) {
        return null;
    }
};
exports.time = function () { return ({
    nowISO8601: function (t) {
        return moment_1.default().toISOString();
    },
    nowEpochSeconds: function () {
        return moment_1.default().unix();
    },
    nowEpochMilliSeconds: function () {
        return moment_1.default().valueOf();
    },
    nowFormatted: function (format, timezone) {
        if (timezone === void 0) { timezone = null; }
        try {
            if (timezone) {
                return moment_1.default()
                    .tz(timezone)
                    .formatWithJDF(format);
            }
            return moment_1.default().formatWithJDF(format);
        }
        catch (e) {
            return null;
        }
    },
    parseFormattedToEpochMilliSeconds: function (dateTime, format, timezone) {
        var timestamp = parseTimestamp(dateTime, format, timezone);
        return timestamp ? timestamp.valueOf() : null;
    },
    parseISO8601ToEpochMilliSeconds: function (dateTime) {
        var timestamp = parseTimestamp(dateTime, 'YYYY-MM-DDTHH:mm:ss.SZ');
        return timestamp ? timestamp.valueOf() : null;
    },
    epochMilliSecondsToSeconds: function (milliseconds) {
        try {
            return Math.floor(milliseconds / 1000);
        }
        catch (e) {
            return null;
        }
    },
    epochMilliSecondsToISO8601: function (dateTime) {
        try {
            return moment_1.default(dateTime).toISOString();
        }
        catch (e) {
            return null;
        }
    },
    epochMilliSecondsToFormatted: function (timestamp, format, timezone) {
        if (timezone === void 0) { timezone = 'UTC'; }
        try {
            return moment_1.default(timestamp)
                .tz(timezone)
                .formatWithJDF(format);
        }
        catch (e) {
            return null;
        }
    },
}); };
//# sourceMappingURL=time.js.map