import { createZodDto } from 'nestjs-zod'
import { CreateNotificationSchema, MarkAsReadParamsSchema, NotificationSchema } from './notification.model'

export class NotificationDTO extends createZodDto(NotificationSchema) {}

export class CreateNotificationDTO extends createZodDto(CreateNotificationSchema) {}

export class MarkAsReadParamsDTO extends createZodDto(MarkAsReadParamsSchema) {}
