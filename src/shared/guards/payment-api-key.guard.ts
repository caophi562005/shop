import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import envConfig from '../envConfig'

@Injectable()
export class PaymentAPIKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const paymentApiKey = request.headers['authorization']?.split(' ')[1]
    if (paymentApiKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException()
    }

    return true
  }
}
