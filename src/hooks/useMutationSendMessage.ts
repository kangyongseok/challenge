import { useMutation } from 'react-query';
import type { UseMutationOptions } from 'react-query';
import { PushNotificationDeliveryOption } from '@sendbird/chat/message';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import type { FileCompat } from '@sendbird/chat';

import type { PostHistoryManageData } from '@dto/channel';

import Sendbird from '@library/sendbird';

import { postHistoryManage } from '@api/channel';

import { urlToBlob } from '@utils/common';

function useMutationSendMessage() {
  const { mutate: mutatePostHistoryManage, ...useMutationResult } = useMutation(postHistoryManage);

  const mutate = async ({
    data,
    channelUrl,
    isTargetUserNoti = true,
    file,
    fileUrl,
    fileUrls,
    callback,
    options
  }: {
    data: PostHistoryManageData;
    isTargetUserNoti: boolean | undefined;
    channelUrl: string;
    file?: FileCompat | undefined;
    fileUrl?: string;
    fileUrls?: string[];
    callback?: (message: SendableMessage) => void;
    options?:
      | Omit<UseMutationOptions<void, unknown, PostHistoryManageData, unknown>, 'mutationFn'>
      | undefined;
  }) => {
    const customType = String(isTargetUserNoti ? data.channelId : 0);
    const pushNotificationDeliveryOption = isTargetUserNoti
      ? PushNotificationDeliveryOption.DEFAULT
      : PushNotificationDeliveryOption.SUPPRESS;

    const onSucceeded = (msg: SendableMessage) => {
      if (callback) callback(msg);
    };

    await mutatePostHistoryManage(data, {
      async onSuccess() {
        if (!data.content) return;

        if (file) {
          await Sendbird.sendFile({
            channelUrl,
            customType,
            pushNotificationDeliveryOption,
            file,
            onSucceeded
          });

          return;
        }

        if (fileUrl) {
          await Sendbird.sendFile({
            channelUrl,
            customType,
            pushNotificationDeliveryOption,
            file: await urlToBlob(fileUrl),
            onSucceeded
          });

          return;
        }

        if (fileUrls) {
          await Sendbird.sendFiles({
            channelUrl,
            // eslint-disable-next-line no-return-await
            paramsList: await Promise.all(
              fileUrls.map(async (url) => ({
                customType,
                pushNotificationDeliveryOption,
                file: await urlToBlob(url)
              }))
            ),
            onSucceeded
          });

          return;
        }

        await Sendbird.sendMessage({
          channelUrl,
          customType,
          pushNotificationDeliveryOption,
          message: data.content,
          onSucceeded
        });
      },
      ...options
    });
  };

  return { mutate, ...useMutationResult };
}

export default useMutationSendMessage;
