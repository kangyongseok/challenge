import { useState } from 'react';

import { useSetRecoilState } from 'recoil';

import { checkAgent } from '@utils/common';

import { prevChannelAlarmPopup } from '@recoil/common';

function useOsAlarm() {
  const [openOsAlarmDialog, setOpenOsAlarmDialog] = useState(false);

  const setPrevChannelAlarmPopup = useSetRecoilState(prevChannelAlarmPopup);

  const checkOsAlarm = () => {
    window.getAuthPush = (result: string) => {
      if (!JSON.parse(result)) {
        setPrevChannelAlarmPopup(false);
        setOpenOsAlarmDialog(true);
      } else {
        setPrevChannelAlarmPopup(false);
        setOpenOsAlarmDialog(false);
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

  const handleCloseOsAlarmDialog = () => setOpenOsAlarmDialog(false);

  return { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog };
}

export default useOsAlarm;
