import { keys } from 'lodash-es';

import type { AccessUser } from '@dto/userAuth';

import { checkAgent } from '@utils/common';

export default function updateAccessUserOnBraze(accessUser: AccessUser) {
  if (keys(accessUser).length > 0 && accessUser.userId) {
    if (checkAgent.isAndroidApp()) {
      if (window.webview.callSetLoginUser) {
        window.webview.callSetLoginUser(JSON.stringify(accessUser));
      }
    }
    if (checkAgent.isIOSApp()) {
      if (
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callSetLoginUser &&
        window.webkit.messageHandlers.callSetLoginUser.postMessage
      ) {
        window.webkit.messageHandlers.callSetLoginUser.postMessage(JSON.stringify(accessUser));
      }
    }
  }
}
