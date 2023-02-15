import { checkAgent, getAppVersion } from '@utils/common';

export function isExtendedLayoutIOSVersion() {
  return checkAgent.isIOSApp() && getAppVersion() >= 1199;
}
