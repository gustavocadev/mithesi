import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { User } from 'lucia';
import { Toaster } from 'qwik-sonner';
import { CreateProjectModal } from '~/components/project/CreateProjectModal';
import { MobileMenu } from '~/components/shared/MobileMenu';
import { Sidebar } from '~/components/shared/Sidebar';
import { CommentProvider } from '~/context/comment/CommentProvider';
import { ProjectProvider } from '~/context/project/ProjectProvider';
import { SocketProvider } from '~/context/socket/SocketProvider';

export const useUserAuth = routeLoader$(async ({ sharedMap, redirect }) => {
  const user = sharedMap.get('user') as User | undefined;
  if (!user) throw redirect(303, '/login/');

  return user;
});

export default component$(() => {
  return (
    <SocketProvider>
      <ProjectProvider>
        <CommentProvider>
          <Sidebar />
          <MobileMenu />
          <main class="pb-16 xl:py-10 relative">
            <Slot />
          </main>

          <CreateProjectModal />

          <Toaster richColors />
        </CommentProvider>
      </ProjectProvider>
    </SocketProvider>
  );
});
