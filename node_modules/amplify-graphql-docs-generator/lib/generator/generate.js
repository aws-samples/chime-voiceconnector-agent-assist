"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateAllOperations_1 = require("./generateAllOperations");
function generate(schemaDoc, maxDepth, options) {
    try {
        const queryTypes = schemaDoc.getQueryType();
        const mutationType = schemaDoc.getMutationType();
        const subscriptionType = schemaDoc.getSubscriptionType();
        const queries = generateAllOperations_1.generateQueries(queryTypes, schemaDoc, maxDepth, options) || [];
        const mutations = generateAllOperations_1.generateMutations(mutationType, schemaDoc, maxDepth, options) || [];
        const subscriptions = generateAllOperations_1.generateSubscriptions(subscriptionType, schemaDoc, maxDepth, options) || [];
        const fragments = options.useExternalFragmentForS3Object ? generateAllOperations_1.collectExternalFragments([...queries, ...mutations, ...subscriptions]) : [];
        return { queries, mutations, subscriptions, fragments };
    }
    catch (e) {
        throw new Error('GraphQL schema file should contain a valid GraphQL introspection query result');
    }
}
exports.default = generate;
//# sourceMappingURL=generate.js.map