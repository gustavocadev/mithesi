import { $, component$, useContext, type Signal } from '@builder.io/qwik';
import { Modal } from '../ui/modal/modal';
import { Label } from '../ui/label/label';
import { Input } from '../ui/input/input';
import { Textarea } from '../ui/textarea/textarea';
import { Button } from '../ui/button/button';
import { Form, globalAction$, z, zod$ } from '@builder.io/qwik-city';
import { updateProjectById } from '~/server/services/project/project';
import { handleRequest } from '~/server/db/lucia';
import { toast } from 'qwik-sonner';
import { uploadFile } from '~/server/utils/uploadFile';
import { zfd } from 'zod-form-data';
import { ProjectContext } from '~/context/project/ProjectContext';

export const useUpdateProjectAction = globalAction$(
  async (values, { cookie, redirect, params, fail }) => {
    const authRequest = handleRequest({ cookie });
    const { user } = await authRequest.validateUser();
    if (!user) throw redirect(303, '/login');

    const urlPdf = await uploadFile(values.pdf);
    if (!urlPdf) {
      return fail(500, {
        message: 'Error al subir el archivo pdf',
      });
    }

    const urlImage = await uploadFile(values.image);

    const projectId = params.id;

    console.log('projectId', projectId);

    await updateProjectById(projectId, {
      description: values.description,
      title: values.title,
      urlImg: urlImage,
      urlPdf,
      userId: user.id,
    });

    return { success: true };
  },
  zod$({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    image: zfd.file().optional(),
    pdf: zfd.file(),
  })
);

type Props = {
  showUpdateProjectModal: Signal<boolean>;
};

export const UpdateProjectModal = component$<Props>(
  ({ showUpdateProjectModal }) => {
    const updateProjectAction = useUpdateProjectAction();
    const { projectSelected } = useContext(ProjectContext);

    return (
      <Modal.Root bind:show={showUpdateProjectModal}>
        <Modal.Panel>
          <Modal.Title>Actualiza tu proyecto de tesis</Modal.Title>
          <Modal.Description>
            Llena los campos necesarios para actualizar de tu proyecto de tesis.
          </Modal.Description>
          <Form
            action={updateProjectAction}
            onSubmitCompleted$={$(() => {
              if (updateProjectAction.value?.failed) return;
              showUpdateProjectModal.value = false;
              toast.success('Proyecto actualizado correctamente');
            })}
          >
            <div class="grid gap-4 py-4">
              <div class="space-y-2">
                <Label for="title">Titulo (*)</Label>
                <Input
                  id="title"
                  placeholder="Ingresa un titulo para el proyecto"
                  name="title"
                  value={projectSelected.value?.title}
                />
                {updateProjectAction.value?.fieldErrors?.title && (
                  <p class="text-red-500 text-sm">
                    El campo titulo es requerido
                  </p>
                )}
              </div>
              <div class="space-y-2">
                <Label for="description">Descripcion (*)</Label>
                <Textarea
                  id="description"
                  placeholder="Ingrese una descripcion"
                  name="description"
                  value={projectSelected.value?.description}
                />
                {updateProjectAction.value?.fieldErrors?.description && (
                  <p class="text-red-500 text-sm">
                    El campo descripcion es requerido
                  </p>
                )}
              </div>
              <div class="space-y-2">
                <Label for="image">Imagen (opcional)</Label>
                <Input id="image" type="file" name="image" accept="image/*" />
              </div>
              <div class="space-y-2">
                <Label for="pdf">Proyecto de tesis PDF (*)</Label>
                <Input id="pdf" type="file" required name="pdf" accept=".pdf" />
                {updateProjectAction.value?.fieldErrors?.pdf && (
                  <p class="text-red-500 text-sm">
                    El campo proyecto de tesis PDF es requerido
                  </p>
                )}
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <Button type="submit" disabled={updateProjectAction.isRunning}>
                Actualizar
              </Button>
              <div>
                <Button
                  look="outline"
                  type="button"
                  onClick$={() => (showUpdateProjectModal.value = false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Panel>
      </Modal.Root>
    );
  }
);
