import { component$ } from '@builder.io/qwik';
import {
  routeAction$,
  Form,
  Link,
  zod$,
  z,
  type DocumentHead,
} from '@builder.io/qwik-city';
import { hashPassword } from 'qwik-lucia';
import { db } from '~/server/db/db';
import { userTable } from '~/server/db/schema';
import pg from 'pg';
import { Button } from '~/components/ui/button/button';
import { Input } from '~/components/ui/input/input';
import { Label } from '~/components/ui/label/label';
import { generateIdFromEntropySize } from 'lucia';
import { Alert } from '../../../components/ui/alert/alert';

export const useSignupAction = routeAction$(
  async (values, { redirect, fail }) => {
    try {
      // verify passwords match
      if (values.password !== values.confirmPassword) {
        return fail(400, {
          message: 'Las contraseñas no coinciden',
        });
      }

      const passwordHash = await hashPassword(values.password);

      const regexToValidateNameAndLastName = /^[a-zA-ZÀ-ÿ\-']+$/;
      if (!regexToValidateNameAndLastName.test(values.name)) {
        return fail(400, {
          message: 'Nombre inválido',
        });
      }
      if (!regexToValidateNameAndLastName.test(values.lastName)) {
        return fail(400, {
          message: 'Apellido inválido',
        });
      }

      const username =
        values.name
          .toLowerCase()
          .replaceAll(' ', '')
          .replaceAll("'", '')
          .slice(0, 5) + generateIdFromEntropySize(10);

      await db.insert(userTable).values({
        name: values.name,
        lastName: values.lastName,
        passwordHash: passwordHash,
        email: values.email,
        username: username,
      });

      console.log('User created');
    } catch (e) {
      console.log(e);
      if (
        e instanceof pg.DatabaseError &&
        e.message === 'AUTH_DUPLICATE_KEY_ID'
      ) {
        return fail(400, {
          message: 'El u',
        });
      }
      return fail(500, {
        message: 'El email ya está registrado',
      });
    }
    // make sure you don't throw inside a try/catch block!
    throw redirect(303, '/login');
  },
  zod$({
    name: z
      .string({
        message: 'El campo nombre es requerido',
      })
      .min(1, {
        message: 'El nombre debe tener al menos 1 caracter',
      })
      .max(50, {
        message: 'El nombre debe tener máximo 50 caracteres',
      }),
    lastName: z
      .string({
        message: 'El campo apellido es requerido',
      })
      .min(1, {
        message: 'El apellido debe tener al menos 1 caracter',
      })
      .max(50, {
        message: 'El apellido debe tener máximo 50 caracteres',
      }),
    email: z
      .string({
        message: 'El campo email es requerido',
      })
      .email({
        message: 'El email no es válido',
      }),
    password: z
      .string({
        message: 'La contraseña debe tener al menos 8 caracteres y máximo 255',
      })
      .min(8, {
        message: 'La contraseña debe tener al menos 8 caracteres',
      })
      .max(255, {
        message: 'La contraseña debe tener máximo 255 caracteres',
      }),
    confirmPassword: z.string({
      message: 'La confirmación de la contraseña es requerida',
    }),
  })
);

export default component$(() => {
  const signupAction = useSignupAction();

  return (
    <main class="space-y-10">
      <h1 class="text-primary font-black text-6xl">
        Crea tu cuenta y administra tus{' '}
        <span class="text-slate-700">proyectos</span>
      </h1>
      <div>
        <Form
          action={signupAction}
          class="bg-white shadow rounded-lg p-10 space-y-6"
        >
          {signupAction.value && signupAction.value.message && (
            <Alert.Root look="alert">
              <Alert.Title>
                Se ha encontrado un error al crear la cuenta
              </Alert.Title>
              <Alert.Description>
                <ul class="list-disc pl-4">
                  <li>{signupAction.value.message}</li>
                </ul>
              </Alert.Description>
            </Alert.Root>
          )}

          <div class="space-y-2">
            <Label
              class="uppercase text-gray-600 block text-xl font-bold"
              for="name"
            >
              Nombres
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Nombres"
              class="w-full bg-gray-50"
            />
            {signupAction.value?.fieldErrors?.name && (
              <p class="text-red-500 text-sm">
                {signupAction.value.fieldErrors.name}
              </p>
            )}
          </div>

          <div class="space-y-2">
            <Label
              class="uppercase text-gray-600 block text-xl font-bold"
              for="lastName"
            >
              Apellidos
            </Label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Apellidos"
              class="w-full bg-gray-50"
            />
            {signupAction.value?.fieldErrors?.lastName && (
              <p class="text-red-500 text-sm">
                {signupAction.value.fieldErrors.lastName}
              </p>
            )}
          </div>

          <div class="space-y-2">
            <Label
              class="uppercase text-gray-600 block text-xl font-bold"
              for="email"
            >
              Email
            </Label>
            <Input
              type="text"
              id="email"
              name="email"
              placeholder="Email de registro"
              class="w-full bg-gray-50"
            />
            {signupAction.value?.fieldErrors?.email && (
              <p class="text-red-500 text-sm">
                {signupAction.value.fieldErrors.email}
              </p>
            )}
          </div>

          <div class="space-y-2">
            <Label
              class="uppercase text-gray-600 block text-xl font-bold"
              for="password"
            >
              Contraseña
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Password de registro"
              class="w-full bg-gray-50"
            />
            {signupAction.value?.fieldErrors?.password && (
              <p class="text-red-500 text-sm">
                {signupAction.value.fieldErrors.password}
              </p>
            )}
          </div>

          <div class="space-y-2">
            <Label
              class="uppercase text-gray-600 block text-xl font-bold"
              for="confirmPassword"
            >
              Repetir Contraseña
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repetir password"
              class="w-full bg-gray-50"
            />
            {signupAction.value?.fieldErrors?.confirmPassword && (
              <p class="text-red-500 text-sm">
                {signupAction.value.fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            class="w-full uppercase text-md font-bold"
            disabled={signupAction.isRunning}
          >
            Crear cuenta
          </Button>
        </Form>
        <footer class="lg:flex lg:justify-between">
          <Link href="/login">
            <Button look="link" class="uppercase text-sm" type="button">
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          </Link>

          <Link href="/recover-password">
            <Button look="link" class="uppercase text-sm" type="button">
              ¿Olvidaste tu contraseña?
            </Button>
          </Link>
        </footer>
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Crea tu cuenta en Mitask',
  meta: [
    {
      name: 'description',
      content: 'Crea tu cuenta en Mitask y administra tus proyectos',
    },
  ],
};
