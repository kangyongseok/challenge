import { useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import type { UseMutationOptions } from 'react-query';

import { deleteNoti, postNoti } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import { toastState } from '@recoil/common';

function useMutationChannelNoti() {
  const queryClient = useQueryClient();

  const setToastState = useSetRecoilState(toastState);

  const { mutate: mutatePostNoti, ...useMutationResultPost } = useMutation(postNoti, {
    onSuccess() {
      setToastState({ type: 'channel', status: 'notiOn' });
    }
  });
  const { mutate: mutateDeleteNoti, ...useMutationResultDelete } = useMutation(deleteNoti, {
    onSuccess() {
      setToastState({ type: 'channel', status: 'notiOff' });
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
