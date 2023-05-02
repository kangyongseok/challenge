import { useSetRecoilState } from 'recoil';

import LocalStorage from '@library/localStorage';

import { IS_FOR_ALARM_FIRST_VISIT, IS_OS_ALARM_DIALOG } from '@constants/localStorage';

import { checkAgent } from '@utils/common';

import { dialogState, prevChannelAlarmPopup } from '@recoil/common';

function useOsAlarm() {
  const setPrevChannelAlarmPopup = useSetRecoilState(prevChannelAlarmPopup);
  const setDialogState = useSetRecoilState(dialogState);
  const isForAlarmFirstVisit = LocalStorage.get<boolean>(IS_FOR_ALARM_FIRST_VISIT);

  const checkOsAlarm = () => {
    if (!LocalStorage.get(IS_OS_ALARM_DIALOG) && checkAgent.isIOSApp() && isForAlarmFirstVisit) {
      LocalStorage.set(IS_OS_ALARM_DIALOG, true);
      LocalStorage.remove(IS_FOR_ALARM_FIRST_VISIT);
      setPrevChannelAlarmPopup(false);
      setDialogState({
        type: 'osAlarm',
        disabledOnClose: true,
        secondButtonAction: () => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callAuthPush
          ) {
            window.webkit.messageHandlers.callAuthPush.postMessage(0);
          }
        }
      });
    }
  };
  return checkOsAlarm;
}

export default useOsAlarm;
