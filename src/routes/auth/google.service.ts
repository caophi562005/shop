import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { AuthRepository } from './auth.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { AuthService } from './auth.service'
import { google } from 'googleapis'
import envConfig from 'src/shared/envConfig'
import { GoogleAuthStateType } from './auth.model'
import { GoogleUserInfoException } from './auth.error'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly authService: AuthService,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    const scope = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']

    // Chuyển object sang base64 để an toàn bỏ lên URL
    const stateString = Buffer.from(
      JSON.stringify({
        userAgent,
        ip,
      }),
    ).toString('base64')

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    })

    return {
      url,
    }
  }

  async googleCallback({ code, state }: { code: string; state: string }) {
    try {
      let userAgent = 'Unknown'
      let ip = 'Unknown'

      // Lấy state từ URL
      try {
        if (state) {
          const clientInfo = JSON.parse(Buffer.from(state, 'base64').toString()) as GoogleAuthStateType
          userAgent = clientInfo.userAgent
          ip = clientInfo.ip
        }
      } catch (error) {
        console.error('Error parsing state : ', error)
      }

      // Dùng code để lấy token
      const { tokens } = await this.oauth2Client.getToken(code)
      this.oauth2Client.setCredentials(tokens)

      // Lấy thông tin user
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      })

      const { data } = await oauth2.userinfo.get()
      if (!data.email) {
        throw GoogleUserInfoException
      }

      let user = await this.authRepository.findUniqueUserIncludeRole({
        email: data.email,
      })

      // Nếu không có tức là người mới , tiến hành đăng ký
      if (!user) {
        const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
        const randomPassword = uuidv4()
        const hashedPassword = await this.hashingService.hash(randomPassword)
        user = await this.authRepository.createUserIncludeRole({
          email: data.email,
          name: data.name ?? 'User',
          phoneNumber: '',
          password: hashedPassword,
          roleId: clientRoleId,
          avatar: data.picture ?? null,
        })
      }

      const device = await this.authRepository.createDevice({
        userId: user.id,
        userAgent,
        ip,
        isActive: true,
        lastActive: new Date(),
      })

      const authToken = this.authService.generateTokens({
        userId: user.id,
        roleId: user.roleId,
        roleName: user.role.name,
        deviceId: device.id,
      })
      return authToken
    } catch (error) {
      console.error('Error in googleCallback : ', error)
      throw error
    }
  }
}
