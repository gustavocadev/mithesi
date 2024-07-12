import { component$ } from '@builder.io/qwik';
import { Form, globalAction$, z, zod$ } from '@builder.io/qwik-city';
import { Button } from '../ui/button/button';
import type { UserComitteeMember } from '~/server/services/comittee-member/types/comittee-member';

export const useActionRemoveContributor = globalAction$(
  async () => {
    // delete one contributor from the project contributors
    // await removeOneContributor(values.projectId, values.userId);

    return {
      success: true,
    };
  },
  zod$({
    userId: z.string(),
    projectId: z.string(),
  })
);

type Props = {
  contributor: UserComitteeMember;
  projectId: string;
  authorId: string;
  userAuthId: string;
};

export const ComitteeMember = component$(
  ({ contributor, projectId, authorId, userAuthId }: Props) => {
    const actionRemoveContributor = useActionRemoveContributor();
    return (
      <div class="border-b p-5 flex justify-between items-center bg-white rounded">
        <div>
          <p>{contributor.name}</p>
          <p class="text-sm text-gray-700">{contributor.email}</p>
        </div>

        {authorId === userAuthId && (
          <Form action={actionRemoveContributor}>
            <input type="hidden" name="projectId" value={projectId} />

            <input type="hidden" name="userId" value={contributor.id} />

            <Button type="submit" look="destructive">
              Eliminar
            </Button>
          </Form>
        )}
      </div>
    );
  }
);
