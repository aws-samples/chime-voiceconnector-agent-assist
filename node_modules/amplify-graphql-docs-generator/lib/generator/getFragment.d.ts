import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { GQLTemplateField, GQLTemplateFragment, GQLDocsGenOptions } from './types';
export default function getFragment(typeObj: GraphQLObjectType, schema: GraphQLSchema, depth: number, filterFields?: Array<GQLTemplateField>, name?: string, external?: boolean, options?: GQLDocsGenOptions): GQLTemplateFragment;
