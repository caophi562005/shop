import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repo';
import { RegisterBodyType } from './auth.model';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(body: RegisterBodyType) {
    try {
    } catch (error) {}
  }
}
