import { DocumentNode } from 'graphql/language';
import { ValidationRule } from 'graphql/validation';
/**
 * This set includes all validation rules defined by the GraphQL spec.
 *
 * The order of the rules in this list has been adjusted to lead to the
 * most clear output when encountering multiple validation errors.
 */
export declare const specifiedRules: Readonly<ValidationRule[]>;
export declare const EXTRA_DIRECTIVES_DOCUMENT: DocumentNode;
export declare const validateModelSchema: (doc: DocumentNode) => readonly import("graphql").GraphQLError[];
