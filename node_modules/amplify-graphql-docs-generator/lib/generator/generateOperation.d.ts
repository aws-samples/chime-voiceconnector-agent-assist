import { GraphQLField, GraphQLSchema } from 'graphql';
import { GQLTemplateGenericOp, GQLDocsGenOptions } from './types';
export default function generateOperation(operation: GraphQLField<any, any>, schema: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): GQLTemplateGenericOp;
