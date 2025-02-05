import { JWTPayload } from '@/auth/types/jwt-payload';
import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create.module';
import { AuthorityCheckerService } from '@/common/authority-checker.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ModuleFilterDto } from './dto/filter.module';
import { CreateDocumentDto } from './dto/create.document';

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

  async getModules(
    user: JWTPayload,
    courseId: string,
    {
      filters: { status, createdAt },
      sort,
    }: {
      filters: Pick<ModuleFilterDto, 'status' | 'createdAt'>;
      sort: ModuleFilterDto['sort'];
    },
  ) {
    //check if the course exists and the user is the creator of that course
    await this.authorityChecker.checkAuthorityOverCourse(courseId, user.id);

    let orderBy: Record<string, 'asc' | 'desc'> = { order: 'asc' };

    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.slice(1) : sort;
      orderBy = {
        [field]: isDesc ? 'desc' : 'asc',
      };
    }

    //get the modules of the course
    return await this.prisma.module.findMany({
      where: {
        courseId,
        status,
        createdAt: {
          gte: createdAt ? new Date(createdAt) : undefined,
        },
      },
      orderBy,
    });
  }

  async createDocument(
    user: JWTPayload,
    dto: CreateDocumentDto,
    moduleId: string,
  ) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user.id);

    //create the document
    return await this.prisma.document.create({
      data: {
        name: dto.name,
        content: dto.content ?? '',
        duration: 0,
        moduleId,
      },
    });
  }

  async getLessons(user: JWTPayload, moduleId: string) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user.id);

    //get the documents of the module
    const documents = this.prisma.document.findMany({
      where: {
        moduleId,
      },
    });

    //get the videos of the module
    const videos = this.prisma.video.findMany({
      where: {
        moduleId,
      },
    });

    //get the assignments of the module
    const assignments = this.prisma.assignment.findMany({
      where: {
        moduleId,
      },
    });

    const lessonPromises = [documents, videos, assignments];

    const lessons = (await Promise.all(lessonPromises)).flat();

    return lessons;
  }
}
