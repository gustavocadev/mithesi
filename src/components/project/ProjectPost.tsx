import { $, component$, useContext, type PropsOf } from '@builder.io/qwik';
import { Card } from '../ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { Button } from '~/components/ui/button/button';
import { LuMessageCircle, LuShare2 } from '@qwikest/icons/lucide';
import { TbHeart, TbHeartFilled } from '@qwikest/icons/tablericons';

import { formatDate } from '~/utils/formatDate';
import { cn } from '@qwik-ui/utils';
import { globalAction$, useLocation, z, zod$ } from '@builder.io/qwik-city';
import {
  createUserLike,
  deleteUserLike,
} from '~/server/services/user-like/user-like';
import type { User } from 'lucia';
import type { Project } from '~/server/services/project/entities/project';
import { ProjectContext } from '~/context/project/ProjectContext';

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

export type ProjectPostProps = {
  project: Project;
} & PropsOf<'div'>;

export const ProjectPost = component$<ProjectPostProps>(
  ({ project, ...props }) => {
    const likeProjectAction = useLikeProjectAction();
    const { projectSelected, projects } = useContext(ProjectContext);
    const loc = useLocation();

    const handleLikePost = $(async (e: PointerEvent) => {
      // to prevent redirecting to the project page
      // !important inside here we need to use the `project object` otherwise the value won't be updated
      e.stopPropagation();

      // to update the project object with the new value only if we are in the project page
      const projectId = loc.params.id;

      const likePost = () =>
        likeProjectAction.submit({
          intent: project.isLiked ? 'deleteLike' : 'createLike',
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
            <a
              href={project.urlPdf}
              target="_blank"
              class="text-primary hover:underline flex-shrink-0 uppercase font-semibold"
              onClick$={(e) => {
                e.stopPropagation();
              }}
            >
              Descargar PDF
            </a>
            <Card.Description>{project.description}</Card.Description>
          </div>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <div>Publicado el {formatDate(project.createdAt)}</div>
            <div>Por {project.user.name}</div>
          </div>
          {project.urlImg && (
            <figure class="mt-4">
              <img
                src={project.urlImg}
                alt="Imagen del artículo"
                width={800}
                height={200}
                class="w-full rounded-md object-cover h-64"
              />
            </figure>
          )}
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
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
          </div>
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Button
                look="ghost"
                size="icon"
                class="rounded-full hover:bg-muted gap-1 w-full"
                type="submit"
                onClick$={(e) => handleLikePost(e)}
              >
                {project.isLiked ? (
                  <TbHeartFilled color="red" font-size={22} />
                ) : (
                  <TbHeart font-size={22} />
                )}
                <span style={{ color: project.isLiked ? 'red' : '' }}>
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
          </div>
        </Card.Content>
      </Card.Root>
    );
  }
);
