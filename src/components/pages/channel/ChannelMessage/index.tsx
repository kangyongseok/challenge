import { useMemo } from 'react';

import type { FileMessage, UserMessage } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import Sendbird from '@library/sendbird';

import {
  getOutgoingMessageState,
  isFileMessage,
  isOGMessage,
  isTextMessage,
  isThumbnailMessage
} from '@utils/channel';

import ChannelThumbnailMessage from './ChannelThumbnailMessage';
import ChannelTextMessage from './ChannelTextMessage';
import ChannelOGMessage from './ChannelOGMessage';
import ChannelFileMessage from './ChannelFileMessage';

interface ChannelMessageProps {
  sendbirdChannel: GroupChannel;
  message: UserMessage | FileMessage;
  nextMessage?: UserMessage | FileMessage;
}

function ChannelMessage({ sendbirdChannel: channel, message, nextMessage }: ChannelMessageProps) {
  const status = useMemo(
    () => getOutgoingMessageState(channel, message),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channel.getUnreadMemberCount?.(message), channel.getUndeliveredMemberCount?.(message)]
  );
  const isByMe =
    (message as UserMessage | FileMessage).sender.userId ===
    Sendbird.getInstance().currentUser.userId;
  const nextMessageUserIsDiff =
    (nextMessage as UserMessage | FileMessage | undefined)?.sender?.userId !==
    (message as UserMessage | FileMessage).sender.userId;

  if (isTextMessage(message as UserMessage) || isOGMessage(message as UserMessage)) {
    return (
      <>
        <ChannelTextMessage
          message={message as UserMessage}
          status={status}
          isByMe={isByMe}
          nextMessageUserIsDiff={
            isOGMessage(message as UserMessage) ? false : nextMessageUserIsDiff
          }
        />
        {isOGMessage(message as UserMessage) && (
          <ChannelOGMessage message={message as UserMessage} status={status} isByMe={isByMe} />
        )}
      </>
    );
  }

  if (isThumbnailMessage(message as FileMessage)) {
    return (
      <ChannelThumbnailMessage
        message={message as FileMessage}
        status={status}
        isByMe={isByMe}
        nextMessageUserIsDiff={nextMessageUserIsDiff}
      />
    );
  }

  if (isFileMessage(message as FileMessage)) {
    return (
      <ChannelFileMessage
        message={message as FileMessage}
        status={status}
        isByMe={isByMe}
        nextMessageUserIsDiff={nextMessageUserIsDiff}
      />
    );
  }

  return null;
}

export default ChannelMessage;