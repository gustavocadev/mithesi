import {
  component$,
  Slot,
  useContextProvider,
  useSignal,
  useStore,
} from '@builder.io/qwik';
import { ProjectContext } from './ProjectContext';

export const ProjectProvider = component$(() => {
  const showCreateProjectModal = useSignal(false);

  useContextProvider(ProjectContext, useStore({ showCreateProjectModal }));
  return <Slot />;
});
