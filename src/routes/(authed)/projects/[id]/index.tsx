import { component$, Resource, useContext } from '@builder.io/qwik';
import {
  type DocumentHead,
  Form,
  Link,
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
  z,
  zod$,
} from '@builder.io/qwik-city';
import { Button } from '~/components/ui/button/button';
import { findOneThesisProject } from '~/server/services/project/project';
import { LuArrowLeft, LuPencil } from '@qwikest/icons/lucide';
import { ProjectPost } from '~/components/project/ProjectPost';
import { ProjectContext } from '~/context/project/ProjectContext';
import { Input } from '~/components/ui/input/input';
import {
  createCommitteeMember,
  findCommitteeMembersByProjectId,
} from '~/server/services/comittee-member/comittee-member';
import { ComitteeMember } from '~/components/project/ComitteeMember';
import { findOneUser } from '~/server/services/user/user';
import { useUserAuth } from '../../layout';

export const useProject = routeLoader$(async ({ params }) => {
  // the project data
  const project = await findOneThesisProject(params.id);

  return project;
});

export const getProject = server$(async function (id: string) {
  return {
    project: await findOneThesisProject(id),
  };
});

export const getCommitteeMembers = server$(async function (id: string) {
  return {
    committeeMembers: await findCommitteeMembersByProjectId(id),
  };
});

export const useActionAddCommitteeMember = routeAction$(
  async (values, request) => {
    const userToAdd = await findOneUser(values.userId);

    if (!userToAdd) {
      return {
        error: 'User not found',
      };
    }

    await createCommitteeMember(values.userId, values.projectId);

    console.log({ userToAdd });
    throw request.redirect(303, `/projects/${values.projectId}`);
  },
  zod$({
    userId: z.string(),
    projectId: z.string(),
  })
);

export default component$(() => {
  const userAuth = useUserAuth();
  const { projectSelected } = useContext(ProjectContext);
  const nav = useNavigate();
  const loc = useLocation();
  const projectId = loc.params.id;

  return (
    <div class="space-y-4 mx-auto w-full sm:w-8/12 lg:w-5/12 2xl:w-4/12">
      <div class="flex justify-between">
        <Button
          look="ghost"
          size="icon"
          class="rounded-full hover:bg-gray-200"
          onClick$={() => {
            nav('/projects');
          }}
        >
          <LuArrowLeft class="w-5 h-5" />
        </Button>

        <Resource
          value={getProject(projectId)}
          onResolved={({ project }) => (
            <>
              {userAuth.value.id === project.user.id && (
                <div class="flex items-center gap-2 text-gray-400 hover:text-black">
                  <LuPencil class="size-5" />
                  <Link
                    class="uppercase font-bold"
                    href={`/projects/edit/${projectSelected.value?.id}`}
                  >
                    Editar
                  </Link>
                </div>
              )}
            </>
          )}
        />
      </div>
      {projectSelected.value ? (
        <ProjectPost project={projectSelected.value} />
      ) : (
        <Resource
          value={getProject(projectId)}
          onResolved={({ project }) => {
            return <ProjectPost project={project} />;
          }}
        />
      )}

      <div class="space-y-2 absolute right-10 top-0 hidden xl:block">
        {userAuth.value.role === 'admin' && (
          <section class="bg-white p-5 w-full rounded-lg shadow mx-auto space-y-4">
            <Form class="space-y-2">
              <p class="font-bold text-xl text-center">Miembros del jurado</p>
              <div class="flex items-center justify-center gap-2">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email del Usuario"
                />
                <Button type="submit">Agregar</Button>
              </div>
            </Form>

            <Resource
              value={getCommitteeMembers(projectId)}
              onResolved={({ committeeMembers }) => {
                return (
                  <div class="space-y-4">
                    {committeeMembers.length !== 0 ? (
                      committeeMembers.map((contributor) => (
                        <ComitteeMember
                          contributor={contributor}
                          key={contributor.id}
                          projectId={projectId ?? ''}
                          authorId={projectSelected.value?.userId ?? ''}
                          userAuthId={userAuth.value.id ?? ''}
                        />
                      ))
                    ) : (
                      <p class="text-center">No hay miembros del jurado</p>
                    )}
                  </div>
                );
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue, params }) => {
  const project = resolveValue(useProject);

  const title = project.title;
  const description = project.description;

  return {
    title: `Proyecto "${title}"`,
    meta: [
      {
        name: 'description',
        content: description,
      },
      {
        name: 'id',
        content: params.id,
      },
    ],
  };
};
