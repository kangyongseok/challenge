import { useCallback, useMemo } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Badge, Flexbox, Icon } from 'mrcamel-ui';

import { Menu, MenuItem } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, handleClickAppDownload } from '@utils/common';

import {
  settingsTransferDataState,
  settingsTransferPlatformsState
} from '@recoil/settingsTransfer';
import { dialogState } from '@recoil/common';

function MypageSetting() {
  const router = useRouter();
  const setDialogState = useSetRecoilState(dialogState);
  const resetPlatformsState = useResetRecoilState(settingsTransferPlatformsState);
  const resetDataState = useResetRecoilState(settingsTransferDataState);

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

  const handleClickTransfer = useCallback(() => {
    resetPlatformsState();
    resetDataState();
    router.push('/mypage/settings/transfer');
  }, [resetPlatformsState, resetDataState, router]);

  const handleClickFixMessage = useCallback(() => {
    router.push('/mypage/settings/channelFixMessage');
  }, [router]);

  const settingMenu = useMemo(
    () => [
      { label: '알림 설정', isNew: false, onClick: handleClickAlarmSetting },
      { label: '차단 사용자 관리', isNew: false, onClick: handleClickBlockedUsers },
      { label: '채팅 고정 메시지 설정', isNew: true, onClick: handleClickFixMessage },
      { label: '내 상품 가져오기', isNew: true, onClick: handleClickTransfer }
    ],
    [handleClickAlarmSetting, handleClickBlockedUsers, handleClickTransfer, handleClickFixMessage]
  );

  return (
    <Menu id="mypage-setting" title="설정">
      {settingMenu.map(({ label, isNew, onClick }) => (
        <MenuItem
          key={`info-menu-${label}`}
          action={<Icon name="Arrow2RightOutlined" size="small" />}
          onClick={onClick}
        >
          <Flexbox alignment="center" gap={2}>
            {label}
            <Badge
              variant="solid"
              open={isNew}
              brandColor="red"
              text="N"
              size="xsmall"
              disablePositionAbsolute
              customStyle={{
                // TODO UI 라이브러리 개선
                width: 16,
                height: 16,
                fontWeight: 700,
                padding: '2px 0',
                justifyContent: 'center'
              }}
            />
          </Flexbox>
        </MenuItem>
      ))}
    </Menu>
  );
}

export default MypageSetting;
