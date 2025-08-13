import { z } from 'zod'

export const NotificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  content: z.string(),
  readAt: z.date().nullish(),
  createdAt: z.date(),
})

export const CreateNotificationSchema = NotificationSchema.pick({
  userId: true,
  content: true,
})

export type NotificationType = z.infer<typeof NotificationSchema>
export type CreateNotificationType = z.infer<typeof CreateNotificationSchema>
