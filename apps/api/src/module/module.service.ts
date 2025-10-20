import { JWTPayload } from '@/auth/types/jwt-payload';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateModuleDto } from './dto/create.module';
import { AuthorityCheckerService } from '@/common/authority-checker.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ModuleFilterDto } from './dto/filter.module';
import { CreateDocumentDto } from './dto/create.document';
import { PrismaClient, VideoProgressStatus } from '@brightpath/db';
import { CreateVideoDto } from './dto/create.video';
import { CreateAssignmentDto } from './dto/create.assignment';
import { UpdateDocumentDto } from './dto/update.document';
import { UpdateAssignmentDto } from './dto/update.assignment';
import { UpdateVideoDto } from './dto/update.video';
import { sortLessons } from '@/common/utils';

@Injectable()
export class ModuleService {
  private readonly prisma: PrismaClient;
  constructor(
    private authorityChecker: AuthorityCheckerService,
    private prismaService: PrismaService,
  ) {
    this.prisma = this.prismaService.client;
  }

  async createModule(
    user: JWTPayload,
    dto: CreateModuleDto,
    courseSlug: string,
  ) {
    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    //calculate the order number of the module
    const lastOrderNumber = await this.prisma.module.count({
      where: {
        courseId: course.id,
      },
    });

    //create the module
    return await this.prisma.module.create({
      data: {
        name: dto.name,
        order: lastOrderNumber,
        courseId: course.id,
      },
    });
  }

  async getModules(
    user: JWTPayload,
    courseSlug: string,
    {
      filters: { status, createdAt },
      sort,
    }: {
      filters: Pick<ModuleFilterDto, 'status' | 'createdAt'>;
      sort: ModuleFilterDto['sort'];
    },
  ) {
    //check if the course exists and the user is the creator of that course
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    let orderBy: Record<string, 'asc' | 'desc'> = { order: 'asc' };

    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.slice(1) : sort;
      orderBy = {
        [field]: isDesc ? 'desc' : 'asc',
      };
    }

    // This filter maybe implemented later in future
    // if (user.role === 'STUDENT') {
    //   status = 'PUBLISHED';
    // }

    //get the modules of the course
    const modules = await this.prisma.module.findMany({
      where: {
        courseId: course.id,
        status,
        createdAt: {
          gte: createdAt ? new Date(createdAt) : undefined,
        },
      },
      orderBy,
      include: {
        Video: {
          select: {
            id: true,
            duration: true,
            completedBy: {
              where: {
                id: user.id,
              },
            },
          },
        },
        Document: {
          select: {
            id: true,
            duration: true,
            completedBy: {
              where: {
                id: user.id,
              },
            },
          },
        },
      },
    });

    // Calculate the total duration of each module
    const modulesWithDuration = modules.map(
      ({ Video, Document, ...module }) => {
        const lessons = [...Video, ...Document];
        const totalDuration = lessons.reduce(
          (total, lesson) => total + lesson.duration,
          0,
        );
        const completedLessonsCount = lessons.reduce(
          (total, lesson) => total + Number(lesson.completedBy.length > 0),
          0,
        );

        return {
          ...module,
          totalDuration,
          completedLessonsCount,
          lastWatchedLesson: lessons[0],
        };
      },
    );

    if (user.role === 'STUDENT') {
      const lastWatchedLessons = modules.map((module) => module.Video[0]);
    }

    return modulesWithDuration;
  }

  async getLessonById(user: JWTPayload, moduleId: string, lessonId: string) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    const [document, video, assignment] = await Promise.all([
      this.prisma.document.findUnique({ where: { id: lessonId } }),
      this.prisma.video.findUnique({ where: { id: lessonId } }),
      this.prisma.assignment.findUnique({ where: { id: lessonId } }),
    ]);

    const lesson =
      (document && { ...document, type: 'document' }) ||
      (video && { ...video, type: 'video' }) ||
      (assignment && { ...assignment, type: 'assignment' });

    if (!lesson) throw new NotFoundException(`Lesson:${lessonId} not found`);

    return lesson;
  }

  async getVideoLesson(user: JWTPayload, moduleId: string, videoId: string) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //get the video lesson
    const video = await this.prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!video) throw new NotFoundException(`Video:${videoId} not found`);

    return video;
  }

  async createDocument(
    user: JWTPayload,
    dto: CreateDocumentDto,
    moduleId: string,
  ) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //update the number of lessons in the module
    await this.prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        lessonCount: {
          increment: 1,
        },
      },
    });

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

  async updateDocument(
    user: JWTPayload,
    dto: UpdateDocumentDto,
    moduleId: string,
    documentId: string,
  ) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //update the document
    return await this.prisma.document.update({
      where: {
        id: documentId,
      },
      data: dto,
    });
  }

  async createVideo(user: JWTPayload, dto: CreateVideoDto, moduleId: string) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //update the number of lessons in the module
    await this.prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        lessonCount: {
          increment: 1,
        },
      },
    });

    //create the video
    return await this.prisma.video.create({
      data: {
        name: dto.name,
        duration: 0,
        source: dto.source,
        moduleId,
      },
    });
  }

  async createAssignment(
    user: JWTPayload,
    dto: CreateAssignmentDto,
    moduleId: string,
  ) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //update the number of lessons in the module
    await this.prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        lessonCount: {
          increment: 1,
        },
      },
    });

    //create the assignment
    return await this.prisma.assignment.create({
      data: {
        name: dto.name,
        submissionType: dto.submissionType,
        moduleId,
      },
    });
  }

  async updateAssignment(
    user: JWTPayload,
    dto: UpdateAssignmentDto,
    moduleId: string,
    assignmentId: string,
  ) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //validate id the due date is in the past
    if (dto.dueAt && new Date(dto.dueAt) < new Date()) {
      throw new BadRequestException('Due date cannot be in the past');
    }

    //update the assignment
    return await this.prisma.assignment.update({
      where: {
        id: assignmentId,
      },
      data: dto,
    });
  }

  async updateVideo(
    user: JWTPayload,
    dto: UpdateVideoDto,
    moduleId: string,
    videoId: string,
  ) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //update the video
    return await this.prisma.video.update({
      where: {
        id: videoId,
      },
      data: dto,
    });
  }

  async updateVideoStatus(key: string, status: VideoProgressStatus) {
    // check if the status is valid
    if (!Object.values(VideoProgressStatus).includes(status)) {
      throw new BadRequestException(
        'Status is not valid. It should be one of the following: NOT_STARTED, IN_QUEUE, PROCESSING, COMPLETED',
      );
    }

    const videoId = key.split('.')[0];

    //check if the video exists
    const video = await this.prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!video) throw new NotFoundException(`Video:${videoId} not found`);

    //if the status is completed, set the source of video
    if (status === VideoProgressStatus.COMPLETED) {
      return await this.prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          status: VideoProgressStatus.COMPLETED,
          source: `hls/${key}/index.m3u8`,
        },
      });
    }

    //update the video status
    return await this.prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        status,
      },
    });
  }

  async getLessons(user: JWTPayload, moduleId: string) {
    //check if the module exists and the user is the creator of that module
    await this.authorityChecker.checkAuthorityOverModule(moduleId, user);

    //get the documents of the module
    const documents = this.prisma.document.findMany({
      where: {
        moduleId,
      },
      select: {
        id: true,
        name: true,
        duration: true,
        createdAt: true,
      },
    });

    //get the videos of the module
    const videos = this.prisma.video.findMany({
      where: {
        moduleId,
      },
      select: {
        id: true,
        name: true,
        duration: true,
        createdAt: true,
      },
    });

    //get the assignments of the module
    const assignments = this.prisma.assignment.findMany({
      where: {
        moduleId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const lessonPromises = await Promise.all([documents, videos, assignments]);

    return sortLessons(lessonPromises);
  }
}
