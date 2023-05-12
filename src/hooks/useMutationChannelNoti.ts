import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';

import { deleteNoti, postNoti } from '@api/channel';

import queryKeys from '@constants/queryKeys';

function useMutationChannelNoti() {
  const queryClient = useQueryClient();

  const toastStack = useToastStack();

  const { mutate: mutatePostNoti, ...useMutationResultPost } = useMutation(postNoti, {
    onSuccess() {
      toastStack({
        children: '채팅 알림을 받아요.'
      });
    }
  });
  const { mutate: mutateDeleteNoti, ...useMutationResultDelete } = useMutation(deleteNoti, {
    onSuccess() {
      toastStack({
        children: '채팅 알림을 받지 않아요.'
      });
    }
  });

  const postMutate = async (
    channelId: number,
    options?: Omit<UseMutationOptions<void, unknown, number, unknown>, 'mutationFn'>
  ) => {
    mutatePostNoti(channelId, {
      onSuccess() {
        queryClient.invalidateQueries(queryKeys.channels.channel(channelId));
      },
      ...options
    });
  };

  const deleteMutate = async (
    channelId: number,
    options?: Omit<UseMutationOptions<void, unknown, number, unknown>, 'mutationFn'>
  ) => {
    mutateDeleteNoti(channelId, {
      onSuccess() {
        queryClient.invalidateQueries(queryKeys.channels.channel(channelId));
      },
      ...options
    });
  };

  return {
    notiOn: {
      mutate: postMutate,
      ...useMutationResultPost
    },
    notiOff: {
      mutate: deleteMutate,
      ...useMutationResultDelete
    }
  };
}

export default useMutationChannelNoti;
