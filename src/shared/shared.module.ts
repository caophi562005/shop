import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { EmailService } from './services/email.service'
import { SharedRoleRepository } from './repositories/shared-role.repo'
import { AccessTokenGuard } from './guards/access-token.guard'
import { PaymentAPIKeyGuard } from './guards/payment-api-key.guard'
import { AuthenticationGuard } from './guards/authentication.guard'
import { TwoFactorService } from './services/twoFactorService.service'

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  TwoFactorService,
  SharedUserRepository,
  SharedRoleRepository,
]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    PaymentAPIKeyGuard,
    {
      provide: 'APP_GUARD',
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
