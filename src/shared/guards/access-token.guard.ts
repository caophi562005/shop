import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { AccessTokenPayload } from '../types/jwt.type'
import { TokenService } from '../services/token.service'
import { REQUEST_ROLE_PERMISSION, REQUEST_USER_KEY } from '../constants/auth.constant'
import { RoleWithPermissionsType } from '../models/shared-role.model'
import { keyBy } from 'lodash'
import { parse } from 'cookie'

type Permission = RoleWithPermissionsType['permissions'][number]
type CachedRole = RoleWithPermissionsType & {
  permissions: {
    [key: string]: Permission
  }
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private extractAccessToken(request: any): string {
    const cookieHeader = request.headers.cookie
    if (cookieHeader) {
      const cookies = parse(cookieHeader)
      if (cookies.accessToken) {
        return cookies.accessToken
      }
    }

    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessToken(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch (error) {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
    const roleId = decodedAccessToken.roleId
    const path = request.route.path
    const method = request.method
    const cacheKey = `role:${roleId}`

    // Thử lấy từ cache
    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey)
    if (!cachedRole) {
      const role = await this.prismaService.role
        .findFirstOrThrow({
          where: {
            id: roleId,
            isActive: true,
            deletedAt: null,
          },
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        })
        .catch(() => {
          throw new ForbiddenException()
        })

      const permissionObject = keyBy(
        role.permissions,
        (permission) => `${permission.path}:${permission.method}`,
      ) as CachedRole['permissions']

      cachedRole = { ...role, permissions: permissionObject }

      await this.cacheManager.set(cacheKey, cachedRole, 1000 * 60 * 60)
      request[REQUEST_ROLE_PERMISSION] = role
    }

    // Kiểm tra quyền truy cập
    const canAccess = cachedRole.permissions[`${path}:${method}`]
    if (!canAccess) {
      throw new ForbiddenException()
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // Lấy accessToken và check có hợp lệ
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Kiểm tra xem user có quyền truy cập
    await this.validateUserPermission(decodedAccessToken, request)

    return true
  }
}
