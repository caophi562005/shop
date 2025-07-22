import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.PasswordDoNotMatch',
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    totpCode: z.string().optional(),
    code: z.string().optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Error.JustOneRequired'
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['code'],
      })
    }
  })

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([
    TypeOfVerificationCode.REGISTER,
    TypeOfVerificationCode.FORGOT_PASSWORD,
    TypeOfVerificationCode.LOGIN,
    TypeOfVerificationCode.DISABLE_2FA,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
})

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
})

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  expiresAt: z.date(),
  deviceId: z.number(),
  createdAt: z.date(),
})

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string(),
})

export const RefreshTokenResSchema = LoginResSchema

export const LogoutBodySchema = RefreshTokenBodySchema

export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Error.PasswordDoNotMatch',
        path: ['confirmNewPassword'],
      })
    }
  })

export const TwoFactorSetupSchema = z.object({
  secret: z.string(),
  uri: z.string(),
})

export const DisableTwoFactorBodySchema = z
  .object({
    totpCode: z.string().optional(),
    code: z.string().optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Error.JustOneRequired'
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['code'],
      })
    }
  })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type DeviceType = z.infer<typeof DeviceSchema>
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
export type TwoFactorSetupType = z.infer<typeof TwoFactorSetupSchema>
export type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>
