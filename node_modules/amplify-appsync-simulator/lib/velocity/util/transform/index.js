"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamodb_filter_1 = require("./dynamodb-filter");
exports.transformUtils = {
    toDynamoDBFilterExpression: function (filter) {
        var result = dynamodb_filter_1.generateFilterExpression(filter.toJSON());
        return JSON.stringify({
            expression: result.expressions.join(' ').trim(),
            expressionNames: result.expressionNames,
            expressionValues: result.expressionValues,
        });
    },
};
//# sourceMappingURL=index.js.map