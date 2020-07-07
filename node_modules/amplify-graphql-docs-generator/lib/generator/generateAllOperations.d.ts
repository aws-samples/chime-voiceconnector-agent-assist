import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { GQLTemplateOp, GQLTemplateFragment, GQLDocsGenOptions } from './types';
export declare function generateQueries(queries: GraphQLObjectType, schema: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): Array<GQLTemplateOp> | undefined;
export declare function generateMutations(mutations: GraphQLObjectType, schema: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): Array<any>;
export declare function generateSubscriptions(subscriptions: GraphQLObjectType, schema: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): Array<any>;
export declare function collectExternalFragments(operations?: GQLTemplateOp[]): GQLTemplateFragment[];
