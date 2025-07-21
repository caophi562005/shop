import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { EmailService } from './services/email.service'
import { SharedRoleRepository } from './repositories/shared-role.repo'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  SharedUserRepository,
  SharedRoleRepository,
]

@Global()
@Module({
  providers: [...sharedServices],
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
