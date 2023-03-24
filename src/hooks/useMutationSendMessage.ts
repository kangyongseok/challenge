import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { PushNotificationDeliveryOption } from '@sendbird/chat/message';
import type { SendableMessage } from '@sendbird/chat/lib/__definition';
import type { FileCompat } from '@sendbird/chat';

import type { PostHistoryManageData } from '@dto/channel';

import Sendbird from '@library/sendbird';
import { logEvent } from '@library/amplitude';

import { postHistoryManage } from '@api/channel';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { urlToBlob } from '@utils/common';

interface UseMutationSendMessageProps {
  lastMessageIndex?: number;
}

function useMutationSendMessage({ lastMessageIndex }: UseMutationSendMessageProps) {
  const { mutate: mutatePostHistoryManage, ...useMutationResult } = useMutation(postHistoryManage);

  const mutate = async ({
    data,
    channelUrl,
    isTargetUserNoti = true,
    file,
    fileUrl,
    fileUrls,
    callback,
    options,
    userId,
    productId
  }: {
    data: PostHistoryManageData;
    isTargetUserNoti: boolean | undefined;
    channelUrl: string;
    file?: FileCompat | undefined;
    fileUrl?: string;
    fileUrls?: string[];
    userId: number;
    productId: number;
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
      logEvent(attrKeys.channel.SUBMIT_MESSAGE, {
        name: attrProperty.name.CHANNEL_DETAIL,
        att: 'USER',
        channelId: data.channelId,
        message: fileUrl || data.content,
        userId,
        productId,
        createdAt: dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm'),
        index: lastMessageIndex
      });
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
