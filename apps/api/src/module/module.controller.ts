import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { CreateModuleDto } from './dto/create.module';
import { ModuleFilterDto } from './dto/filter.module';
import { CreateDocumentDto } from './dto/create.document';
import { CreateVideoDto } from './dto/create.video';
import { CreateAssignmentDto } from './dto/create.assignment';
import { UpdateDocumentDto } from './dto/update.document';
import { UpdateAssignmentDto } from './dto/update.assignment';
import { VideoProgressStatus } from '@brightpath/db';
import { Public } from '@/decorators/public.decorator';
import { ApiKeyGuard } from '@/auth/guard/api-key.guard';
import { UpdateVideoDto } from './dto/update.video';
import { Roles } from '@/decorators/role.decorator';

@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Roles('CREATOR')
  @Post(':courseId')
  async createModule(
    @CurrentUser() user: JWTPayload,
    @Body() dto: CreateModuleDto,
    @Param('courseId') courseId: string,
  ) {
    return this.moduleService.createModule(user, dto, courseId);
  }

  @Get(':courseSlug')
  async getModules(
    @Param('courseSlug') courseSlug: string,
    @Query() queryParams: ModuleFilterDto,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.getModules(user, courseSlug, {
      filters: { status: queryParams.status, createdAt: queryParams.createdAt },
      sort: queryParams.sort,
    });
  }

  @Roles('CREATOR')
  @Post(':moduleId/lesson/document')
  async createDocument(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: JWTPayload,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.moduleService.createDocument(user, dto, moduleId);
  }

  @Roles('CREATOR')
  @Patch(':moduleId/lesson/document/:id')
  async updateDocument(
    @Param('moduleId') moduleId: string,
    @Param('id') documentId: string,
    @CurrentUser() user: JWTPayload,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.moduleService.updateDocument(user, dto, moduleId, documentId);
  }

  @Get(':moduleId/lesson/video/:id')
  async getVideoLesson(
    @Param('moduleId') moduleId: string,
    @Param('id') videoId: string,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.getVideoLesson(user, moduleId, videoId);
  }

  @Roles('CREATOR')
  @Post(':moduleId/lesson/video')
  async createVideo(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: JWTPayload,
    @Body() dto: CreateVideoDto,
  ) {
    return this.moduleService.createVideo(user, dto, moduleId);
  }

  @Roles('CREATOR')
  @Post(':moduleId/lesson/assignment')
  async createAssignment(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: JWTPayload,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.moduleService.createAssignment(user, dto, moduleId);
  }

  @Roles('CREATOR')
  @Patch(':moduleId/lesson/assignment/:id')
  async updateAssignment(
    @Param('moduleId') moduleId: string,
    @Param('id') assignmentId: string,
    @CurrentUser() user: JWTPayload,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.moduleService.updateAssignment(
      user,
      dto,
      moduleId,
      assignmentId,
    );
  }

  @Public()
  @UseGuards(ApiKeyGuard)
  @Patch('/video/status/:key')
  async updateVideoStatus(
    @Param('key') key: string,
    @Query('status') status: VideoProgressStatus,
  ) {
    return this.moduleService.updateVideoStatus(key, status);
  }

  @Roles('CREATOR')
  @Patch(':moduleId/video/:videoId')
  async updateVideo(
    @Param('moduleId') moduleId: string,
    @Param('videoId') videoId: string,
    @Body() dto: UpdateVideoDto,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.updateVideo(user, dto, moduleId, videoId);
  }

  @Get(':moduleId/lesson')
  async getLessons(
    @Param('moduleId') moduleId: string,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.getLessons(user, moduleId);
  }

  @Get(':moduleId/lesson/:id')
  async getLessonById(
    @Param('moduleId') moduleId: string,
    @Param('id') lessonId: string,
    @CurrentUser() user: JWTPayload,
  ) {
    return this.moduleService.getLessonById(user, moduleId, lessonId);
  }
}
