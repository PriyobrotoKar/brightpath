import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreatorGuard } from './guard/creator.guard';
import { Creator } from '@/decorators/role.decorator';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { CreateCourseDto } from './dto/create.course';
import { CreatePricingDto } from './dto/create.pricing';

@Creator()
@Controller('course')
@UseGuards(CreatorGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  createCourse(@CurrentUser() user: JWTPayload, @Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(user, dto);
  }

  @Post(':id/pricing')
  createPricing(
    @CurrentUser() user: JWTPayload,
    @Param('id') id: string,
    @Body() dto: CreatePricingDto,
  ) {
    return this.courseService.createPricing(user, id, dto);
  }
}
