import { GraphQLField, GraphQLSchema } from 'graphql';
import { GQLTemplateField, GQLDocsGenOptions } from './types';
export default function getFields(field: GraphQLField<any, any>, schema: GraphQLSchema, depth: number, options: GQLDocsGenOptions): GQLTemplateField;
