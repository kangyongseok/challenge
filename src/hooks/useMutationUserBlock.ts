import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import Sendbird from '@library/sendbird';

import { deleteBlock, postBlock } from '@api/user';

function useMutationUserBlock() {
  const { mutate: mutatePostBlock, ...useMutationResultPost } = useMutation(postBlock);
  const { mutate: mutateDeleteBlock, ...useMutationResultDelete } = useMutation(deleteBlock);

  const postMutate = async (
    userId: number,
    options?: Omit<UseMutationOptions<void, unknown, number, unknown>, 'mutationFn'>
  ) => {
    await Sendbird.setBlockUser(String(userId), true).then(() => {
      mutatePostBlock(userId, options);
    });
  };

  const deleteMutate = async (
    userId: number,
    options?: Omit<UseMutationOptions<void, unknown, number, unknown>, 'mutationFn'>
  ) => {
    await Sendbird.setBlockUser(String(userId), false).then(() => {
      mutateDeleteBlock(userId, options);
    });
  };

  return {
    block: {
      mutate: postMutate,
      ...useMutationResultPost
    },
    unblock: {
      mutate: deleteMutate,
      ...useMutationResultDelete
    }
  };
}

export default useMutationUserBlock;
