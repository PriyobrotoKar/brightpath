import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@brightpath/ui/components/avatar';
import { Button } from '@brightpath/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@brightpath/ui/components/sheet';
import { useParams } from 'next/navigation';
import { IconFilter, IconSortAscending } from '@tabler/icons-react';
import type { CommentWithReplies } from '@/api/services/comment';
import CommentReplyProvider from '@/components/Discussion/CommentReplyProvider';
import Comments from '@/components/Discussion/Comments';
import CommentInput from '@/components/Discussion/CommentInput';
import { mediaUrl } from '@/lib/utils';

interface LessonCommentsProps {
  initialComments: CommentWithReplies[];
}

export default function LessonComments({
  initialComments,
}: LessonCommentsProps): React.JSX.Element {
  return (
    <div className="bg-card rounded-lg border px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base-medium">Discussions</h2>
          <span className="bg-primary text-primary-foreground flex h-5 items-center justify-center rounded-sm px-2 text-xs">
            {initialComments.length}
          </span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              disabled={initialComments.length === 0}
              size="sm"
              variant="link"
            >
              See All
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col sm:max-w-lg">
            <SheetHeader>
              <SheetTitle asChild>
                <div className="flex items-center gap-2">
                  <h2>Discussions</h2>
                  <span className="bg-primary text-primary-foreground flex h-5 items-center justify-center rounded-sm px-2 text-xs">
                    {initialComments.length}
                  </span>
                </div>
              </SheetTitle>
              <SheetDescription className="sr-only">
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
            </SheetHeader>

            <Discussions comments={initialComments} />
          </SheetContent>
        </Sheet>
      </div>

      {initialComments.length > 0 && (
        <div className="space-y-2 py-2">
          {initialComments.slice(0, 2).map((comment) => {
            return (
              <div className="flex items-center gap-2" key={comment.id}>
                <Avatar className="size-6">
                  <AvatarImage
                    src={
                      mediaUrl(comment.commentBy.profilePicture) ?? undefined
                    }
                  />
                  <AvatarFallback className="text-xs">
                    {comment.commentBy.name?.at(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs">{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DiscussionsProps {
  comments: CommentWithReplies[];
}

function Discussions({ comments }: DiscussionsProps): React.JSX.Element {
  const { lessonId, moduleId } = useParams<{
    lessonId?: string;
    moduleId?: string;
  }>();

  if (!lessonId || !moduleId) {
    throw new Error('LessonId and ModuleId are required');
  }

  return (
    <CommentReplyProvider>
      <div className="space-y-4 p-4">
        <CommentInput lesson={lessonId} module={moduleId} />
        <CommentFilters comments={comments} />
      </div>
      <div className="space-y-4 overflow-y-auto px-4">
        <Comments comments={comments} />
      </div>
    </CommentReplyProvider>
  );
}

interface CommentFiltersProps {
  comments: CommentWithReplies[];
}

function CommentFilters({ comments }: CommentFiltersProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-base-medium">{comments.length} New Comments</h3>

      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <IconFilter /> Filter
        </Button>
        <Button size="sm" variant="outline">
          <IconSortAscending /> Sort
        </Button>
      </div>
    </div>
  );
}
