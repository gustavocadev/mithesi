import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Toaster } from 'qwik-sonner';
import { CreateProjectModal } from '~/components/project/CreateProjectModal';
import { Header } from '~/components/shared/Header';
import { ProjectProvider } from '~/context/project/ProjectProvider';
import { SocketProvider } from '~/context/socket/SocketProvider';
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

export default component$(() => {
  return (
    <SocketProvider>
      <ProjectProvider>
        <div>
          <Header />
          <main class="flex-1 p-10">
            <Slot />
          </main>

          <CreateProjectModal />
          <Toaster />
        </div>
      </ProjectProvider>
    </SocketProvider>
  );
});
