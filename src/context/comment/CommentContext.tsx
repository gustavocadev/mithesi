import { createContextId, type QRL, type Signal } from '@builder.io/qwik';
import type { CreateCommentDto } from '~/server/services/comment/dtos/comment';
import type { Comment } from '~/server/services/comment/entities/comment';

type CommentState = {
  comments: Signal<Comment[]>;
  getCommentsByProjectId: QRL<(projectId: string) => void>;
  createUserComment: QRL<(comment: CreateCommentDto) => void>;
};

export const CommentContext = createContextId<CommentState>('comment.context');
