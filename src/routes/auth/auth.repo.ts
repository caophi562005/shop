import { Injectable } from '@nestjs/common';
import { UserType } from 'src/shared/model/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createUser(
    user: Pick<
      UserType,
      'email' | 'name' | 'phoneNumber' | 'password' | 'roleId'
    >,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }
}
