import { getNamedType, GraphQLInterfaceType, GraphQLObjectType, isEnumType, isInterfaceType, isScalarType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { ArgMap, Field, FieldMap, Type } from './renderTypeMap'

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  const typeObj: Type & { fields: FieldMap } = {
    name: type.name,
    fields: Object.keys(type.getFields()).reduce<FieldMap>((r, f) => {
      const field = type.getFields()[f]
      const namedType = getNamedType(field.type)
      const fieldObj: Field = { type: namedType.name }
      r[f] = fieldObj

      if (field.args.length > 0) {
        fieldObj.args = field.args.reduce<ArgMap>((r, a) => {
          r[a.name] = a.type.toString()
          return r
        }, {})
      }

      return r
    }, {}),
  }

  if (isInterfaceType(type) && ctx.schema) {
    ctx.schema.getPossibleTypes(type).map(t => {
      typeObj.fields[`on_${t.name}`] = { type: t.name }
    })
  }

  typeObj.fields.__typename = { type: 'String' }

  const scalar = Object.keys(type.getFields())
    .map(f => type.getFields()[f])
    .filter(f => isScalarType(getNamedType(f.type)) || isEnumType(getNamedType(f.type)))
    .map(f => f.name)

  if (scalar.length > 0) typeObj.scalar = scalar

  return typeObj
}
