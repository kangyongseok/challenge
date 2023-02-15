import { checkAgent, getAppVersion, isProduction } from '@utils/common';

export function isNeedUpdateImageUploadIOSVersion(version = 1147) {
  return checkAgent.isIOSApp() && getAppVersion() < version && isProduction;
}
