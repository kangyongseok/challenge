import { checkAgent, getAppVersion } from '@utils/common';

export function needUpdateSafePaymentIOSVersion() {
  return checkAgent.isIOSApp() && getAppVersion() < 1153;
}
