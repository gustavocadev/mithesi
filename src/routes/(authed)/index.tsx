import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ redirect }) => {
  // at this point we are already authenticated, we only need to redirect to the projects page
  throw redirect(303, '/projects/');
};
