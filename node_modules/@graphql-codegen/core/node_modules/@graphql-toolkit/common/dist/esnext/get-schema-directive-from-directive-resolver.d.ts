import { DirectiveResolverFn, SchemaDirectiveVisitor } from '@kamilkisiela/graphql-tools';
export declare function getSchemaDirectiveFromDirectiveResolver<TSource, TContext, TArgs>(directiveResolver: DirectiveResolverFn<TSource, TContext>): typeof SchemaDirectiveVisitor;
