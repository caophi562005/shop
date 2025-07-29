import { number, z } from 'zod'

export const MessageSchema = z.object({
  id: number(),
  fromUserId: z.number(),
  toUserId: z.number(),
  content: z.string(),
  createdAt: z.date(),
})

export const GetMessagesParamsSchema = z
  .object({
    toUserId: z.coerce.number(),
  })
  .strict()

export const CreateMessageSchema = MessageSchema.pick({
  toUserId: true,
  content: true,
})

export type MessageType = z.infer<typeof MessageSchema>
export type GetMessagesParamsType = z.infer<typeof GetMessagesParamsSchema>
export type CreateMessageType = z.infer<typeof CreateMessageSchema>
