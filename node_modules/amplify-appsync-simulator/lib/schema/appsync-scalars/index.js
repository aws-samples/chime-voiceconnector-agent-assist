"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_type_json_1 = __importDefault(require("graphql-type-json"));
var libphonenumber_js_1 = require("libphonenumber-js");
var graphql_iso_date_1 = require("graphql-iso-date");
var graphql_scalars_1 = require("graphql-scalars");
var IPV4_REGEX = /^(?:(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?)$/;
var IPV6_REGEX = /^(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|::(?:[0-9A-Fa-f]{1,4}:){5}(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}(?:0?0?[0-9]|0?[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)(?:\/(?:0?0?[0-9]|0?[1-9][0-9]|1[01][0-9]|12[0-8]))?)$/;
var phoneValidator = function (ast, options) {
    var _a = options.country, country = _a === void 0 ? 'US' : _a;
    var kind = ast.kind, value = ast.value;
    if (kind !== graphql_1.Kind.STRING) {
        throw new graphql_1.GraphQLError("Query error: Can only parse strings got a: " + kind, [ast]);
    }
    var isValid = libphonenumber_js_1.isValidNumber(value, country);
    if (!isValid) {
        throw new graphql_1.GraphQLError('Query error: Not a valid phone number', [ast]);
    }
    return value;
};
var AWSPhone = /** @class */ (function (_super) {
    __extends(AWSPhone, _super);
    function AWSPhone(options) {
        if (options === void 0) { options = { name: null, description: null }; }
        var _this = this;
        var name = options.name, description = options.description;
        _this = _super.call(this, {
            name: name,
            description: description,
            serialize: function (value) {
                var ast = {
                    kind: graphql_1.Kind.STRING,
                    value: value,
                };
                return phoneValidator(ast, options);
            },
            parseValue: function (value) {
                var ast = {
                    kind: graphql_1.Kind.STRING,
                    value: value,
                };
                return phoneValidator(ast, options);
            },
            parseLiteral: function (ast) { return phoneValidator(ast, options); },
        }) || this;
        return _this;
    }
    return AWSPhone;
}(graphql_1.GraphQLScalarType));
var AWSDate = new graphql_1.GraphQLScalarType({
    name: 'AWSDate',
    description: graphql_iso_date_1.GraphQLDate.description,
    serialize: function (value) {
        return graphql_iso_date_1.GraphQLDate.serialize(value);
    },
    parseValue: function (value) {
        return graphql_iso_date_1.GraphQLDate.parseValue(value) ? value : undefined;
    },
    parseLiteral: function (value) {
        return graphql_iso_date_1.GraphQLDate.parseLiteral(value) ? value.value : undefined;
    },
});
var AWSTime = new graphql_1.GraphQLScalarType({
    name: 'AWSTime',
    description: graphql_iso_date_1.GraphQLTime.description,
    serialize: function (value) {
        return graphql_iso_date_1.GraphQLTime.serialize(value);
    },
    parseValue: function (value) {
        return graphql_iso_date_1.GraphQLTime.parseValue(value) ? value : undefined;
    },
    parseLiteral: function (value) {
        return graphql_iso_date_1.GraphQLTime.parseLiteral(value) ? value.value : undefined;
    },
});
var AWSDateTime = new graphql_1.GraphQLScalarType({
    name: 'AWSDateTime',
    description: graphql_iso_date_1.GraphQLDateTime.description,
    serialize: function (value) {
        return graphql_iso_date_1.GraphQLDateTime.serialize(value);
    },
    parseValue: function (value) {
        return graphql_iso_date_1.GraphQLDateTime.parseValue(value) ? value : undefined;
    },
    parseLiteral: function (value) {
        return graphql_iso_date_1.GraphQLDateTime.parseLiteral(value) ? value.value : undefined;
    },
});
var AWSTimestamp = new graphql_1.GraphQLScalarType({
    name: 'AWSTimestamp',
    description: 'The AWSTimestamp scalar type represents the number of seconds that have elapsed \
since 1970-01-01T00:00Z. Timestamps are serialized and deserialized as numbers. Negative values \
are also accepted and these represent the number of seconds till 1970-01-01T00:00Z.',
    serialize: function (value) {
        return graphql_1.GraphQLInt.serialize(value);
    },
    parseValue: function (value) {
        return graphql_1.GraphQLInt.parseValue(value) ? value : undefined;
    },
    parseLiteral: function (value) {
        return graphql_1.GraphQLInt.parseLiteral(value, null) ? value.value : undefined;
    },
});
// Unified the code for both types from graphql-scalars library.
var validateIPAddress = function (value) {
    if (typeof value !== 'string') {
        throw new TypeError("Value is not string: " + value);
    }
    if (!IPV4_REGEX.test(value)) {
        throw new TypeError("Value is not a valid IPv4 address: " + value);
    }
    if (!IPV6_REGEX.test(value)) {
        throw new TypeError("Value is not a valid IPv6 address: " + value);
    }
    return value;
};
var AWSIPAddress = new graphql_1.GraphQLScalarType({
    name: 'AWSIPAddress',
    description: 'The AWSIPAddress scalar type represents a valid IPv4 or IPv6 address string.',
    serialize: function (value) {
        return validateIPAddress(value);
    },
    parseValue: function (value) {
        return validateIPAddress(value);
    },
    parseLiteral: function (ast) {
        if (ast.kind !== graphql_1.Kind.STRING) {
            throw new graphql_1.GraphQLError("Can only validate strings as IPv4 or IPv6 addresses but got a: " + ast.kind);
        }
        return validateIPAddress(ast.value);
    },
});
exports.scalars = {
    AWSJSON: graphql_type_json_1.default,
    AWSDate: AWSDate,
    AWSTime: AWSTime,
    AWSDateTime: AWSDateTime,
    AWSPhone: AWSPhone,
    AWSEmail: graphql_scalars_1.EmailAddressResolver,
    AWSURL: graphql_scalars_1.URLResolver,
    AWSTimestamp: AWSTimestamp,
    AWSIPAddress: AWSIPAddress,
};
function wrapSchema(schemaString) {
    var scalarStrings = Object.keys(exports.scalars)
        .map(function (scalarKey) { return "scalar " + scalarKey + "\n"; })
        .join('');
    return scalarStrings + schemaString;
}
exports.wrapSchema = wrapSchema;
//# sourceMappingURL=index.js.map