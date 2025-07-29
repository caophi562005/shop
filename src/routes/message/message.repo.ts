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
}
