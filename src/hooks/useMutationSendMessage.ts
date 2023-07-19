import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import { PushNotificationDeliveryOption } from '@sendbird/chat/message';
import type { FileMessageCreateParams, SendableMessage } from '@sendbird/chat/lib/__definition';
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
    multipleImage,
    callback,
    failCallback,
    onPending,
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
    multipleImage?: FileMessageCreateParams[];
    userId: number;
    productId: number;
    callback?: (message: SendableMessage) => void;
    failCallback?: () => void;
    onPending?: () => void;
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

    const onFailed = () => {
      if (failCallback) failCallback();
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
            onPending,
            onSucceeded,
            onFailed
          });
          return;
        }

        if (multipleImage) {
          await Sendbird.sendFiles({
            channelUrl,
            // eslint-disable-next-line no-return-await
            paramsList: await Promise.all(
              multipleImage.map(async (a) => ({
                customType,
                pushNotificationDeliveryOption,
                file: a
              })) as FileMessageCreateParams[]
            ),
            onPending,
            onSucceeded,
            onFailed
          });
          return;
        }

        if (fileUrl) {
          await Sendbird.sendFile({
            channelUrl,
            customType,
            pushNotificationDeliveryOption,
            file: await urlToBlob(fileUrl),
            onPending,
            onSucceeded,
            onFailed
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
            onPending,
            onSucceeded,
            onFailed
          });
          return;
        }

        await Sendbird.sendMessage({
          channelUrl,
          customType,
          pushNotificationDeliveryOption,
          message: data.content,
          onPending,
          onSucceeded,
          onFailed
        });
      },
      ...options
    });
  };

  return { mutate, ...useMutationResult };
}

export default useMutationSendMessage;
