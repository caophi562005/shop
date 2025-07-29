import { createZodDto } from 'nestjs-zod'
import { CreateMessageSchema, GetMessagesParamsSchema, MessageSchema } from './message.model'

export class MessageDTO extends createZodDto(MessageSchema) {}

export class GetMessagesParamsDTO extends createZodDto(GetMessagesParamsSchema) {}

export class CreateMessageDTO extends createZodDto(CreateMessageSchema) {}
