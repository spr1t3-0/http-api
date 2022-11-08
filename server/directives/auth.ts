import { GraphQLSchema, GraphQLFieldResolver, defaultFieldResolver } from 'graphql';
import gql from 'graphql-tag';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import type { Context } from '../context';

export const typeDefs = gql`
  directive @auth(appIds: [AuthRole!]!) on OBJECT | FIELD_DEFINITION

  enum AuthRole {
    TRIPBOT_DISCORD
    MAIN_WEBSITE
  }
`;

export function transform(schema: GraphQLSchema) {
  const typeDirectiveArgumentMaps = {};

  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const directive = getDirective(schema, type, 'auth')?.[0];
      if (directive) Object.assign(typeDirectiveArgumentMaps, { [type.name]: directive });
      return undefined;
    },

    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      const directive = getDirective(schema, fieldConfig, 'auth')?.[0]
        ?? typeDirectiveArgumentMaps[typeName as keyof typeof typeDirectiveArgumentMaps];
      if (directive?.appIds) {
        const resolve = fieldConfig.resolve ?? defaultFieldResolver;
        Object.assign(fieldConfig, {
          resolve: function fieldResolver(source, params, ctx, info) {
            if (!directive.appIds.includes(ctx.appId)) throw new Error('Not authorized');
            return resolve(source, params, ctx, info);
          } as GraphQLFieldResolver<unknown, Context>,
        });
        return fieldConfig;
      }
      return undefined;
    },
  });
}
