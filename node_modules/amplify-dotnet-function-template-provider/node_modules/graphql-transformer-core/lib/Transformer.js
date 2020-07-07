"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var errors_1 = require("./errors");
/**
 * A GraphQLTransformer takes a context object, processes it, and
 * returns a new context. The transformer is responsible for returning
 * a context that fully describes the infrastructure requirements
 * for its stage of the transformation.
 */
var Transformer = /** @class */ (function () {
    /**
     * Each transformer has a name.
     *
     * Each transformer defines a set of directives that it knows how to translate.
     */
    function Transformer(name, document) {
        var doc = typeof document === 'string' ? graphql_1.parse(document) : document;
        this.name = name;
        var directives = doc.definitions.filter(function (d) { return d.kind === graphql_1.Kind.DIRECTIVE_DEFINITION; });
        var extraDefs = doc.definitions.filter(function (d) { return d.kind !== graphql_1.Kind.DIRECTIVE_DEFINITION; });
        if (directives.length !== 1) {
            throw new errors_1.InvalidTransformerError('Transformers must specify exactly one directive definition.');
        }
        this.directive = directives[0];
        // Transformers can define extra shapes that can be used by the directive
        // and validated. TODO: Validation.
        this.typeDefinitions = extraDefs;
    }
    return Transformer;
}());
exports.Transformer = Transformer;
//# sourceMappingURL=Transformer.js.map