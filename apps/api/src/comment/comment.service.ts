import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create.comment';
import { JWTPayload } from '@/auth/types/jwt-payload';
import { ModuleService } from '@/module/module.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, PrismaClient } from '@brightpath/db';

@Injectable()
export class CommentService {
  private readonly prisma: PrismaClient;
  constructor(
    private moduleService: ModuleService,
    private prismaService: PrismaService,
  ) {
    this.prisma = this.prismaService.client;
  }

  async createComment(
    dto: CreateCommentDto,
    moduleId: string,
    lessonId: string,
    currentUser: JWTPayload,
    parentId?: string,
  ) {
    const lesson = await this.moduleService.getLessonById(
      currentUser,
      moduleId,
      lessonId,
    );

    let data: Prisma.CommentUncheckedCreateInput = {
      content: dto.content,
      commentByUserId: currentUser.id,
    };

    if (lesson.type === 'video') {
      data = {
        ...data,
        videoId: lesson.id,
      };
    } else if (lesson.type === 'document') {
      data = {
        ...data,
        documentId: lesson.id,
      };
    } else {
      throw new BadRequestException('Invalid lesson type');
    }

    if (parentId) {
      const comment = await this.prisma.comment.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      data = {
        ...data,
        replyToId: comment.id,
      };
    }

    const comment = await this.prisma.comment.create({
      data,
    });

    return comment;
  }

  async getAllComments(
    moduleId: string,
    lessonId: string,
    currentUser: JWTPayload,
  ) {
    const lesson = await this.moduleService.getLessonById(
      currentUser,
      moduleId,
      lessonId,
    );

    let query: Prisma.CommentWhereInput = {
      replyToId: null,
    };

    if (lesson.type === 'video') {
      query = {
        ...query,
        videoId: lesson.id,
      };
    } else if (lesson.type === 'document') {
      query = {
        ...query,
        documentId: lesson.id,
      };
    } else {
      throw new BadRequestException('Invalid lesson type');
    }

    const comments = await this.prisma.comment.findMany({
      where: query,
      include: {
        _count: {
          select: {
            likedBy: true,
          },
        },
        likedBy: {
          where: {
            id: currentUser.id,
          },
        },
        replies: {
          take: 10,
          include: {
            _count: {
              select: {
                likedBy: true,
              },
            },
            replies: {
              take: 0,
            },
            likedBy: {
              where: {
                id: currentUser.id,
              },
            },
            commentBy: {
              omit: {
                bio: true,
                phone: true,
                links: true,
                isOnboardingFinished: true,
              },
            },
          },
        },
        commentBy: {
          omit: {
            bio: true,
            phone: true,
            links: true,
            isOnboardingFinished: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments.map((comment) => {
      const isLikedByMe = comment.likedBy.length > 0;
      delete comment.likedBy;

      const replies = comment.replies.map((reply) => {
        const isLikedByMe = reply.likedBy.length > 0;
        delete reply.likedBy;

        return {
          ...reply,
          isLikedByMe,
        };
      });

      return {
        ...comment,
        replies,
        isLikedByMe,
      };
    });
  }

  async likeComment(commentId: string, currentUser: JWTPayload) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likedComment = await this.prisma.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        likedBy: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    return likedComment;
  }

  async unlikeComment(commentId: string, currentUser: JWTPayload) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likedComment = await this.prisma.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        likedBy: {
          disconnect: {
            id: currentUser.id,
          },
        },
      },
    });

    return likedComment;
  }
}
