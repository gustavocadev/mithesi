import { component$, type QRL } from '@builder.io/qwik';
import { Card } from '../ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { Button } from '~/components/ui/button/button';
import { LuMessageCircle, LuThumbsUp, LuShare2 } from '@qwikest/icons/lucide';
import type { SelectProject } from '~/server/db/schema';
import { formatDate } from '~/utils/formatDate';

export interface ProjectPostProps {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  urlPdf: string;
  urlImg?: string | null;
  onClick$?: QRL<() => void>;
  projectStatus: SelectProject['status'];
}

export const ProjectPost = component$<ProjectPostProps>(
  ({
    title,
    description,
    urlPdf,
    createdAt,
    onClick$,
    projectStatus,
    urlImg,
  }) => {
    return (
      <Card.Root
        class="rounded-none border-b-2 border-gray-100 border cursor-pointer"
        onClick$={onClick$}
      >
        <Card.Header>
          <div class="flex items-start justify-between gap-4">
            <div class="grid gap-2">
              <Card.Title class="text-3xl font-bold">{title}</Card.Title>
              <Card.Description>{description}</Card.Description>
            </div>
            <a
              href={urlPdf}
              target="_blank"
              class="text-primary hover:underline"
            >
              Ver PDF
            </a>
          </div>
        </Card.Header>
        <Card.Content>
          <div class="flex items-center justify-between text-sm text-muted-foreground">
            <div>Publicado el {formatDate(createdAt)}</div>
            <div>Por John Doe</div>
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
              <Button
                look="ghost"
                size="icon"
                class="rounded-full hover:bg-muted"
              >
                <LuThumbsUp class="w-5 h-5" />
                <span class="sr-only">Like</span>
              </Button>
              <Button
                look="ghost"
                size="icon"
                class="rounded-full hover:bg-muted"
              >
                <LuMessageCircle class="w-5 h-5" />
                <span class="sr-only">Comment</span>
              </Button>
              <Button
                look="ghost"
                size="icon"
                class="rounded-full hover:bg-muted"
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
