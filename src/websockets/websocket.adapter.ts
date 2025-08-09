import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { ServerOptions, Server, Socket } from 'socket.io'
import envConfig from 'src/shared/envConfig'
import { generateRoomUserId, generateStaffRoom } from 'src/shared/helpers'
import { TokenService } from 'src/shared/services/token.service'
import { RoleName } from 'src/shared/constants/role.constant'
import { parse } from 'cookie'

export class WebsocketAdapter extends IoAdapter {
  private readonly tokenService: TokenService
  private adapterConstructor: ReturnType<typeof createAdapter>
  private server: Server

  constructor(app: INestApplicationContext) {
    super(app)
    this.tokenService = app.get(TokenService)
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: envConfig.REDIS_URL })
    const subClient = pubClient.duplicate()

    pubClient.on('error', (err) => console.error('Lỗi Redis PubClient:', err))
    subClient.on('error', (err) => console.error('Lỗi Redis SubClient:', err))

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: true,
        credentials: true,
      },
    }) as unknown as Server

    this.server = server

    server.of(/.*/).use((socket, next) => {
      void this.authMiddleware(socket, next)
    })

    // Sử dụng Redis adapter nếu có
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor)
    }

    return server
  }

  // Gửi tin nhắn đến user cụ thể
  emitToUser(userId: number, event: string, data: unknown) {
    if (!this.server) return
    const room = generateRoomUserId(userId)
    this.server.to(room).emit(event, data)
  }

  // Gửi tin nhắn đến tất cả staff
  emitToStaff(event: string, data: unknown) {
    if (!this.server) return
    this.server.to(generateStaffRoom()).emit(event, data)
  }

  // Gửi tin nhắn đến client và thông báo staff
  emitSupportMessage(clientUserId: number, message: any, fromStaffId?: number) {
    if (!this.server) return

    const clientRoom = generateRoomUserId(clientUserId)

    // Gửi đến client với tên "Support"
    const clientMessage = {
      ...message,
      fromUser: { id: 0, name: 'Support' },
    }
    this.server.to(clientRoom).emit('newMessage', clientMessage)

    // Thông báo cho staff (nếu có)
    if (fromStaffId) {
      this.server.to(generateStaffRoom()).emit('staff-replied', {
        staffId: fromStaffId,
        clientUserId,
        message: message.content,
      })
    }
  }

  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    const { authorization, cookie: cookieHeader } = socket.handshake.headers

    let accessToken: string | undefined

    if (authorization?.startsWith('Bearer ')) {
      accessToken = authorization.split(' ')[1]
    } else if (typeof cookieHeader === 'string') {
      const cookies = parse(cookieHeader)
      accessToken = cookies['accessToken']
    }

    if (!accessToken) {
      return next(new Error('Thiếu Authentication'))
    }

    try {
      const { userId, roleName } = await this.tokenService.verifyAccessToken(accessToken)

      ;(socket.data as Record<string, unknown>).userId = userId
      ;(socket.data as Record<string, unknown>).roleName = roleName

      // Tự động join room dựa trên role
      if (roleName === RoleName.CLIENT) {
        // Client join vào room của chính họ
        await socket.join(generateRoomUserId(userId))
      } else if (roleName === RoleName.SELLER || roleName === RoleName.ADMIN) {
        // Staff join vào room staff chung
        await socket.join(generateStaffRoom())
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
