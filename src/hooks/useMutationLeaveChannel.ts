import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postLeave } from '@api/channel';

import queryKeys from '@constants/queryKeys';
import { channelType } from '@constants/channel';

function useMutationLeaveChannel() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const useMutationResult = useMutation(postLeave, {
    onSuccess() {
      if (router.pathname === '/channels/[id]') {
        queryClient.invalidateQueries(queryKeys.channels.channels({ type: 0, size: 20 }));

        if (window.history.length > 2) {
          router.back();
          return;
        }

        router.replace({
          pathname: '/channels',
          query: { type: 0 }
        });
      } else {
        const type = Number(router.query.type || '') as keyof typeof channelType;

        queryClient.invalidateQueries(
          queryKeys.channels.channels({ type, size: type === 1 ? 100 : 20 })
        );
      }
    }
  });

  return useMutationResult;
}

export default useMutationLeaveChannel;
