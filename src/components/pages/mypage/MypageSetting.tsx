import { useCallback, useMemo } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, handleClickAppDownload } from '@utils/common';

import { dialogState } from '@recoil/common';

function MypageSetting() {
  const router = useRouter();
  const setDialogState = useSetRecoilState(dialogState);

  const handleClickAlarmSetting = useCallback(() => {
    if (!checkAgent.isMobileApp()) {
      setDialogState({
        type: 'featureIsMobileAppDown',
        customStyleTitle: { minWidth: 311 },
        secondButtonAction() {
          handleClickAppDownload({});
        }
      });
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
  }, [router, setDialogState]);

  const handleClickBlockedUsers = useCallback(() => {
    logEvent(attrKeys.mypage.CLICK_BLOCK_LIST, { name: attrProperty.name.MY });
    router.push('/mypage/settings/blockedUsers');
  }, [router]);

  const settingMenu = useMemo(
    () => [
      { label: '알림 설정', onClick: handleClickAlarmSetting },
      { label: '차단 사용자 관리', onClick: handleClickBlockedUsers }
    ],
    [handleClickAlarmSetting, handleClickBlockedUsers]
  );

  return (
    <Menu id="mypage-setting" title="설정">
      {settingMenu.map(({ label, onClick }) => (
        <MenuItem
          key={`info-menu-${label}`}
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={onClick}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default MypageSetting;
