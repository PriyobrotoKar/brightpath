import { JWTPayload } from '@/auth/types/jwt-payload';
import { AuthorityCheckerService } from '@/common/authority-checker.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClient } from '@brightpath/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnrollmentService {
  private readonly prisma: PrismaClient;

  constructor(
    private readonly authorityChecker: AuthorityCheckerService,
    private prismaService: PrismaService,
  ) {
    this.prisma = this.prismaService.client;
  }

  async getEnrollments(
    courseSlug: string,
    page: number,
    limit: number,
    sort: string,
    order: 'asc' | 'desc',
    search: string,
    user: JWTPayload,
  ) {
    const course = await this.authorityChecker.checkAuthorityOverCourse(
      courseSlug,
      user,
    );

    const [videoCount, documentCount] = await Promise.all([
      this.prisma.video.count({
        where: {
          module: {
            courseId: course.id,
          },
        },
      }),
      this.prisma.document.count({
        where: {
          module: {
            courseId: course.id,
          },
        },
      }),
    ]);

    const totalLessonCount = videoCount + documentCount;

    console.log(limit, page, sort, order);

    const enrolledUsers = await this.prisma.enrollment.findMany({
      where: {
        courseId: course.id,
      },
      take: limit,
      skip: page * limit,
      orderBy: {
        [sort]: order,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            _count: {
              select: {
                docsRead: true,
                videosWatched: true,
              },
            },
          },
        },
      },
    });

    const enrolledUsersWithProgress = enrolledUsers.map((enrollment) => {
      const watchedLessons =
        enrollment.user._count.docsRead + enrollment.user._count.videosWatched;
      const progress = watchedLessons / totalLessonCount;

      delete enrollment.user._count;

      return {
        ...enrollment,
        user: {
          ...enrollment.user,
          progress,
        },
      };
    });

    return enrolledUsersWithProgress;
  }
}
