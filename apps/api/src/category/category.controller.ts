import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Public } from '@/decorators/public.decorator';
import { CreateCategoryDto } from './dto/create.category';
import { Roles } from '@/decorators/role.decorator';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  async getCategories(
    @Query('limit') limit: number = 10,
    @Query('cursor') cursor: number = 0,
    @Query('search') search: string = '',
  ) {
    return this.categoryService.getCategories(limit, cursor, search);
  }

  @Roles('CREATOR')
  @Post()
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.categoryService.createCategory(data);
  }
}
