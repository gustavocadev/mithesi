import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Toaster } from 'qwik-sonner';
import { CreateProjectModal } from '~/components/project/CreateProjectModal';
import { Header } from '~/components/shared/Header';
import { handleRequest } from '~/server/db/lucia';
import { findOneUser } from '~/server/services/user/user';

export const useUserDataLoader = routeLoader$(async (event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();

  if (!session) {
    throw event.redirect(303, '/login');
  }
  const user = await findOneUser(session.userId);

  return {
    user,
  };
});

// export const useSignoutAction = routeAction$(async (values, event) => {
//   const authRequest = auth.handleRequest(event);
//   const { session } = await authRequest.validateUser();

//   if (!session) throw event.redirect(303, '/');

//   auth.invalidateSession(session.sessionId);
//   authRequest.setSession(null);

//   throw event.redirect(303, '/');
// });

export default component$(() => {
  return (
    <div>
      <Header />
      <main class="flex-1 p-10">
        <Slot />
      </main>

      <CreateProjectModal />
      <Toaster />
    </div>
  );
});
