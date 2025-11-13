import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create.comment';
import { CurrentUser } from '@/decorators/user.decorator';
import type { JWTPayload } from '@/auth/types/jwt-payload';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':commentId/like')
  likeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.commentService.likeComment(commentId, currentUser);
  }

  @Post(':commentId/unlike')
  unlikeComment(
    @Param('commentId') commentId: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.commentService.unlikeComment(commentId, currentUser);
  }

  @Post(':moduleId/:lessonId')
  createComment(
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
    @Body() commentData: CreateCommentDto,
    @CurrentUser() currentUser: JWTPayload,
    @Query('parentId') parentId?: string,
  ) {
    return this.commentService.createComment(
      commentData,
      moduleId,
      lessonId,
      currentUser,
      parentId,
    );
  }

  @Get(':moduleId/:lessonId')
  getAllComments(
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.commentService.getAllComments(moduleId, lessonId, currentUser);
  }
}
