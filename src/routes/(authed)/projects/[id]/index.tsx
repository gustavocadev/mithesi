import { component$ } from '@builder.io/qwik';
import { type DocumentHead, Link, routeLoader$ } from '@builder.io/qwik-city';
import { ComitteeMember } from '~/components/project/ComitteeMember';
import { Button } from '~/components/ui/button/button';
import { handleRequest } from '~/server/db/lucia';
import { findOneThesisProject } from '~/server/services/project/project';
import { LuArrowLeft } from '@qwikest/icons/lucide';
import { ProjectPost } from '~/components/project/ProjectPost';
import { findCommitteeMembersByProjectId } from '~/server/services/comittee-member/comittee-member';

export const useLoaderProject = routeLoader$(async ({ params }) => {
  // the project data
  const project = await findOneThesisProject(params.id);

  return {
    project,
  };
});

export const useCommitteeMembers = routeLoader$(async ({ params }) => {
  // all the contributors that belong to the project
  const contributors = await findCommitteeMembersByProjectId(params.id);

  return {
    contributors,
  };
});

export const useLoaderUserAuth = routeLoader$(async ({ cookie, redirect }) => {
  const authRequest = handleRequest({ cookie });
  const { user } = await authRequest.validateUser();
  if (!user) throw redirect(303, '/');

  return {
    user,
  };
});

export default component$(() => {
  const loaderProject = useLoaderProject();
  const loaderContributors = useCommitteeMembers();
  const loaderUserAuth = useLoaderUserAuth();

  return (
    <div class="space-y-4 mx-auto w-4/12">
      <div class="flex justify-between">
        <Link href="/projects/">
          <Button
            look="ghost"
            size="icon"
            class="rounded-full hover:bg-gray-200"
          >
            <LuArrowLeft class="w-5 h-5" />
          </Button>
        </Link>

        {loaderUserAuth.value.user.id ===
          loaderProject.value.project.userId && (
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
              href={`/projects/edit/${loaderProject.value.project.id}`}
            >
              Editar
            </Link>
          </div>
        )}
      </div>
      <ProjectPost
        createdAt={loaderProject.value.project.createdAt}
        description={loaderProject.value.project.description}
        title={loaderProject.value.project.title}
        id={loaderProject.value.project.id}
        urlPdf={loaderProject.value.project.urlPdf}
        projectStatus={loaderProject.value.project.status}
        urlImg={loaderProject.value.project.urlImg}
        authorName={
          loaderProject.value.project.user.name +
          ' ' +
          loaderProject.value.project.user.lastName
        }
      />

      <div class="flex items-center justify-between mt-10">
        <p class="font-bold text-xl">Miembros del jurado</p>
        {loaderUserAuth.value.user.id ===
          loaderProject.value.project.userId && (
          <Button
            look="link"
            class="uppercase font-bold text-gray-400 hover:text-black hover:no-underline"
          >
            <Link
              href={`/projects/${loaderProject.value.project?.id}/new-committee-member`}
            >
              Agregar miembro del jurado
            </Link>
          </Button>
        )}
      </div>
      <div>
        {loaderContributors.value.contributors.length ? (
          loaderContributors.value.contributors.map((contributor) => (
            <ComitteeMember
              contributor={contributor}
              key={contributor.id}
              projectId={loaderProject.value.project?.id ?? ''}
              authorId={loaderProject.value.project?.userId ?? ''}
              userAuthId={loaderUserAuth.value.user?.id ?? ''}
            />
          ))
        ) : (
          <p class="text-center my-5 p-10">No hay miembros del jurado</p>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue, params }) => {
  const project = resolveValue(useLoaderProject);

  return {
    title: `Proyecto "${project.project.title}"`,
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
