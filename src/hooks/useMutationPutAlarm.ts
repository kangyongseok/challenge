import { useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import type { UseMutationOptions } from 'react-query';

import type { AlarmsParams } from '@dto/user';

import Sendbird from '@library/sendbird';

import { putAlarm } from '@api/user';

import { toastState } from '@recoil/common';

import useQueryUserInfo from './useQueryUserInfo';

function useMutationPutAlarm() {
  const setToastState = useSetRecoilState(toastState);

  const { refetch: refetchUserInfo } = useQueryUserInfo();
  const { mutate: mutatePutAlarm, ...useMutationResult } = useMutation(putAlarm, {
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
          mutatePutAlarm(data, options);
        } else {
          setToastState({
            type: 'sendbird',
            status: 'settingError'
          });
        }
      });
    } else {
      mutatePutAlarm(data, options);
    }
  };

  return { mutate, ...useMutationResult };
}

export default useMutationPutAlarm;
