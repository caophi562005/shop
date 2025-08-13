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
  userIds: z.array(z.number()).min(1),
  content: z.string().min(1),
})

export type MarkAsReadParamsType = z.infer<typeof MarkAsReadParamsSchema>
export type DeleteNotificationParamsType = z.infer<typeof DeleteNotificationParamsSchema>
export type BroadcastNotificationType = z.infer<typeof BroadcastNotificationSchema>
