import { atom, atomFamily } from 'recoil';
import type { GroupChannel } from '@sendbird/chat/groupChannel';

import LocalStorage from '@library/localStorage';

import { IS_CHECKED_RECEIVED_MESSAGE_FILTER } from '@constants/localStorage';

import { checkAgent } from '@utils/common';

export type SendbirdState = {
  initialized: boolean;
  loading: boolean;
  allChannels: GroupChannel[];
  receivedChannels: GroupChannel[];
  sendChannels: GroupChannel[];
  typingChannels: GroupChannel[];
  unreadMessagesCount: number;
};

export const sendbirdState = atom<SendbirdState>({
  key: 'sendbirdState',
  default: {
    initialized: false,
    loading: false,
    allChannels: [],
    receivedChannels: [],
    sendChannels: [],
    typingChannels: [],
    unreadMessagesCount: 0
  }
});

export const channelBottomSheetStateFamily = atomFamily<
  {
    open: boolean;
    isChannel: boolean;
  },
  'more' | 'productStatus'
>({
  key: 'channel/bottomSheetStateFamily',
  default: {
    open: false,
    isChannel: true
  },
  effects: [
    ({ onSet }) => {
      onSet(({ open, isChannel }, _, isReset) => {
        if (checkAgent.isIOSApp() && isChannel) {
          if (open || isReset) {
            window.webkit?.messageHandlers?.callInputHide?.postMessage?.(0);
          } else {
            window.webkit?.messageHandlers?.callInputShow?.postMessage?.(0);
          }
        }
      });
    }
  ]
});

export const channelReceivedMessageFilteredState = atom({
  key: 'channel/receivedMessageFilteredState',
  default: false,
  effects: [
    ({ onSet, setSelf }) => {
      setSelf(LocalStorage.get<boolean>(IS_CHECKED_RECEIVED_MESSAGE_FILTER) ?? false);
      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(IS_CHECKED_RECEIVED_MESSAGE_FILTER);
        } else {
          LocalStorage.set(IS_CHECKED_RECEIVED_MESSAGE_FILTER, newValue);
        }
      });
    }
  ]
});

export const channelThumbnailMessageImageState = atom({
  key: 'channel/thumbnailMessageImageState',
  default: ''
});