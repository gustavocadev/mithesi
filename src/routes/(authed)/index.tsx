import type { RequestHandler } from '@builder.io/qwik-city';
import type { Session } from 'lucia';

export const onGet: RequestHandler = async ({ redirect, sharedMap }) => {
  const session = sharedMap.get('session') as Session | undefined;
  if (!session) {
    throw redirect(303, '/projects/');
  }
};
