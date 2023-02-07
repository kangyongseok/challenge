import { useSetRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import type { AlarmsParams } from '@dto/user';

import Sendbird from '@library/sendbird';

import { putAlarm } from '@api/user';

import { toastState } from '@recoil/common';

import useQueryUserInfo from './useQueryUserInfo';

function useMutationPostAlarm() {
  const setToastState = useSetRecoilState(toastState);

  const { refetch: refetchUserInfo } = useQueryUserInfo();
  const { mutate: mutatePostAlarm, ...useMutationResult } = useMutation(putAlarm, {
    async onSuccess() {
      await refetchUserInfo();
    }
  });

  const mutate = async (
    data: AlarmsParams,
    options?: Omit<UseMutationOptions<void, unknown, AlarmsParams, unknown>, 'mutationFn'>,
    isUpdateNoti = false
  ) => {
    if (isUpdateNoti) {
      await Sendbird.setSnoozeNotification(!data.isNotiChannel).then((snoozePeriod) => {
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
