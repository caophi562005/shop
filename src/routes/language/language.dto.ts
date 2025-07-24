import { createZodDto } from 'nestjs-zod'
import {
  CreateLanguageBodySchema,
  GetLanguageDetailSchema,
  GetLanguageParamsSchema,
  GetLanguageResSchema,
  UpdateLanguageBodySchema,
} from './language.model'

export class GetLanguageResDTO extends createZodDto(GetLanguageResSchema) {}

export class GetLanguageDetailResDTO extends createZodDto(GetLanguageDetailSchema) {}

export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}

export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}
