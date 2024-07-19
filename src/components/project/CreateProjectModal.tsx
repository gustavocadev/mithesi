import { $, component$, useContext } from '@builder.io/qwik';
import { Modal } from '../ui/modal/modal';
import { ProjectContext } from '~/context/project/ProjectContext';
import { Label } from '../ui/label/label';
import { Input } from '../ui/input/input';
import { Textarea } from '../ui/textarea/textarea';
import { Button } from '../ui/button/button';
import { globalAction$, z, zod$, Form } from '@builder.io/qwik-city';
import { createProject } from '~/server/services/project/project';
import { handleRequest } from '~/server/db/lucia';
import { toast } from 'qwik-sonner';
import { uploadFile } from '~/server/utils/uploadFile';
import { zfd } from 'zod-form-data';

export const useCreateProjectAction = globalAction$(
  async (values, { cookie, redirect }) => {
    const authRequest = handleRequest({ cookie });
    const { user } = await authRequest.validateUser();
    if (!user) throw redirect(303, '/login');

    const urlPdf = await uploadFile(values.pdf);
    if (!urlPdf) throw new Error('Error uploading file');

    const urlImage = await uploadFile(values.image);

    await createProject({
      description: values.description,
      title: values.title,
      urlImg: urlImage,
      urlPdf,
      userId: user.id,
    });

    throw redirect(303, '/projects');
  },
  zod$({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    image: zfd.file().optional(),
    pdf: zfd.file(),
  })
);

export const CreateProjectModal = component$(() => {
  const { showCreateProjectModal } = useContext(ProjectContext);
  const createProjectAction = useCreateProjectAction();
  return (
    <Modal.Root bind:show={showCreateProjectModal}>
      <Modal.Panel>
        <Modal.Title>Publica tu proyecto de tesis</Modal.Title>
        <Modal.Description>
          Llena los campos para publicar tu proyecto de tesis.
        </Modal.Description>
        <Form
          action={createProjectAction}
          onSubmitCompleted$={$(() => {
            if (createProjectAction.value?.failed) return;
            showCreateProjectModal.value = false;
            toast.success('Proyecto creado con exito');
          })}
        >
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <Label for="title">Titulo (*)</Label>
              <Input
                id="title"
                placeholder="Ingresa un titulo para el proyecto"
                name="title"
              />
              {createProjectAction.value?.fieldErrors.title && (
                <p class="text-red-500 text-sm">El campo titulo es requerido</p>
              )}
            </div>
            <div class="space-y-2">
              <Label for="description">Descripcion (*)</Label>
              <Textarea
                id="description"
                placeholder="Ingrese una descripcion"
                name="description"
              />
              {createProjectAction.value?.fieldErrors.description && (
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
              {createProjectAction.value?.fieldErrors.pdf && (
                <p class="text-red-500 text-sm">
                  El campo proyecto de tesis PDF es requerido
                </p>
              )}
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <Button type="submit" disabled={createProjectAction.isRunning}>
              Crear Proyecto
            </Button>
            <div>
              <Button
                look="outline"
                type="button"
                onClick$={() => (showCreateProjectModal.value = false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Panel>
    </Modal.Root>
  );
});
