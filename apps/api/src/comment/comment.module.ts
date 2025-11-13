import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { ModuleModule } from '@/module/module.module';

@Module({
  imports: [ModuleModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
