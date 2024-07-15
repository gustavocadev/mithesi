import { component$, type PropsOf } from '@builder.io/qwik';
import { Card } from '../ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { Button } from '~/components/ui/button/button';
import { LuMessageCircle, LuShare2 } from '@qwikest/icons/lucide';
import { TbHeart, TbHeartFilled } from '@qwikest/icons/tablericons';

import { type SelectProject } from '~/server/db/schema';
import { formatDate } from '~/utils/formatDate';
import { cn } from '@qwik-ui/utils';
import {
  Form,
  globalAction$,
  useNavigate,
  z,
  zod$,
} from '@builder.io/qwik-city';
import {
  createUserLike,
  deleteUserLike,
} from '~/server/services/user-like/user-like';
import { handleRequest } from '~/server/db/lucia';

export const useLikeProjectAction = globalAction$(
  async (values, { cookie, redirect }) => {
    const authRequest = handleRequest({ cookie });
    const { user } = await authRequest.validateUser();
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

    return {};
  },

  zod$({
    intent: z.enum(['createLike', 'deleteLike']),
    id: z.string(),
  })
);

export type ProjectPostProps = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  urlPdf: string;
  urlImg?: string | null;
  projectStatus: SelectProject['status'];
  authorName: string;
  userLikeId?: string | null;
  likes: number;
} & PropsOf<'div'>;

export const ProjectPost = component$<ProjectPostProps>(
  ({
    id,
    title,
    description,
    urlPdf,
    createdAt,
    projectStatus,
    urlImg,
    authorName,
    userLikeId,
    likes,
    ...props
  }) => {
    const likeProjectAction = useLikeProjectAction();
    const nav = useNavigate();

    return (
      <Card.Root
        class={cn(
          'rounded-none border-b-2 border-gray-100 border cursor-pointer',
          props.class
        )}
        {...props}
        onClick$={() => nav('/projects/' + id + '/')}
      >
        <Card.Header>
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <Card.Title class="text-3xl font-bold">{title}</Card.Title>
              <Card.Description>{description}</Card.Description>
            </div>
            <a
              href={urlPdf}
              target="_blank"
              class="text-primary hover:underline flex-shrink-0"
              onClick$={(e) => {
                e.stopPropagation();
              }}
            >
              Ver PDF
            </a>
          </div>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <div>Publicado el {formatDate(createdAt)}</div>
            <div>Por {authorName}</div>
          </div>
          {urlImg && (
            <figure class="mt-4">
              <img
                src={urlImg}
                alt="Imagen del artículo"
                width={800}
                height={200}
                class="w-full rounded-md object-cover h-64"
              />
            </figure>
          )}
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              {projectStatus === 'pending' && (
                <Badge look="outline" class="bg-yellow-500 text-white">
                  Pendiente
                </Badge>
              )}
              {projectStatus === 'approved' && (
                <Badge look="outline" class="bg-green-500 text-white">
                  Aprobado
                </Badge>
              )}
              {projectStatus === 'rejected' && (
                <Badge look="outline" class="bg-red-500 text-white">
                  Reprobado
                </Badge>
              )}
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Form action={likeProjectAction}>
                <input type="hidden" name="id" value={id} />
                <input
                  type="hidden"
                  name="intent"
                  value={userLikeId ? 'deleteLike' : 'createLike'}
                />
                <Button
                  look="ghost"
                  size="icon"
                  class="rounded-full hover:bg-muted gap-1 w-full px-4"
                  type="submit"
                  onClick$={(e) => {
                    // to prevent redirecting to the project page
                    e.stopPropagation();
                  }}
                >
                  {userLikeId ? (
                    <TbHeartFilled color="red" font-size={22} />
                  ) : (
                    <TbHeart font-size={22} />
                  )}
                  <span style={{ color: userLikeId ? 'red' : '' }}>
                    {likes}
                  </span>
                  <span class="sr-only">Like</span>
                </Button>
              </Form>
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
                <LuMessageCircle class="w-5 h-5" />
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
                <LuShare2 class="w-5 h-5" />
                <span class="sr-only">Share</span>
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    );
  }
);
