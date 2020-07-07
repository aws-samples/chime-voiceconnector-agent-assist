import { GraphQLSchema } from 'graphql';
import { GQLDocsGenOptions, GQLAllOperations } from './types';
export default function generate(schemaDoc: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): GQLAllOperations;
