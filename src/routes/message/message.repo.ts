import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateMessageType } from './message.model'

@Injectable()
export class MessageRepository {
  constructor(private readonly prismaService: PrismaService) {}

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

  // Lấy danh sách client có tin nhắn trong 24h gần đây
  async getRecentClientChats() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentMessages = await this.prismaService.$queryRaw`
      SELECT DISTINCT ON (m.fromUserId) 
        m.fromUserId as clientId,
        u.name as clientName,
        m.content as lastMessage,
        m.createdAt as lastMessageTime,
        (SELECT COUNT(*) FROM messages m2 WHERE m2.fromUserId = m.fromUserId AND m2.createdAt > ${twentyFourHoursAgo}) as messageCount
      FROM messages m
      JOIN users u ON u.id = m.fromUserId
      WHERE m.createdAt > ${twentyFourHoursAgo}
        AND m.toUserId = 0  -- Giả sử 0 là support ID
      ORDER BY m.fromUserId, m.createdAt DESC
    `

    return recentMessages
  }

  async getClientSupportMessages(clientUserId: number) {
    return this.prismaService.message.findMany({
      where: {
        OR: [
          // Tin nhắn từ client gửi cho support
          {
            fromUserId: clientUserId,
            toUserId: 0, // Support ID
          },
          // Tin nhắn từ support (bất kỳ staff nào) gửi cho client
          {
            fromUserId: { not: clientUserId },
            toUserId: clientUserId,
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
}
