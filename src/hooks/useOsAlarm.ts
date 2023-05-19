import { useSetRecoilState } from 'recoil';

import { checkAgent } from '@utils/common';

import { dialogState, prevChannelAlarmPopup } from '@recoil/common';

function useOsAlarm() {
  const setPrevChannelAlarmPopup = useSetRecoilState(prevChannelAlarmPopup);
  const setDialogState = useSetRecoilState(dialogState);

  const checkOsAlarm = () => {
    window.getAuthPush = (result: string) => {
      if (!JSON.parse(result)) {
        setPrevChannelAlarmPopup(false);
        setDialogState({
          type: 'osAlarm',
          disabledOnClose: true,
          customStyleTitle: {
            minWidth: 270
          },
          secondButtonAction: () => {
            if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
              window.webview.moveToSetting();
            }
            if (
              checkAgent.isIOSApp() &&
              window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers.callMoveToSetting &&
              window.webkit.messageHandlers.callMoveToSetting.postMessage
            ) {
              window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
            }
          }
        });
      } else {
        setPrevChannelAlarmPopup(false);
      }
    };

    if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
      window.webview.callAuthPush();
      return;
    }

    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callAuthPush &&
      window.webkit.messageHandlers.callAuthPush.postMessage
    ) {
      window.webkit.messageHandlers.callAuthPush.postMessage(0);
    }
  };

  return checkOsAlarm;
}

export default useOsAlarm;
