"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dynamo_db_1 = require("./dynamo-db");
var none_1 = require("./none");
var lambda_1 = require("./lambda");
var DATA_LOADER_MAP = new Map();
function getDataLoader(sourceType) {
    if (DATA_LOADER_MAP.has(sourceType)) {
        return DATA_LOADER_MAP.get(sourceType);
    }
    throw new Error("Unsupported data source type " + sourceType);
}
exports.getDataLoader = getDataLoader;
function addDataLoader(sourceType, loader) {
    if (DATA_LOADER_MAP.has(sourceType)) {
        throw new Error("Data loader for source " + sourceType + " is already registered");
    }
    DATA_LOADER_MAP.set(sourceType, loader);
}
exports.addDataLoader = addDataLoader;
function removeDataLoader(sourceType) {
    if (DATA_LOADER_MAP.has(sourceType)) {
        var loader = DATA_LOADER_MAP.get(sourceType);
        return DATA_LOADER_MAP.delete(sourceType);
        return loader;
    }
}
exports.removeDataLoader = removeDataLoader;
// add known data sources
addDataLoader('AMAZON_DYNAMODB', dynamo_db_1.DynamoDBDataLoader);
addDataLoader('NONE', none_1.NoneDataLoader);
addDataLoader('AWS_LAMBDA', lambda_1.LambdaDataLoader);
//# sourceMappingURL=index.js.map