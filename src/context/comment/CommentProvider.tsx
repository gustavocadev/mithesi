import {
  $,
  component$,
  Slot,
  useContext,
  useContextProvider,
  useSignal,
  useStore,
  useTask$,
} from '@builder.io/qwik';
import { CommentContext } from './CommentContext';
import { SocketContext } from '../socket/SocketContext';
import type { Comment } from '~/server/services/comment/entities/comment';
import { CreateCommentDto } from '../../server/services/comment/dtos/comment';

export const CommentProvider = component$(() => {
  const { socket } = useContext(SocketContext);
  const comments = useSignal<Comment[]>([]);

  useTask$(({ track, cleanup }) => {
    track(() => socket.value);
    if (!socket.value) return;

    const onMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'get-comments') {
        comments.value = data.payload;
      }
    };

    socket.value.addEventListener('message', onMessage);

    cleanup(() => {
      socket.value?.removeEventListener('message', onMessage);
    });
  });

  const getCommentsByProjectId = $((projectId: string): void => {
    socket.value?.send(
      JSON.stringify({
        type: 'get-comments',
        payload: { projectId },
      })
    );
  });

  const createUserComment = $(
    ({ content, projectId, userId }: CreateCommentDto): void => {
      socket.value?.send(
        JSON.stringify({
          type: 'create-comment',
          payload: { content, projectId, userId },
        })
      );
    }
  );

  useContextProvider(
    CommentContext,
    useStore({ getCommentsByProjectId, comments, createUserComment })
  );
  return <Slot />;
});
