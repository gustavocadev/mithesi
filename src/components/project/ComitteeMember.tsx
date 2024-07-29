import { component$ } from '@builder.io/qwik';
import { Form, globalAction$, z, zod$ } from '@builder.io/qwik-city';
import { Button } from '../ui/button/button';
import type { UserComitteeMember } from '~/server/services/comittee-member/types/comittee-member';
import type { User } from 'lucia';
import { LuX } from '@qwikest/icons/lucide';
import { removeOneCommitteeMember } from '~/server/services/comittee-member/comittee-member';
import { toast } from 'qwik-sonner';

export const useRemoveOneCommitteMemberAction = globalAction$(
  async (values) => {
    // delete one contributor from the project contributors
    await removeOneCommitteeMember(values.projectId, values.userId);

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
  committeeMember: UserComitteeMember;
  projectId: string;
  user: User;
};

export const ComitteeMember = component$(
  ({ committeeMember, projectId, user }: Props) => {
    const removeOneCommitteeMemberAction = useRemoveOneCommitteMemberAction();
    return (
      <div class="border-b p-5 flex justify-between items-center bg-white rounded">
        <div>
          <p>{committeeMember.name + ' ' + committeeMember.lastName}</p>
          <p class="text-sm text-gray-700">{committeeMember.email}</p>
        </div>

        {user.role === 'admin' && (
          <Form
            action={removeOneCommitteeMemberAction}
            onSubmitCompleted$={() => {
              toast.success('Miembro del jurado eliminado con éxito');
            }}
          >
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="userId" value={committeeMember.id} />

            <Button type="submit" look="ghost">
              <LuX class="size-5" />
            </Button>
          </Form>
        )}
      </div>
    );
  }
);
