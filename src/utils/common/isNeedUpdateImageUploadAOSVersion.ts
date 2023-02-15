import { checkAgent, getAppVersion, isProduction } from '@utils/common';

export function isNeedUpdateImageUploadAOSVersion(version = 1145) {
  return checkAgent.isAndroidApp() && getAppVersion() < version && isProduction;
}
