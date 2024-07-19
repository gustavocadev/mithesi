import { component$, useContext } from '@builder.io/qwik';
import { Form, Link, globalAction$ } from '@builder.io/qwik-city';
import { handleRequest } from '~/server/db/lucia';
import { Button } from '../ui/button/button';
import { Input } from '../ui/input/input';
import { SocketContext } from '~/context/socket/SocketContext';

export const useSignoutAction = globalAction$(async (values, event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();

  if (!session) throw event.redirect(303, '/');

  await authRequest.invalidateSessionCookie(session);

  throw event.redirect(303, '/login');
});

export const Header = component$(() => {
  const signoutAction = useSignoutAction();
  const { isOnline } = useContext(SocketContext);

  return (
    <header class="px-4 xl:px-10 py-4 bg-white border-b">
      <nav class="md:flex md:justify-between items-center">
        <Link
          href="/projects/"
          class="text-4xl text-secondary font-black text-center"
          prefetch
        >
          Mithesi {isOnline.value ? '🟢' : '🔴'}
        </Link>

        <div class="flex flex-col md:flex-row items-center gap-4">
          <Form spaReset>
            <Input type="input" placeholder="Buscar" name="search" />
          </Form>
          <Link href="/projects">
            <Button class="font-bold uppercase" look="outline">
              Proyectos
            </Button>
          </Link>
          <Form action={signoutAction}>
            <Button look="destructive" type="submit" class="uppercase">
              Cerrar sesión
            </Button>
          </Form>
        </div>
      </nav>
    </header>
  );
});
