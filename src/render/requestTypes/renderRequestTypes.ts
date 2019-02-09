import { GraphQLSchema, isInputObjectType, isInterfaceType, isObjectType, isUnionType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { inputObjectType } from './inputObjectType'
import { objectType } from './objectType'
import { unionType } from './unionType'

export const renderRequestTypes = (schema: GraphQLSchema, ctx: RenderContext) => {
  for (const name in schema.getTypeMap()) {
    const type = schema.getTypeMap()[name]

    if (isObjectType(type) || isInterfaceType(type)) objectType(type, ctx)
    if (isInputObjectType(type)) inputObjectType(type, ctx)
    if (isUnionType(type)) unionType(type, ctx)
  }
}
