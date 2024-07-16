import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { Session } from 'lucia';

export const useLoaderData = routeLoader$(async ({ sharedMap, redirect }) => {
  const session = sharedMap.get('session') as Session | undefined;
  if (session) throw redirect(303, '/projects');

  return {};
});

export default component$(() => {
  return (
    <main class="container mx-auto mt-5 md:mt-20 p-5 md:flex md:justify-center ">
      <section class="md:w-2/3 lg:w-2/5">
        <Slot />
      </section>
    </main>
  );
});
