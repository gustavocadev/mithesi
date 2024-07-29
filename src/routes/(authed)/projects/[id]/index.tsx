import {
  component$,
  Resource,
  useContext,
  useSignal,
  useTask$,
} from '@builder.io/qwik';
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
import {
  deleteProjectById,
  findOneThesisProject,
} from '~/server/services/project/project';
import { LuArrowLeft, LuPencil, LuTrash } from '@qwikest/icons/lucide';
import { ProjectPost } from '~/components/project/ProjectPost';
import { Input } from '~/components/ui/input/input';
import {
  createCommitteeMember,
  findCommitteeMembersByProjectId,
} from '~/server/services/comittee-member/comittee-member';
import { ComitteeMember } from '~/components/project/ComitteeMember';
import { useUserAuth } from '../../layout';
import { CommentContext } from '~/context/comment/CommentContext';
import { SocketContext } from '~/context/socket/SocketContext';
import { toast } from 'qwik-sonner';
import { findOneUserByEmail } from '~/server/services/user/user';
import type { User } from 'lucia';
import { UpdateProjectModal } from '~/components/project/UpdateProjectModal';
import { ProjectContext } from '~/context/project/ProjectContext';

export const useProject = routeLoader$(async ({ params, sharedMap }) => {
  const user = sharedMap.get('user') as User;
  // the project data
  const project = await findOneThesisProject(params.id, user.id);

  return project;
});

export const getCommitteeMembers = server$(async function (id: string) {
  return {
    committeeMembers: await findCommitteeMembersByProjectId(id),
  };
});

export const deleteProjectByIdFuction = server$(async function (id: string) {
  await deleteProjectById(id);
});

export const useAddCommitteeMemberAction = routeAction$(
  async (values, { redirect, fail, sharedMap }) => {
    const userToAdd = await findOneUserByEmail(values.email);
    const userAuth = sharedMap.get('user') as User;

    if (!userToAdd) {
      return fail(500, {
        message: 'El usuario no existe',
      });
    }

    if (userToAdd.role === 'admin') {
      return fail(500, {
        message: 'No puedes agregar a un administrador como miembro del jurado',
      });
    }

    if (userToAdd.id === userAuth.id) {
      return fail(500, {
        message: 'No puedes agregarte a ti mismo como miembro del jurado',
      });
    }
    await createCommitteeMember(userToAdd.id, values.projectId);

    throw redirect(303, `/projects/${values.projectId}`);
  },
  zod$({
    email: z.string().email(),
    projectId: z.string(),
  })
);

export default component$(() => {
  const userAuth = useUserAuth();
  const { getCommentsByProjectId } = useContext(CommentContext);
  const { projectSelected } = useContext(ProjectContext);
  const { socket } = useContext(SocketContext);
  const showUpdateProjectModal = useSignal(false);
  const addCommitteeMemberAction = useAddCommitteeMemberAction();
  const project = useProject();
  const nav = useNavigate();
  const loc = useLocation();
  const projectId = loc.params.id;

  useTask$(({ track }) => {
    track(() => socket.value);
    getCommentsByProjectId(projectId);

    // set the project selected
    projectSelected.value = project.value;
  });

  return (
    <div class="mx-auto w-full sm:w-8/12 lg:w-5/12 2xl:w-4/12">
      {!project.value && (
        <div class="flex gap-2 flex-col">
          <h1 class="text-2xl font-bold">Proyecto no encontrado</h1>

          <Link href="/projects" prefetch>
            <Button look="outline">Regresar</Button>
          </Link>
        </div>
      )}
      <div class="flex justify-between p-2 lg:py-2 items-center">
        {project.value && (
          <Button
            look="ghost"
            size="icon"
            class="rounded-full hover:bg-gray-200"
            onClick$={() => {
              nav(-1);
            }}
          >
            <LuArrowLeft class="w-5 h-5" />
          </Button>
        )}

        {userAuth.value.id === project.value?.user.id && (
          <div class="flex">
            <Button
              class="flex items-center gap-2 text-gray-400 hover:text-black uppercase font-bold"
              look="ghost"
              onClick$={async () => {
                toast.promise(deleteProjectByIdFuction(projectId), {
                  loading: 'Eliminando proyecto...',
                  success: 'Proyecto eliminado con exito',
                  error: 'Error al eliminar proyecto',
                  finally: () => {
                    nav('/projects/');
                  },
                });
              }}
            >
              <LuTrash class="size-5" />
            </Button>
            <Button
              class="flex items-center gap-2 text-gray-400 hover:text-black"
              look="ghost"
              onClick$={() => {
                showUpdateProjectModal.value = true;
              }}
            >
              <LuPencil class="size-5" />
            </Button>
          </div>
        )}
      </div>
      {project.value && <ProjectPost project={project.value} />}

      <div class="space-y-2 fixed right-10 top-10 hidden xl:block">
        {project.value && project.value.status === 'approved' && (
          <section class="bg-white p-5 w-96 rounded-lg shadow mx-auto space-y-4">
            <h2 class="font-bold text-xl text-center">Miembros del jurado</h2>
            {userAuth.value.role === 'admin' && (
              <Form
                class="space-y-2"
                action={addCommitteeMemberAction}
                onSubmitCompleted$={() => {
                  if (addCommitteeMemberAction.value?.failed) {
                    toast.error(addCommitteeMemberAction.value?.message);
                    return;
                  }
                  toast.success('Miembro del jurado agregado con exito');
                }}
                spaReset
              >
                <input type="hidden" name="projectId" value={projectId} />

                <div class="flex items-center justify-center gap-2">
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email del Usuario"
                  />
                  <Button
                    type="submit"
                    disabled={addCommitteeMemberAction.isRunning}
                  >
                    Agregar
                  </Button>
                </div>
              </Form>
            )}

            <Resource
              value={getCommitteeMembers(projectId)}
              onResolved={({ committeeMembers }) => {
                return (
                  <div class="space-y-4">
                    {committeeMembers.length !== 0 ? (
                      committeeMembers.map((committeeMember) => (
                        <ComitteeMember
                          committeeMember={committeeMember}
                          key={committeeMember.id}
                          projectId={projectId}
                          user={userAuth.value}
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
      <UpdateProjectModal showUpdateProjectModal={showUpdateProjectModal} />
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue, params }) => {
  const project = resolveValue(useProject);

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
    };
  }

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
