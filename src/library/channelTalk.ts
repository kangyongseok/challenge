import { findChannelTalkButtonElement } from '@utils/common';

import type {
  ChannelTalkBootOption,
  ChannelTalkUpdateUser,
  ChannelTalkUser
} from '@typings/common';

let channelTalkCoreElement: HTMLDivElement;

const ChannelTalk = {
  boot(option: ChannelTalkBootOption, callback?: (error: boolean, user: ChannelTalkUser) => void) {
    if (window.ChannelIO) window.ChannelIO('boot', option, callback);
  },
  updateUser(
    option: ChannelTalkUpdateUser,
    callback?: (error: boolean, user: ChannelTalkUser) => void
  ) {
    if (window.ChannelIO) window.ChannelIO('updateUser', option, callback);
  },
  showMessenger() {
    if (window.ChannelIO) window.ChannelIO('showMessenger');
  },
  hideMessenger() {
    if (window.ChannelIO) window.ChannelIO('hideMessenger');
  },
  showChannelButton() {
    if (window.ChannelIO) window.ChannelIO('showChannelButton');
  },
  hideChannelButton() {
    if (window.ChannelIO) window.ChannelIO('hideChannelButton');
  },
  onShowMessenger(callback: () => void) {
    if (window.ChannelIO) window.ChannelIO('onShowMessenger', callback);
  },
  onHideMessenger(callback: () => void) {
    if (window.ChannelIO) window.ChannelIO('onHideMessenger', callback);
  },
  clearCallbacks() {
    if (window.ChannelIO) window.ChannelIO('clearCallbacks');
  },
  moveChannelButtonPosition(moveTo: number) {
    if (!channelTalkCoreElement) {
      findChannelTalkButtonElement().then((element) => {
        if (element) {
          channelTalkCoreElement = element;
          element.setAttribute(
            'style',
            `
          transition: transform .1s ease-in;
          transform: translate(0, ${moveTo}px);
        `
          );
        }
      });
    } else {
      channelTalkCoreElement.setAttribute(
        'style',
        `
          transition: transform .1s ease-in;
          transform: translate(0, ${moveTo}px);
        `
      );
    }
  },
  resetChannelButtonPosition() {
    if (!channelTalkCoreElement) {
      findChannelTalkButtonElement().then((element) => {
        if (element) {
          element.setAttribute('style', 'transition: transform .1s ease-in');
        }
      });
    } else {
      channelTalkCoreElement.setAttribute('style', 'transition: transform .1s ease-in');
    }
  }
};

export default ChannelTalk;
