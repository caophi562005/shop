import { z } from 'zod'

export const MarkAsReadParamsSchema = z
  .object({
    id: z.coerce.number(),
  })
  .strict()

export const DeleteNotificationParamsSchema = z
  .object({
    id: z.coerce.number(),
  })
  .strict()

export const BroadcastNotificationSchema = z.object({
  userIds: z.array(z.number()).min(1).optional(),
  content: z.string().min(1),
  title: z.string().min(1).optional(),
  broadcastToAll: z.boolean().default(false),
})

export const BroadcastToAllNotificationSchema = z.object({
  content: z.string().min(1),
  title: z.string().min(1).optional(),
})

export type MarkAsReadParamsType = z.infer<typeof MarkAsReadParamsSchema>
export type DeleteNotificationParamsType = z.infer<typeof DeleteNotificationParamsSchema>
export type BroadcastNotificationType = z.infer<typeof BroadcastNotificationSchema>
export type BroadcastToAllNotificationType = z.infer<typeof BroadcastToAllNotificationSchema>
