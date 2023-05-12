import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';

import type { AlarmsParams } from '@dto/user';

import Sendbird from '@library/sendbird';

import { putAlarm } from '@api/user';

import useQueryUserInfo from './useQueryUserInfo';

function useMutationPutAlarm() {
  const toastStack = useToastStack();

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
          toastStack({
            children: '설정 변경에 실패했어요. 잠시 후 다시 시도해 주세요.'
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
