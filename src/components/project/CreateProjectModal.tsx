import { component$, useContext } from '@builder.io/qwik';
import { Modal } from '../ui/modal/modal';
import { ProjectContext } from '~/context/project/ProjectContext';
import { Label } from '../ui/label/label';
import { Input } from '../ui/input/input';
import { Textarea } from '../ui/textarea/textarea';
import { Button } from '../ui/button/button';

export const CreateProjectModal = component$(() => {
  const { showCreateProjectModal } = useContext(ProjectContext);
  return (
    <Modal.Root bind:show={showCreateProjectModal}>
      <Modal.Panel>
        <Modal.Title>Publica tu proyecto de tesis</Modal.Title>
        <Modal.Description>
          Llena los campos para publicar tu proyecto de tesis.
        </Modal.Description>
        <div class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label for="title">Titulo (*)</Label>
            <Input
              id="title"
              placeholder="Ingresa un titulo para el proyecto"
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Descripcion (*)</Label>
            <Textarea id="description" placeholder="Ingrese una descripcion" />
          </div>
          <div class="space-y-2">
            <Label for="image">Imagen (opcional)</Label>
            <Input id="image" type="file" />
          </div>
          <div class="space-y-2">
            <Label for="pdf">Proyecto de tesis PDF (*)</Label>
            <Input id="pdf" type="file" required />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <Button type="submit">Crear Proyecto</Button>
          <div>
            <Button
              look="outline"
              onClick$={() => (showCreateProjectModal.value = false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal.Panel>
    </Modal.Root>
  );
});
