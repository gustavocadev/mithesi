import { component$, Slot } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { handleRequest } from '~/server/db/lucia';

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    // staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 0,
  });
};

export const onRequest: RequestHandler = async ({ cookie, sharedMap }) => {
  const authRequest = handleRequest({ cookie });
  const { user, session } = await authRequest.validateUser();

  // share the user and session with the rest of the app
  sharedMap.set('user', user);
  sharedMap.set('session', session);
};

export default component$(() => {
  return <Slot />;
});
