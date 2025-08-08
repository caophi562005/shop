import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { ServerOptions, Server, Socket } from 'socket.io'
import envConfig from 'src/shared/envConfig'
import { generateRoomUserId } from 'src/shared/helpers'
import { TokenService } from 'src/shared/services/token.service'
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
    const server = super.createIOServer(3003, {
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
    return server
  }

  emitToUser(userId: number, event: string, data: unknown) {
    if (!this.server) return
    const room = generateRoomUserId(userId)
    this.server.to(room).emit(event, data)
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
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)

      ;(socket.data as Record<string, unknown>).userId = userId

      await socket.join(generateRoomUserId(userId))
      next()
    } catch (error) {
      next(error)
    }
  }
}
