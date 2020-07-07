"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
function gql(literals) {
    var placeholders = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        placeholders[_i - 1] = arguments[_i];
    }
    var interleaved = [];
    for (var i = 0; i < placeholders.length; i++) {
        interleaved.push(literals[i]);
        interleaved.push(placeholders[i]);
    }
    interleaved.push(literals[literals.length - 1]);
    var actualSchema = interleaved.join('');
    return graphql_1.parse(actualSchema);
}
exports.gql = gql;
//# sourceMappingURL=gql.js.map