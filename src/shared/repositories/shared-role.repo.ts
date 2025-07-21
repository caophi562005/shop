import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { RoleType } from '../models/shared-role.model'
import { Role } from '@prisma/client'
import { RoleName } from '../constants/role.constant'

@Injectable()
export class SharedRoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private clientRoleId: number | null = null
  private adminRoleId: number | null = null

  private async getRole(roleName: string) {
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM "Role" WHERE "name" = ${roleName} AND "deletedAt" IS NULL
      `.then((res: Role[]) => {
      if (res.length === 0) {
        throw new Error('Role not found')
      }
      return res[0]
    })

    return role.id
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.getRole(RoleName.CLIENT)
    this.clientRoleId = role
    return role
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(RoleName.ADMIN)
    this.adminRoleId = role
    return role
  }
}
