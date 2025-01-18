import { JWTPayload } from '@/auth/types/jwt-payload';
import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create.module';
import { AuthorityCheckerService } from '@/common/authority-checker.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(
    private authorityChecker: AuthorityCheckerService,
    private prisma: PrismaService,
  ) {}

  async createModule(user: JWTPayload, dto: CreateModuleDto, courseId: string) {
    //check if the course exists and the user is the creator of that course
    await this.authorityChecker.checkAuthorityOverCourse(courseId, user.id);

    //calculate the order number of the module
    const lastOrderNumber = await this.prisma.module.count({
      where: {
        courseId,
      },
    });

    //create the module
    return await this.prisma.module.create({
      data: {
        name: dto.name,
        order: lastOrderNumber,
        courseId,
      },
    });
  }
}
