import { createContextId, type Signal } from '@builder.io/qwik';

type ProjectState = {
  showCreateProjectModal: Signal<boolean>;
};

export const ProjectContext = createContextId<ProjectState>('project.context');
