import { component$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { Card } from '../ui/card/card';
import { Badge } from '~/components/ui/badge/badge';
import { Button } from '~/components/ui/button/button';
import { LuMessageCircle, LuThumbsUp, LuShare2 } from '@qwikest/icons/lucide';

export interface ProjectPostProps {
  id: string;
  name: string;
  description: string;
  createdAt: Date | null;
}

export const ProjectPost = component$<ProjectPostProps>(({ id }) => {
  const nav = useNavigate();
  return (
    <Card.Root
      class="rounded-none border-b-2 border-gray-100 border cursor-pointer"
      onClick$={() => {
        nav(`/projects/${id}`);
      }}
    >
      <Card.Header>
        <div class="flex items-start justify-between gap-4">
          <div class="grid gap-2">
            <Card.Title class="text-3xl font-bold">
              Introducción a la Inteligencia Artificial{' '}
            </Card.Title>
            <Card.Description>
              Este artículo proporciona una visión general de los conceptos
              fundamentales de la Inteligencia Artificial, incluyendo sus
              aplicaciones y desafíos.
            </Card.Description>
          </div>
          <a
            href="#"
            class="text-primary hover:underline"
            // prefetch={false}
          >
            Ver PDF
          </a>
        </div>
      </Card.Header>
      <Card.Content>
        <div class="flex items-center justify-between text-sm text-muted-foreground">
          <div>Publicado el 15 de mayo de 2023</div>
          <div>Por John Doe</div>
        </div>
        <figure class="mt-4">
          <img
            src="https://cdn.wallpapersafari.com/45/10/gSxQLu.jpg"
            alt="Imagen del artículo"
            width={800}
            height={200}
            class="w-full rounded-md object-cover h-64"
          />
        </figure>
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Badge look="outline" class="bg-yellow-500 text-white">
              Pendiente
            </Badge>
            <Badge look="outline" class="bg-green-500 text-white">
              Aprobado
            </Badge>
            <Badge look="outline" class="bg-red-500 text-white">
              Reprobado
            </Badge>
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
});
