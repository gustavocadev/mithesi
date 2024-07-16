import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Button } from '../ui/button/button';
import { useUserAuth } from '~/routes/(authed)/layout';

type Props = {};

export const Sidebar = component$<Props>(() => {
  const user = useUserAuth();
  return (
    <aside class="md:w-80 lg:w-96 px-5 py-10 space-y-2">
      <p class="text-xl font-bold">Hola: {user.value.name}</p>

      <Link href="/projects/new-project" class="block">
        <Button class="w-full text-md uppercase font-bold">
          Nuevo proyecto
        </Button>
      </Link>
    </aside>
  );
});
