import { createContextId, type Signal } from '@builder.io/qwik';
import type { Project } from '~/server/services/project/entities/project';

type ProjectState = {
  showCreateProjectModal: Signal<boolean>;
  showUpdateProjectModal: Signal<boolean>;
  projectSelected: Signal<Project | null>;
  projects: Signal<Project[]>;
};

export const ProjectContext = createContextId<ProjectState>('project.context');
