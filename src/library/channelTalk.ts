import type {
  ChannelTalkBootOption,
  ChannelTalkUpdateUser,
  ChannelTalkUser
} from '@typings/common';

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
  }
};

export default ChannelTalk;
