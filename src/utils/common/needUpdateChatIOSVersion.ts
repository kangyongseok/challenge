import { checkAgent, getAppVersion } from '@utils/common';

export function needUpdateChatIOSVersion() {
  return checkAgent.isIOSApp() && getAppVersion() < 1148;
}
