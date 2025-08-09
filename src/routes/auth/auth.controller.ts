import { Body, Controller, Get, Ip, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  GoogleAuthResDTO,
  LoginBodyDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupDTO,
} from './auth.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { GoogleService } from './google.service'
import { CookieOptions, Request, Response } from 'express'
import envConfig from 'src/shared/envConfig'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { parse } from 'cookie'

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async login(
    @Body() body: LoginBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login({
      ...body,
      userAgent,
      ip,
    })

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 giờ
    })
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    })

    return { message: 'Message.LoginSuccessfully' }
  }

  @Post('refresh-token')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async refreshToken(
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = parse(req.headers.cookie || '').refreshToken
    if (!refreshToken) {
      throw new UnauthorizedException('Error.MissingRefreshToken')
    }
    const tokens = await this.authService.refreshToken({
      refreshToken,
      userAgent,
      ip,
    })

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 giờ
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    })

    return { message: 'Message.GetRefreshTokenSuccessfully' }
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)

    const refreshToken = parse(req.headers.cookie || '').refreshToken
    if (refreshToken) {
      return this.authService.logout(refreshToken)
    }
    return { message: 'Message.LogoutSuccessfully' }
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GoogleAuthResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({
      userAgent,
      ip,
    })
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({
        code,
        state,
      })

      if (data) {
        return res.redirect(
          `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?error=${message}`)
    }
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupDTO)
  setupTwoFactorAuth(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.setupTwoFactorAuth(userId)
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDTO)
  disableTwoFactorAuth(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.disableTwoFactorAuth({
      ...body,
      userId,
    })
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }
}
