import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AccessTokenGuard } from './access-token.guard'
import { PaymentAPIKeyGuard } from './payment-api-key.guard'
import { AuthType, ConditionGuard } from '../constants/auth.constant'
import { AUTH_TYPES_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly paymentAPIKeyGuard: PaymentAPIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.PaymentAPIKey]: this.paymentAPIKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  private getAuthTypeValue(context: ExecutionContext): AuthTypeDecoratorPayload {
    return (
      this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? {
        authTypes: [AuthType.Bearer],
        option: { condition: ConditionGuard.And },
      }
    )
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context)
    const guards = authTypeValue.authTypes.map((type) => this.authTypeGuardMap[type])

    return authTypeValue.option.condition === ConditionGuard.And
      ? this.handleAndCondition(guards, context)
      : this.handleOrCondition(guards, context)
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
    let lastError: any = null

    // Duyệt qua từng guard, nếu có 1 cái pass thì return true
    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) {
          return true
        }
      } catch (error) {
        lastError = error
      }
    }

    if (lastError instanceof HttpException) {
      throw lastError
    }

    throw new UnauthorizedException()
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
    // Duyệt qua hết các guard , nếu có 1 cái failed thì return false
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException()
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }

        throw new UnauthorizedException()
      }
    }
    return true
  }
}
