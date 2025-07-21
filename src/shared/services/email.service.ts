import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../envConfig'
import fs from 'fs'
import path from 'path'

const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), { encoding: 'utf-8' })

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(body: { email: string; code: string }) {
    return this.resend.emails.send({
      from: 'Phi <no-reply@hacmieu.xyz>',
      to: [body.email],
      subject: 'Mã OTP',
      html: otpTemplate.replaceAll('{{code}}', body.code),
    })
  }
}
