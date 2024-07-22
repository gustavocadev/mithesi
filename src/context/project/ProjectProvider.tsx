import {
  component$,
  Slot,
  useContextProvider,
  useSignal,
  useStore,
} from '@builder.io/qwik';
import { ProjectContext } from './ProjectContext';
import type { Project } from '~/server/services/project/entities/project';

export const ProjectProvider = component$(() => {
  const showCreateProjectModal = useSignal(false);
  const showUpdateProjectModal = useSignal(false);
  const projectSelected = useSignal<Project | null>(null);
  const projects = useSignal<Project[]>([]);

  useContextProvider(
    ProjectContext,
    useStore({
      showCreateProjectModal,
      projectSelected,
      projects,
      showUpdateProjectModal,
    })
  );
  return <Slot />;
});
