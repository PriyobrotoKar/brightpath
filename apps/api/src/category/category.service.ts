import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create.category';
import { createCategoryIfNotExist } from '@/common/category';
import { PrismaClient } from '@brightpath/db';

@Injectable()
export class CategoryService {
  private readonly prisma: PrismaClient;
  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.client;
  }
  async getCategories(limit: number, cursor: number, search: string) {
    const categories = await this.prisma.category.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: {
        id: cursor || 1,
      },
      where: {
        name: {
          contains: search,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (categories.length === 0) {
      return {
        categories: [],
        metadata: {
          hasNextPage: false,
          lastCursor: cursor,
        },
      };
    }

    const lastCategory = categories[categories.length - 1];
    cursor = lastCategory.id;

    const hasNextPage =
      (await this.prisma.category.count({
        where: {
          id: {
            gt: cursor,
          },
        },
      })) > 0;

    return {
      categories,
      metadata: {
        hasNextPage,
        lastCursor: cursor,
      },
    };
  }

  async createCategory(data: CreateCategoryDto) {
    console.log(data);
    return createCategoryIfNotExist(data.name, this.prisma);
  }
}
