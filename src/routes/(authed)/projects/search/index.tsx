import { component$, useContext } from '@builder.io/qwik';
import { Form, routeLoader$, useNavigate } from '@builder.io/qwik-city';
import type { User } from 'lucia';
import { ProjectPost } from '~/components/project/ProjectPost';
import { Card } from '~/components/ui/card/card';
import { Input } from '~/components/ui/input/input';
import { ProjectContext } from '~/context/project/ProjectContext';
import { findProjectsByUserId } from '~/server/services/project/project';

export const useSearchProjects = routeLoader$(async ({ sharedMap, url }) => {
  const user = sharedMap.get('user') as User;

  // search for params if there is a search param
  const projectName = url.searchParams.get('q');

  if (!projectName) {
    // get all the projects that the user is the author or contributor
    return [];
  }

  const projectsByUser = await findProjectsByUserId(user.id, user.role);

  // if there is a search param, filter the projects by the search param
  const projects = projectsByUser.filter((project) =>
    project.title.toLowerCase().includes(projectName.toLowerCase())
  );

  return projects;
});

export default component$(() => {
  const projectsSearched = useSearchProjects();
  const { projectSelected } = useContext(ProjectContext);
  const nav = useNavigate();
  return (
    <Card.Root class="w-full md:w-8/12 xl:w-4/12 mx-auto rounded-none xl:rounded-xl">
      <Form class="flex items-center p-3 gap-2">
        <Input class="flex-1" placeholder="Buscar proyectos..." name="q" />
      </Form>
      {projectsSearched.value.map((project) => (
        <ProjectPost
          key={project.id}
          project={project}
          class="cursor-pointer rounded-none border-t"
          onClick$={() => {
            projectSelected.value = project;
            nav('/projects/' + project.id + '/');
          }}
        />
      ))}
    </Card.Root>
  );
});
