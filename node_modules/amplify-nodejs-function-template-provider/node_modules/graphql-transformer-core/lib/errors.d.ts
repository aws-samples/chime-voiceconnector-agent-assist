import { GraphQLError } from 'graphql';
export declare class InvalidTransformerError extends Error {
    constructor(message: string);
}
export declare class SchemaValidationError extends Error {
    constructor(errors: Readonly<GraphQLError[]>);
}
/**
 * Thrown by transformers when a user provided schema breaks some contract expected by the transformer.
 *
 * A contract issue is one that is not incorrect GraphQL but that violates
 * the semantics or contract required by the business logic of a transformer.
 * For example, the @versioned directive requires the provided "versionField" to be
 * of an Int or BigInt type.
 */
export declare class TransformerContractError extends Error {
    constructor(message: string);
}
/**
 * Thrown by the sanity checker when a user is trying to make a migration that is known to not work.
 */
export declare class InvalidMigrationError extends Error {
    fix: string;
    cause: string;
    constructor(message: string, cause: string, fix: string);
}
export declare class InvalidDirectiveError extends Error {
    constructor(message: string);
}
export declare class UnknownDirectiveError extends Error {
    constructor(message: string);
}
