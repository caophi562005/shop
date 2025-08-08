import { createZodDto } from 'nestjs-zod'
import {
  DisableTwoFactorBodySchema,
  ForgotPasswordBodySchema,
  GoogleAuthResSchema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOTPBodySchema,
  TwoFactorSetupSchema,
} from './auth.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}

export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}

export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}

export class GoogleAuthResDTO extends createZodDto(GoogleAuthResSchema) {}

export class TwoFactorSetupDTO extends createZodDto(TwoFactorSetupSchema) {}

export class DisableTwoFactorBodyDTO extends createZodDto(DisableTwoFactorBodySchema) {}

export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}
