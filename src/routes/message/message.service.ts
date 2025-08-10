import { Injectable } from '@nestjs/common'
import { MessageRepository } from './message.repo'
import { CreateMessageType } from './message.model'

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  listMessages(fromUserId: number, toUserId: number) {
    return this.messageRepository.getMessages({ fromUserId, toUserId })
  }

  createMessage(message: CreateMessageType, fromUserId: number) {
    return this.messageRepository.create({ message, fromUserId })
  }

  listConversations(userId: number) {
    return this.messageRepository.getConversations(userId)
  }
}
