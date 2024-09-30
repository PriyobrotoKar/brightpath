import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { JWTPayload } from './user.types';
import { UpdateUserDto } from './dto/update.user';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getSelf({ id }: JWTPayload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  async updateSelf(user: JWTPayload, dto: UpdateUserDto) {
    return `User: ${user.email} has been updated with data ${JSON.stringify(dto)}`;
  }
}
