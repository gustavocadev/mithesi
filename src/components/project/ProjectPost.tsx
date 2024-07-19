import {
  $,
  component$,
  useComputed$,
  useContext,
  useSignal,
  type PropsOf,
} from '@builder.io/qwik';
import { Card } from '../ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { Button } from '~/components/ui/button/button';
import { LuMessageCircle, LuShare2, LuBookDown } from '@qwikest/icons/lucide';
import { TbHeart, TbHeartFilled } from '@qwikest/icons/tablericons';

import { formatDate } from '~/utils/formatDate';
import { cn } from '@qwik-ui/utils';
import {
  globalAction$,
  server$,
  useLocation,
  z,
  zod$,
} from '@builder.io/qwik-city';
import {
  createUserLike,
  deleteUserLike,
} from '~/server/services/user-like/user-like';
import type { User } from 'lucia';
import type { Project } from '~/server/services/project/entities/project';
import { ProjectContext } from '~/context/project/ProjectContext';
import { Avatar } from '../ui/avatar/avatar';
import { Textarea } from '../ui/textarea/textarea';
import { CommentPost } from './CommentPost';
import { getCommentsByProjectId } from '~/server/services/comment/comment';
import { CommentContext } from '~/context/comment/CommentContext';
import { toast } from 'qwik-sonner';
import { useUserAuth } from '~/routes/(authed)/layout';

export const useLikeProjectAction = globalAction$(
  async (values, { redirect, sharedMap }) => {
    try {
      const user = sharedMap.get('user') as User;
      if (!user) throw redirect(303, '/login');

      if (values.intent === 'createLike') {
        await createUserLike({
          projectId: values.id,
          userId: user.id,
        });
      }

      if (values.intent === 'deleteLike') {
        await deleteUserLike(values.id);
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  },
  zod$({
    intent: z.enum(['createLike', 'deleteLike']),
    id: z.string(),
  })
);

export const getCommentsByProject = server$(function (projectId: string) {
  return getCommentsByProjectId(projectId);
});

export type ProjectPostProps = {
  project: Project;
} & PropsOf<'div'>;

export const ProjectPost = component$<ProjectPostProps>(
  ({ project, ...props }) => {
    const likeProjectAction = useLikeProjectAction();
    const { projectSelected, projects } = useContext(ProjectContext);
    const { comments, createUserComment } = useContext(CommentContext);
    const loc = useLocation();
    const content = useSignal('');
    const projectId = loc.params.id;
    const userAuth = useUserAuth();

    const handleLikePost = $(async (e: PointerEvent) => {
      // to prevent redirecting to the project page
      // !important inside here we need to use the `project object` otherwise the value won't be updated
      e.stopPropagation();

      // to update the project object with the new value only if we are in the project page
      const isLiked = project.isLiked;

      const likePost = () =>
        likeProjectAction.submit({
          intent: isLiked ? 'deleteLike' : 'createLike',
          id: project.id,
        });

      // optimistic update for the project page
      if (projectId) {
        projectSelected.value = {
          ...project,
          isLiked: !project.isLiked,
          likes: project.isLiked ? project.likes - 1 : project.likes + 1,
        };

        await likePost();
        return;
      }

      // optimistic update for the project list
      projects.value = projects.value.map((projectElement) => {
        if (projectElement.id === project.id) {
          return {
            ...projectElement,
            isLiked: !projectElement.isLiked,
            likes: projectElement.isLiked
              ? projectElement.likes - 1
              : projectElement.likes + 1,
          };
        }
        return projectElement;
      });

      const likeProjectActionResponse = await likePost();
      // if the action fails, we need to revert the optimistic update
      // this case ins't much important because nobody will die if the like button doesn't work
      // but eventually we need to handle this case
      console.log(likeProjectActionResponse);
    });

    const isValidComment = useComputed$(() => {
      return content.value.length <= 500 && content.value.length >= 1;
    });

    return (
      <Card.Root
        class={cn(
          'rounded-none border-b-2 border-gray-100 border',
          props.class
        )}
        {...props}
      >
        <Card.Header>
          <div class="space-y-2">
            <Card.Title class="text-3xl font-bold">{project.title}</Card.Title>

            <Card.Description>{project.description}</Card.Description>

            <a
              href={project.urlPdf}
              target="_blank"
              class="inline-block"
              onClick$={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                look="outline"
                class="flex gap-1 items-center font-semibold"
              >
                Ver PDF <LuBookDown class="size-5" />
              </Button>
            </a>
          </div>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <div>Publicado el {formatDate(project.createdAt)}</div>
            <div>Por {project.user.name + ' ' + project.user.lastName}</div>
          </div>
          {project.urlImg && (
            <figure>
              <img
                src={project.urlImg}
                alt="Imagen del artículo"
                width={800}
                height={200}
                class="w-full rounded-md object-cover h-64"
              />
            </figure>
          )}
          <div class="flex items-center">
            {project.status === 'pending' && (
              <Badge look="outline" class="bg-yellow-500 text-white">
                Pendiente
              </Badge>
            )}
            {project.status === 'approved' && (
              <Badge look="outline" class="bg-green-500 text-white">
                Aprobado
              </Badge>
            )}
            {project.status === 'rejected' && (
              <Badge look="outline" class="bg-red-500 text-white">
                Reprobado
              </Badge>
            )}
          </div>
          <div class="flex items-center justify-start w-full gap-1">
            <Button
              look="ghost"
              size="icon"
              class="rounded-full hover:bg-muted gap-1 w-16"
              type="submit"
              onClick$={(e) => handleLikePost(e)}
            >
              {project.isLiked && project.user.id === userAuth.value.id ? (
                <TbHeartFilled color="red" font-size={22} />
              ) : (
                <TbHeart font-size={22} />
              )}
              <span
                style={{
                  color:
                    project.isLiked && project.user.id === userAuth.value.id
                      ? 'red'
                      : '',
                }}
              >
                {project.likes}
              </span>
              <span class="sr-only">Like</span>
            </Button>

            <Button
              look="ghost"
              size="icon"
              class="rounded-full hover:bg-muted"
              onClick$={(e) => {
                // to prevent redirecting to the project page
                e.stopPropagation();
                alert('Feature not implemented yet');
              }}
            >
              <LuMessageCircle class="size-5" />
              <span class="sr-only">Comment</span>
            </Button>
            <Button
              look="ghost"
              size="icon"
              class="rounded-full hover:bg-muted"
              onClick$={(e) => {
                // to prevent redirecting to the project page
                e.stopPropagation();
                alert('Feature not implemented yet');
              }}
            >
              <LuShare2 class="size-5" />
              <span class="sr-only">Share</span>
            </Button>
          </div>
          {projectId && (
            <div class="mt-8 border-t pt-4">
              <div class="flex items-start gap-4">
                <Avatar.Root class="w-10 h-10 border">
                  <Avatar.Image src="/placeholder-user.jpg" />
                  <Avatar.Fallback>JD</Avatar.Fallback>
                </Avatar.Root>
                <form
                  class="flex-1"
                  onSubmit$={() => {
                    if (!isValidComment.value) {
                      toast.error(
                        'El comentario debe tener entre 1 y 500 caracteres'
                      );
                      return;
                    }
                    // send the comment to the websocket server
                    createUserComment({
                      content: content.value,
                      projectId,
                      userId: project.user.id,
                    });
                    content.value = '';
                  }}
                  preventdefault:submit
                >
                  <Textarea
                    placeholder="Escribe tu comentario..."
                    class="mb-2 resize-none"
                    name="content"
                    bind:value={content}
                  />
                  <div class="flex items-center justify-between">
                    <Button
                      look="secondary"
                      size="sm"
                      type="submit"
                      disabled={!isValidComment.value}
                    >
                      Enviar
                    </Button>
                    <div
                      class={[
                        { 'text-sm text-red-500': content.value.length > 500 },
                        'text-sm text-muted-foreground',
                      ]}
                    >
                      {content.value.length} de 500 caracteres
                    </div>
                  </div>
                </form>
              </div>
              <div class="mt-4 grid gap-4">
                {comments.value.map((comment) => (
                  <CommentPost key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      </Card.Root>
    );
  }
);
