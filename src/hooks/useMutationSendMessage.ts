import { useMutation } from 'react-query';
import type { UseMutationOptions } from 'react-query';
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
    file,
    fileUrl,
    fileUrls,
    callback,
    options
  }: {
    data: PostHistoryManageData;
    channelUrl: string;
    file?: FileCompat | undefined;
    fileUrl?: string;
    fileUrls?: string[];
    callback?: (message: SendableMessage) => void;
    options?:
      | Omit<UseMutationOptions<void, unknown, PostHistoryManageData, unknown>, 'mutationFn'>
      | undefined;
  }) => {
    const onSucceeded = (msg: SendableMessage) => {
      if (callback) callback(msg);
    };

    await mutatePostHistoryManage(data, {
      async onSuccess() {
        if (!data.content) return;

        if (file) {
          await Sendbird.sendFile({
            channelUrl,
            file,
            onSucceeded
          });

          return;
        }

        if (fileUrls) {
          await Sendbird.sendFiles({
            channelUrl,
            // eslint-disable-next-line no-return-await
            paramsList: await Promise.all(
              fileUrls.map(async (url) => ({ file: await urlToBlob(url) }))
            ),
            onSucceeded
          });

          return;
        }

        if (fileUrl) {
          await Sendbird.sendFile({
            channelUrl,
            file: await urlToBlob(fileUrl),
            onSucceeded
          });

          return;
        }

        await Sendbird.sendMessage({
          channelUrl,
          newMessage: data.content,
          onSucceeded
        });
      },
      ...options
    });
  };

  return { mutate, ...useMutationResult };
}

export default useMutationSendMessage;
