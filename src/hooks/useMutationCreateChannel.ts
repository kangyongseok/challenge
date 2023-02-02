import { useRecoilValue, useSetRecoilState } from 'recoil';
import type { UseMutationOptions } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';

import type { PostChannelData } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { postChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';

import { checkAgent } from '@utils/common';

import type { CreateChannelParams } from '@typings/channel';
import { toastState } from '@recoil/common';
import { sendbirdState } from '@recoil/channel';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useInitializeSendbird from '@hooks/useInitializeSendbird';

function useMutationCreateChannel() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const state = useRecoilValue(sendbirdState);
  const setToastState = useSetRecoilState(toastState);

  const { userId, userNickName, userImageProfile } = useQueryMyUserInfo();
  const initializeSendbird = useInitializeSendbird();

  const { mutate: mutatePostChannel, ...useMutationResult } = useMutation(postChannel);

  const mutate = async (
    params: CreateChannelParams,
    options?: Omit<UseMutationOptions<number, unknown, PostChannelData, unknown>, 'mutationFn'>
  ) => {
    if (!!userId && !state.initialized) {
      await initializeSendbird(userId.toString(), userNickName, userImageProfile);
    }

    await Sendbird.createChannel(params).then(([groupChannel]) => {
      if (groupChannel) {
        mutatePostChannel(
          {
            productId: +params.productId,
            externalId: groupChannel.url
          },
          {
            async onSuccess(channelId) {
              await groupChannel.createMetaData({ ...params, channelId: String(channelId) });

              queryClient.invalidateQueries(
                queryKeys.products.product({ productId: +params.productId })
              );

              if (checkAgent.isIOSApp()) {
                window.webkit?.messageHandlers?.callChannel?.postMessage?.(
                  `/channels/${channelId}`
                );
              } else {
                router.push(`/channels/${channelId}`);
              }
            },
            onError() {
              setToastState({ type: 'channel', status: 'createFail' });
            },
            ...options
          }
        );
      } else {
        setToastState({ type: 'sendbird', status: 'createFail' });
      }
    });
  };

  return { mutate, ...useMutationResult };
}

export default useMutationCreateChannel;
