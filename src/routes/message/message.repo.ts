import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateMessageType } from './message.model'

@Injectable()
export class MessageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getConversations(userId: number) {
    const messages = await this.prismaService.message.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    })

    const conversations: {
      user: { id: number; name: string }
      lastMessage: {
        id: number
        fromUserId: number
        toUserId: number
        content: string
        createdAt: Date
      }
    }[] = []
    const partnerIds = new Set<number>()

    for (const message of messages) {
      const partner = message.fromUserId === userId ? message.toUser : message.fromUser
      if (!partnerIds.has(partner.id)) {
        conversations.push({
          user: partner,
          lastMessage: {
            id: message.id,
            fromUserId: message.fromUserId,
            toUserId: message.toUserId,
            content: message.content,
            createdAt: message.createdAt,
          },
        })
        partnerIds.add(partner.id)
      }
    }

    return conversations
  }

  getMessages({ fromUserId, toUserId }: { fromUserId: number; toUserId: number }) {
    return this.prismaService.message.findMany({
      where: {
        OR: [
          // Trường hợp 1: Tin nhắn từ người dùng hiện tại gửi cho người kia.
          {
            fromUserId: fromUserId,
            toUserId: toUserId,
          },
          // Trường hợp 2: Tin nhắn từ người kia gửi cho người dùng hiện tại.
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      },
      include: {
        fromUser: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  create({ message, fromUserId }: { message: CreateMessageType; fromUserId: number }) {
    return this.prismaService.message.create({
      data: {
        content: message.content,
        fromUserId,
        toUserId: message.toUserId,
      },
      include: {
        fromUser: {
          select: { id: true, name: true },
        },
      },
    })
  }
}
