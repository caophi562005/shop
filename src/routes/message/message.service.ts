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

  // Lấy danh sách client có tin nhắn gần đây (cho staff dashboard)
  async getRecentClientChats() {
    return this.messageRepository.getRecentClientChats()
  }

  // Lấy lịch sử chat giữa client và support
  async getClientSupportHistory(clientUserId: number) {
    return this.messageRepository.getClientSupportMessages(clientUserId)
  }
}
