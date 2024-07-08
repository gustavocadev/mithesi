import { component$, useContext, useTask$ } from '@builder.io/qwik';
import {
  type DocumentHead,
  Link,
  routeLoader$,
  useLocation,
} from '@builder.io/qwik-city';
import Contributor from '~/components/project/Contributor';
import { Task } from '~/components/task/Task';
import { Button } from '~/components/ui/button/button';
import { SocketContext } from '~/context/socket/SocketContext';
import { TaskContext } from '~/context/task/TaskContext';
import { handleRequest } from '~/server/db/lucia';
import { findContributorsByProjectId } from '~/server/services/contributor/contributor';
import { findOneProject } from '~/server/services/project/project';
import { findOneUser } from '~/server/services/user/user';

export const useLoaderProject = routeLoader$(async ({ params }) => {
  // the project data
  const project = await findOneProject(params.id);

  return {
    project,
  };
});

export const useLoaderContributors = routeLoader$(async ({ params }) => {
  // all the contributors that belong to the project
  const contributors = await findContributorsByProjectId(params.id);

  return {
    contributors: contributors,
  };
});

export const useLoaderUserAuth = routeLoader$(async ({ cookie, redirect }) => {
  const authRequest = handleRequest({ cookie });

  const { session } = await authRequest.validateUser();

  if (!session) {
    throw redirect(303, '/');
  }

  const user = await findOneUser(session.userId);

  return {
    user,
  };
});

export default component$(() => {
  const loaderProject = useLoaderProject();
  const loaderContributors = useLoaderContributors();
  const loaderUserAuth = useLoaderUserAuth();

  const { tasks, getTasksByProjectId } = useContext(TaskContext);
  const { isOnline } = useContext(SocketContext);
  const loc = useLocation();

  useTask$(({ track }) => {
    track(() => [loc.params.id]);
    getTasksByProjectId(loc.params.id);
  });

  return (
    <div class="space-y-4">
      <div class="flex justify-between">
        <h1 class="font-black text-4xl">
          {loaderProject.value.project?.name ?? ''} -{' '}
          {isOnline.value ? 'Online' : 'Offline'}
        </h1>

        {loaderUserAuth.value.user?.id ===
          loaderProject.value.project?.userId && (
          <div class="flex items-center gap-2 text-gray-400 hover:text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width={1.5}
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>

            <Link
              class="uppercase font-bold"
              href={`/projects/edit/${loaderProject.value.project?.id}`}
            >
              Editar
            </Link>
          </div>
        )}
      </div>
      {loaderUserAuth.value.user?.id ===
        loaderProject.value.project?.userId && (
        <Link
          href={`/projects/${loaderProject.value.project?.id}/task/new`}
          class="flex items-center gap-1"
        >
          <Button
            // onClick={projectStore.toggleModalFormTask}
            class="w-full"
          >
            Nueva Tarea
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width={1.5}
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Button>
        </Link>
      )}

      <div class="space-y-2">
        <p class="font-bold text-xl">Tareas del proyecto</p>
        <div class="bg-white shadow rounded-lg">
          {tasks.value.length ? (
            tasks.value.map((task) => (
              <Task
                key={task.id}
                task={task}
                authorId={loaderProject.value.project?.userId ?? ''}
                userAuthId={loaderUserAuth.value.user?.id ?? ''}
              />
            ))
          ) : (
            <p class="text-center my-5 p-10">No hay tareas</p>
          )}
        </div>
      </div>
      <div class="flex items-center justify-between mt-10">
        <p class="font-bold text-xl">Colaboradores</p>
        {loaderUserAuth.value.user?.id ===
          loaderProject.value.project?.userId && (
          <Button
            look="link"
            class="uppercase font-bold text-gray-400 hover:text-black hover:no-underline"
          >
            <Link
              href={`/projects/${loaderProject.value.project?.id}/new-contributor`}
            >
              Agregar colaborador
            </Link>
          </Button>
        )}
      </div>
      <div>
        {loaderContributors.value?.contributors.length ? (
          loaderContributors.value?.contributors.map((contributor) => (
            // <Contributor contributor={contributor} key={contributor.contributors.} />
            <Contributor
              contributor={contributor}
              key={contributor.id}
              projectId={loaderProject.value.project?.id ?? ''}
              authorId={loaderProject.value.project?.userId ?? ''}
              userAuthId={loaderUserAuth.value.user?.id ?? ''}
            />
          ))
        ) : (
          <p class="text-center my-5 p-10">No hay colaboradores</p>
        )}
      </div>
      {/* <ModalFormTask /> */}
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue, params }) => {
  const project = resolveValue(useLoaderProject);

  return {
    title: `Proyecto "${project.project.name}"`,
    meta: [
      {
        name: 'description',
        content: project.project.description,
      },
      {
        name: 'id',
        content: params.id,
      },
    ],
  };
};
