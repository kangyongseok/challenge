/* eslint-disable @typescript-eslint/ban-ts-comment */
import dayjs from 'dayjs';
import type { AdminMessage, FileMessage, UserMessage } from '@sendbird/chat/message';
import { MessageType } from '@sendbird/chat/message';
import type { GroupChannel } from '@sendbird/chat/groupChannel';
import type { BaseChannel } from '@sendbird/chat';

import type { ChannelUser } from '@dto/user';
import type { ChannelHistoryManage } from '@dto/channel';

import { SUPPORTED_MIMES } from '@constants/common';
import { messageStates, productStatus } from '@constants/channel';
import attrProperty from '@constants/attrProperty';

import { truncateString } from '@utils/common';

export const getUnreadMessagesCount = (count: number): string => (count > 99 ? '+99' : `${count}`);

export const getChannelUserName = (name: string | undefined, id: number | undefined): string => {
  return name || `회원${id || ''}`;
};

export const getChannelTitle = ({
  targetUser,
  groupChannel,
  isTargetUserBlocked,
  currentUserId
}: {
  targetUser: ChannelUser | null;
  groupChannel: GroupChannel | undefined;
  isTargetUserBlocked: boolean;
  currentUserId: string;
}): string => {
  if (targetUser) {
    let suffix = '';

    if (isTargetUserBlocked) suffix = ' (차단)';

    if (targetUser.user.isDeleted) suffix = ' (탈퇴)';

    if (targetUser.user.name) return `${targetUser.user.name}${suffix}`;

    return `회원${targetUser.id}${suffix}`;
  }

  if (!groupChannel?.name && !groupChannel?.members) return 'No title';

  if (groupChannel?.name && groupChannel.name !== 'Group Channel') return groupChannel.name;

  if (groupChannel?.members?.length === 1) return '(멤버 없음)';

  return (groupChannel?.members || [])
    .filter(({ userId }) => userId !== currentUserId)
    .map(({ nickname }) => nickname || '(이름 없음)')
    .join(', ');
};

export const getLastMessageCreatedAt = (
  lastMessageManage: ChannelHistoryManage | null,
  channel: GroupChannel | undefined
): string => {
  const createdAt = channel?.lastMessage?.createdAt || lastMessageManage?.dateUpdated;

  if (!createdAt) return '';

  const dateDiff = dayjs(createdAt).diff(dayjs(), 'day');

  return dayjs(createdAt).format(dateDiff < -1 ? 'MM월 DD일' : 'A hh:mm');
};

export const getLastMessage = (channel: GroupChannel | undefined): string => {
  if (!channel?.lastMessage) return '';

  const MAXLEN = 30;
  // @ts-ignore
  const { messageType, name = '', message } = channel.lastMessage;

  return messageType === 'file' ? truncateString(name, MAXLEN) : message;
};

export const getUpdatedChannels = (
  currChannels: GroupChannel[],
  updatedChannel: GroupChannel | BaseChannel
) => {
  return JSON.parse(
    JSON.stringify(
      currChannels.map((currChannel) =>
        currChannel.url === updatedChannel.url ? updatedChannel : currChannel
      )
    )
  );
};

export const getOutgoingMessageState = (
  channel: GroupChannel | null,
  message: UserMessage | FileMessage
): string => {
  if (message.sendingStatus === 'pending') {
    return messageStates.pending;
  }

  if (message.sendingStatus === 'failed') {
    return messageStates.failed;
  }

  if (channel?.isGroupChannel?.()) {
    /* GroupChannel only */

    if ((channel as GroupChannel).getUnreadMemberCount?.(message) === 0) {
      return messageStates.read;
    }

    if ((channel as GroupChannel).getUndeliveredMemberCount?.(message) === 0) {
      return messageStates.delivered;
    }
  }

  if (message.sendingStatus === 'succeeded') {
    return messageStates.sent;
  }

  return messageStates.none;
};

export const getAppointmentDataFormat = (data: string): string =>
  `${data.substring(0, 4)}-${data.substring(4, 6)}-${data.substring(6, 8)}`;

export const getAppointmentTimeFormat = (time: string): string =>
  `${time.substring(0, 2)}:${time.substring(2, 4)}`;

export const getNotiTimeText = (notiTime: number): string => {
  if (notiTime === 0) return '알림 없음';

  if (notiTime === 60) return '1시간 전 알림';

  return `${notiTime}분 전 알림`;
};

export const isImage = (type: string): boolean => SUPPORTED_MIMES.IMAGE.indexOf(type) >= 0;
export const isVideo = (type: string): boolean => SUPPORTED_MIMES.VIDEO.indexOf(type) >= 0;
export const isGif = (type: string): boolean => type === 'image/gif';
export const isSupportedFileView = (type: string): boolean => isImage(type) || isVideo(type);
export const isAudio = (type: string): boolean => SUPPORTED_MIMES.AUDIO.indexOf(type) >= 0;

export const isAdminMessage = (message: AdminMessage | UserMessage | FileMessage): boolean =>
  !!message &&
  !!(
    message.isAdminMessage?.() ||
    (message.messageType && message.messageType === MessageType.ADMIN)
  );
export const isUserMessage = (message: AdminMessage | UserMessage | FileMessage): boolean =>
  !!message &&
  !!(
    message.isUserMessage?.() ||
    (message.messageType && message.messageType === MessageType.USER)
  );
export const isFileMessage = (message: AdminMessage | UserMessage | FileMessage): boolean =>
  !!message &&
  !!(
    message.isFileMessage?.() ||
    (message.messageType && message.messageType === MessageType.FILE)
  );

export const isOGMessage = (message: UserMessage): boolean =>
  !!(message && isUserMessage(message) && message?.ogMetaData && message?.ogMetaData?.url);
export const isTextMessage = (message: UserMessage): boolean =>
  isUserMessage(message) && !isOGMessage(message);
export const isThumbnailMessage = (message: FileMessage): boolean =>
  message && isFileMessage(message) && isSupportedFileView(message.type);
export const isImageMessage = (message: FileMessage): boolean =>
  message && isThumbnailMessage(message) && isImage(message.type);
export const isVideoMessage = (message: FileMessage): boolean =>
  message && isThumbnailMessage(message) && isVideo(message.type);
export const isGifMessage = (message: FileMessage): boolean =>
  message && isThumbnailMessage(message) && isGif(message.type);
export const isAudioMessage = (message: FileMessage): boolean =>
  message && isFileMessage(message) && isAudio(message.type);

export const getLogEventTitle = (status: number) => {
  if (productStatus[0] === productStatus[status as keyof typeof productStatus])
    return attrProperty.title.SALE;

  if (productStatus[4] === productStatus[status as keyof typeof productStatus])
    return attrProperty.title.RESERVED;

  return attrProperty.title.SOLD;
};

export const getLogEventAtt = (status: number) => {
  if (productStatus[0] === productStatus[status as keyof typeof productStatus]) return 'FORSALE';

  if (productStatus[4] === productStatus[status as keyof typeof productStatus]) return 'RESERVED';

  if (productStatus[8] === productStatus[status as keyof typeof productStatus]) return 'HIDE';

  return attrProperty.title.SOLD;
};

export const scrollIntoLast = (intialTry = 0) => {
  const MAX_TRIES = 10;
  const currentTry = intialTry;
  if (currentTry > MAX_TRIES) {
    return;
  }
  try {
    const scrollDOM = document.querySelector('.messages');

    // eslint-disable-next-line no-multi-assign
    if (scrollDOM) scrollDOM.scrollTop = scrollDOM.scrollHeight;
  } catch (error) {
    setTimeout(() => {
      scrollIntoLast(currentTry + 1);
    }, 500 * currentTry);
  }
};

// Some Ids return string and number inconsistently
// only use to comapre IDs
export const compareIds = (a: unknown, b: unknown) => {
  const isEmpty = (val: unknown) => val === null || val === undefined;

  if (isEmpty(a) || isEmpty(b)) return false;

  return String(a).toString() === String(b).toString();
};
