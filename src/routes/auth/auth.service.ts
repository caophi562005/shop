import { HttpException, Injectable } from '@nestjs/common'
import { AuthRepository } from './auth.repo'
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  UnauthorizedAccessException,
} from './auth.error'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import envConfig from 'src/shared/envConfig'
import ms, { StringValue } from 'ms'
import { EmailService } from 'src/shared/services/email.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import { TokenService } from 'src/shared/services/token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async validateVerificationCode({ email, type }: { email: string; type: TypeOfVerificationCodeType }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_type: {
        email,
        type,
      },
    })

    if (!verificationCode) {
      throw InvalidOTPException
    }

    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }

    return verificationCode
  }

  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
      })

      const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_type: {
            email: body.email,
            type: TypeOfVerificationCode.REGISTER,
          },
        }),
      ])

      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // Kiểm tra email có tồn tại hay chưa
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })

    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }

    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailAlreadyExistsException
    }

    // Tạo mã OTP
    const code = generateOTP()
    await this.authRepository.createVerificationCode({
      ...body,
      code,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    })

    // Gửi OTP
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code,
    })

    if (error) {
      throw FailedToSendOTPException
    }

    return {
      message: 'Gửi mã OTP thành công',
      path: 'code',
    }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    // Kiểm tra user có tồn tại không
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }

    // Tạo mới device
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
      isActive: true,
      lastActive: new Date(),
    })

    // Tạo mới accessToken và refreshToken
    const tokens = await this.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      deviceId: device.id,
    })

    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])

    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // Kiểm tra token có hợp lê không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // Kiểm tra có tồn tại trong DB không
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshTokenIncludeUserRole(refreshToken)
      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException
      }

      // Lấy dữ liệu
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDB

      // Cập nhập device
      const updateDevice$ = this.authRepository.updateDevice(deviceId, { ip, userAgent })

      // Xoá tồn tại trong DB
      const deleteRefreshToken$ = this.authRepository.deleteRefreshToken({ token: refreshToken })

      // Tạo mới accessToken và refreshToken
      const tokens$ = this.generateTokens({ userId, deviceId, roleId, roleName })

      const [tokens] = await Promise.all([tokens$, updateDevice$, deleteRefreshToken$])
      return tokens
    } catch (error) {
      if (error instanceof HttpException) throw error
      throw UnauthorizedAccessException
    }
  }

  async logout(refreshToken: string) {
    try {
      // Kiểm tra token có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken)

      // Xoá token trong DB
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({ token: refreshToken })

      // Cập nhập device đã logout

      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      })

      return {
        message: 'Logout Successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }

      throw UnauthorizedAccessException
    }
  }
}
