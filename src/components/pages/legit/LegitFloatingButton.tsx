import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, getAppVersion, handleClickAppDownload } from '@utils/common';

import { dialogState } from '@recoil/common';
import { camelSellerDialogStateFamily } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitFloatingButton() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const setDialogState = useSetRecoilState(dialogState);
  const setOpenCameraSetting = useSetRecoilState(camelSellerDialogStateFamily('cameraAuth'));

  const { data: accessUser } = useQueryAccessUser();

  const handleClick = useCallback(() => {
    logEvent(attrKeys.legit.CLICK_LEGIT_PROCESS, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.FLOATING
    });

    setDialogState({
      type: 'legitServiceNotice',
      customStyleTitle: { minWidth: 269 }
    });

    return;

    if (checkAgent.isIOSApp() && getAppVersion() < 1141) {
      setDialogState({
        type: 'appUpdateNotice',
        customStyleTitle: { minWidth: 269 },
        secondButtonAction: () => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callExecuteApp
          )
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
        }
      });

      return;
    }

    if (!checkAgent.isMobileApp()) {
      setDialogState({
        type: 'legitRequestOnlyInApp',
        customStyleTitle: { minWidth: 270 },
        secondButtonAction() {
          handleClickAppDownload({});
        }
      });

      return;
    }

    if (checkAgent.isAndroidApp()) {
      setDialogState({
        type: 'legitRequestOnlyInIOS',
        customStyleTitle: { minWidth: 270 }
      });

      return;
    }

    // eslint-disable-next-line no-constant-condition
    if (checkAgent.isMobileApp() && false) {
      // TODO: false 부분에 카메라 권한 체크 결과값으로 치환 필요
      // + 카메라 권한이 false 일때
      setOpenCameraSetting(({ type }) => ({
        type,
        open: true
      }));
      return;
    }

    router.push(
      accessUser
        ? { pathname: '/legit/request/selectCategory' }
        : { pathname: '/login', query: { returnUrl: '/legit/request/selectCategory' } }
    );
  }, [accessUser, router, setDialogState, setOpenCameraSetting]);

  return (
    <Wrapper onClick={handleClick}>
      <Icon name="CameraOutlined" size="medium" color={common.uiWhite} />
      <Typography variant="h4" weight="medium" customStyle={{ color: common.uiWhite }}>
        사진으로 감정신청
      </Typography>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-width: 161px;
  min-height: 44px;
  position: fixed;
  right: 20px;
  bottom: 80px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px;
  gap: 2px;
  white-space: nowrap;
  cursor: pointer;
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};
  background: linear-gradient(93.4deg, #2937ff 1.15%, #ff5260 100%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
`;

export default LegitFloatingButton;
