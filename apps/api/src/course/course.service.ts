import { JWTPayload } from '@/auth/types/jwt-payload';
import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create.course';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async createCourse(user: JWTPayload, dto: CreateCourseDto) {
    const category = await this.createCategoryIfNotExist(dto.category);

    return await this.prisma.course.create({
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: category.id,
        tags: dto.tags,
        banner: dto.banner,
        creatorId: user.id,
      },
    });
  }

  private async createCategoryIfNotExist(name: string) {
    let category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: { name },
      });
    }

    return category;
  }
}
