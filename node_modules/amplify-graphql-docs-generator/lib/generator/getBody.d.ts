import { GraphQLField, GraphQLSchema } from 'graphql';
import { GQLTemplateOpBody, GQLDocsGenOptions } from './types';
export default function getBody(op: GraphQLField<any, any>, schema: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): GQLTemplateOpBody;
