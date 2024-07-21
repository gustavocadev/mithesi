import { component$, useContext } from '@builder.io/qwik';
import { Form, globalAction$, Link } from '@builder.io/qwik-city';
import { SocketContext } from '~/context/socket/SocketContext';
import { Button } from '../ui/button/button';
import { LuHome, LuLogOut, LuSearch, LuUser } from '@qwikest/icons/lucide';
import { handleRequest } from '~/server/db/lucia';

export const useSignoutAction = globalAction$(async (values, event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();

  if (!session) throw event.redirect(303, '/');

  await authRequest.invalidateSessionCookie(session);

  throw event.redirect(303, '/login');
});

type Props = {};

export const Sidebar = component$<Props>(() => {
  const signoutAction = useSignoutAction();
  const { isOnline } = useContext(SocketContext);

  return (
    <aside class="fixed hidden xl:flex rounded z-50 justify-between flex-col h-full p-2">
      <Link
        href="/projects/"
        class="
        text-4xl text-secondary font-black text-center hover:transform hover:scale-105 transition-transform"
        prefetch
      >
        Mithesi {isOnline.value ? '🟢' : '🔴'}
      </Link>

      <nav class="space-y-2">
        <Link href="/projects" class="block">
          <Button look="ghost" class="py-7">
            <LuHome class="size-7" />
          </Button>
        </Link>
        <Link href="/projects/search" class="block">
          <Button look="ghost" class="py-7">
            <LuSearch class="size-7" />
          </Button>
        </Link>
        <Link href={`/`} class="block">
          <Button look="ghost" class="py-7">
            <LuUser class="size-7" />
          </Button>
        </Link>
      </nav>

      <Form action={signoutAction}>
        <Button class="py-7" look="ghost">
          <LuLogOut class="size-7" />
        </Button>
      </Form>
    </aside>
  );
});
