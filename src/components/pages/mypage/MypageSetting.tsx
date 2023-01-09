import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { checkAgent, handleClickAppDownload } from '@utils/common';

import { dialogState } from '@recoil/common';

function MypageSetting() {
  const router = useRouter();
  const setDialogState = useSetRecoilState(dialogState);

  const appDownLoadDialog = () => {
    setDialogState({
      type: 'featureIsMobileAppDown',
      customStyleTitle: { minWidth: 311 },
      secondButtonAction() {
        handleClickAppDownload({});
      }
    });
  };

  const handleClickAlarmSetting = () => {
    if (!checkAgent.isMobileApp()) {
      appDownLoadDialog();
      return;
    }
    if (checkAgent.isAndroidApp() && window.webview && window.webview.callAuthPush) {
      window.webview.callAuthPush();
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

    window.getAuthPush = (result: string) => {
      router.push(`/mypage/settings/alarm?setting=${result}`);
    };
  };

  return (
    <Menu id="mypage-setting" title="설정">
      {[
        { label: '알림 설정', url: '/mypage/settings/alarm', handleClick: handleClickAlarmSetting },
        { label: '차단 사용자 관리', url: '/mypage/settings/blockedUsers' }
      ].map(({ label, url, handleClick }) => (
        <MenuItem
          key={`info-menu-${label}`}
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={() => {
            if (handleClick) {
              handleClick();
              return;
            }
            router.push(url);
          }}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default MypageSetting;
