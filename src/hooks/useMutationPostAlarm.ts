import { useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import type { UseMutationOptions } from 'react-query';

import type { PostAlarmData } from '@dto/user';

import Sendbird from '@library/sendbird';

import { postAlarm } from '@api/user';

import { toastState } from '@recoil/common';

import useQueryUserInfo from './useQueryUserInfo';

function useMutationPostAlarm() {
  const setToastState = useSetRecoilState(toastState);

  const { refetch: refetchUserInfo } = useQueryUserInfo();
  const { mutate: mutatePostAlarm, ...useMutationResult } = useMutation(postAlarm, {
    async onSuccess() {
      await refetchUserInfo();
    }
  });

  const mutate = async (
    data: PostAlarmData,
    options?: Omit<UseMutationOptions<void, unknown, PostAlarmData, unknown>, 'mutationFn'>,
    isUpdateNoti = false
  ) => {
    if (isUpdateNoti) {
      await Sendbird.setSnoozeNotification(!data.isChannelNoti).then((snoozePeriod) => {
        if (snoozePeriod) {
          mutatePostAlarm(data, options);
        } else {
          setToastState({
            type: 'sendbird',
            status: 'settingError'
          });
        }
      });
    } else {
      mutatePostAlarm(data, options);
    }
  };

  return { mutate, ...useMutationResult };
}

export default useMutationPostAlarm;
