import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreatorGuard } from './guard/creator.guard';
import { Creator } from '@/decorators/role.decorator';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { CreateCourseDto } from './dto/create.course';

@Creator()
@Controller('course')
@UseGuards(CreatorGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  createCourse(@CurrentUser() user: JWTPayload, @Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(user, dto);
  }
}
