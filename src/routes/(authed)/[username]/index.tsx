import { component$ } from '@builder.io/qwik';
import { useUserAuth } from '../layout';
import { Form } from '@builder.io/qwik-city';
import { Button } from '~/components/ui/button/button';
import { useSignoutAction } from '~/components/shared/Sidebar';

export default component$(() => {
  const user = useUserAuth();
  const signoutAction = useSignoutAction();
  return (
    <div class="w-full text-center space-y-4">
      <h2 class="text-4xl font-semibold">
        Hola: {user.value.name} {user.value.lastName}
      </h2>
      {/* A funny gif */}
      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGhkeGg4dTBhM3MyeWEyODAxMzFkZ3Bjc2dlZGEybDZkNDdwY3JkeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bcKmIWkUMCjVm/giphy.gif"
        alt="Welcome"
        class="w-full lg:w-4/12 mx-auto rounded"
        width={300}
        height={300}
      />

      <Form action={signoutAction}>
        <Button class=" uppercase" look="destructive">
          Cerrar sesión
        </Button>
      </Form>
    </div>
  );
});
