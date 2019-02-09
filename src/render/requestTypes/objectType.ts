import {
  getNamedType,
  GraphQLField,
  GraphQLInterfaceType,
  GraphQLObjectType,
  isEnumType,
  isInterfaceType,
  isScalarType,
} from 'graphql'
import { argumentComment, fieldComment, typeComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'
import { renderTyping } from '../common/renderTyping'
import { requestTypeName } from './requestTypeName'

const toArgsString = (field: GraphQLField<any, any, any>) => {
  return `{${field.args.map(a => `${argumentComment(a)}${a.name}${renderTyping(a.type, false, true)}`).join(',')}}`
}

export const objectType = (type: GraphQLObjectType | GraphQLInterfaceType, ctx: RenderContext) => {
  const fieldStrings = Object.keys(type.getFields()).map(fieldName => {
    const field = type.getFields()[fieldName]

    const types: string[] = []
    const resolvedType = getNamedType(field.type)
    const resolvable = !(isEnumType(resolvedType) || isScalarType(resolvedType))
    const argsPresent = field.args.length > 0
    const argsString = toArgsString(field)
    const argsOptional = !argsString.match(/[^?]:/)

    if (argsPresent) {
      if (resolvable) {
        types.push(`[${argsString},${requestTypeName(resolvedType)}]`)
      } else {
        types.push(`[${argsString}]`)
      }
    }

    if (!argsPresent || argsOptional) {
      if (resolvable) {
        types.push(`${requestTypeName(resolvedType)}`)
      } else {
        types.push('boolean|number')
      }
    }

    return `${fieldComment(field)}${field.name}?:${types.join('|')}`
  })

  if (isInterfaceType(type) && ctx.schema) {
    ctx.schema
      .getPossibleTypes(type)
      .map(t => `on_${t.name}?:${requestTypeName(t)}`)
      .forEach(s => fieldStrings.push(s))
  }

  fieldStrings.push('__typename?:boolean|number')
  fieldStrings.push('__scalar?:boolean|number')

  ctx.addCodeBlock(`${typeComment(type)}export interface ${requestTypeName(type)}{${fieldStrings.join(',')}}`)
}
