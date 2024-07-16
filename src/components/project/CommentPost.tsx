import { component$ } from '@builder.io/qwik';
import { Avatar } from '../ui/avatar/avatar';
import { Button } from '../ui/button/button';
import type { Comment } from '~/server/services/comment/entities/comment';
import { formatDateToTimePassed } from '~/utils/formatDate';

type Props = {
  comment: Comment;
};

export const CommentPost = component$<Props>(({ comment }) => {
  return (
    <div class="flex items-start gap-4">
      <Avatar.Root class="w-10 h-10 border">
        <Avatar.Image src="/placeholder-user.jpg" />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar.Root>
      <div>
        <div class="flex items-center gap-2 text-sm">
          <div class="font-medium">
            {comment.user.name + ' ' + comment.user.lastName}
          </div>

          <div class="text-muted-foreground">
            {formatDateToTimePassed(comment.createdAt)} atrás
          </div>
        </div>
        <div class="mt-2 text-sm">{comment.content}</div>
        <div class="mt-2">
          <Button look="ghost" size="sm">
            Responder
          </Button>
        </div>
      </div>
    </div>
  );
});
