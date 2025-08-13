import { createZodDto } from 'nestjs-zod'
import {
  BroadcastNotificationSchema,
  DeleteNotificationParamsSchema,
  MarkAsReadParamsSchema,
} from './notification.model'
import { CreateNotificationSchema } from 'src/shared/models/shared-notification.model'

export class CreateNotificationDTO extends createZodDto(CreateNotificationSchema) {}

export class MarkAsReadParamsDTO extends createZodDto(MarkAsReadParamsSchema) {}

export class DeleteNotificationParamsDTO extends createZodDto(DeleteNotificationParamsSchema) {}

export class BroadcastNotificationDTO extends createZodDto(BroadcastNotificationSchema) {}
