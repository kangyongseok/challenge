import { useCallback, useEffect, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchUserLegitTargets } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { SAVED_LEGIT_REQUEST } from '@constants/localStorage';
import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  handleClickAppDownload,
  isExtendedLayoutIOSVersion,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { legitRequestState } from '@recoil/legitRequest';
import { legitOpenRecommendBottomSheetState } from '@recoil/legit';
import { dialogState, loginBottomSheetState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useOsAlarm from '@hooks/useOsAlarm';

function LegitFloatingButton() {
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();
  const router = useRouter();

  const [openLegitRecommendBottomSheet, setOpenLegitRecommendBottomSheet] = useRecoilState(
    legitOpenRecommendBottomSheetState
  );
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const resetLegitRequestState = useResetRecoilState(legitRequestState);
  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();
  const { data: userData, remove: removeUserDate } = useQueryUserData();
  const setOsAlarm = useOsAlarm();

  const { isSuccess } = useQuery(queryKeys.users.userLegitTargets(), fetchUserLegitTargets, {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const [open, setOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggered = useReverseScrollTrigger();

  const handleClick = useCallback(() => {
    logEvent(attrKeys.legit.CLICK_LEGIT_PROCESS, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.FLOATING
    });

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

    if (isNeedUpdateImageUploadIOSVersion()) {
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

    if (isNeedUpdateImageUploadAOSVersion()) {
      setDialogState({
        type: 'appUpdateNotice',
        customStyleTitle: { minWidth: 269 },
        secondButtonAction: () => {
          if (window.webview && window.webview.callExecuteApp)
            window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
        }
      });

      return;
    }

    // 매물등록 후 사진감정 신청 중단한 케이스 있을 경우 초기화
    if (userData?.[SAVED_LEGIT_REQUEST]?.state?.productId) removeUserDate(SAVED_LEGIT_REQUEST);

    if (!accessUser) {
      setLoginBottomSheet({ open: true, returnUrl: '' });
      return;
    }

    setOsAlarm();
    resetLegitRequestState();

    router.push({ pathname: '/legit/request/selectCategory' });
  }, [
    userData,
    removeUserDate,
    setOsAlarm,
    resetLegitRequestState,
    accessUser,
    router,
    setDialogState,
    setLoginBottomSheet
  ]);

  useEffect(() => {
    if (accessUser && isSuccess && !openLegitRecommendBottomSheet) {
      setOpen(true);
    } else if (!accessUser) {
      setOpen(true);
    }
  }, [accessUser, isSuccess, openLegitRecommendBottomSheet]);

  useEffect(() => {
    if (open && !openLegitRecommendBottomSheet)
      openTimerRef.current = setTimeout(() => {
        setOpen(false);
      }, 3000);

    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, [open, openLegitRecommendBottomSheet]);

  useEffect(() => {
    return () => {
      setOpenLegitRecommendBottomSheet(false);
    };
  }, [setOpenLegitRecommendBottomSheet]);

  return (
    <>
      <Wrapper onClick={handleClick}>
        <Tooltip
          open={open}
          message={
            <Typography
              variant="body2"
              weight="medium"
              customStyle={{
                color: common.uiWhite,
                '& > strong': { color: secondary.red.light }
              }}
            >
              😎 <strong>무료진행</strong>중입니다!
            </Typography>
          }
          customStyle={{
            top: 'auto',
            bottom: 10
          }}
        >
          <LegitButton triggered={triggered}>
            <Typography variant="h3" weight="medium" customStyle={{ color: common.uiWhite }}>
              사진감정
            </Typography>
            <Icon name="LegitFilled" size="medium" color={common.uiWhite} />
          </LegitButton>
        </Tooltip>
      </Wrapper>
      <Wrapper onClick={handleClick}>
        <Tooltip
          open={open}
          message={
            <Typography
              variant="body2"
              weight="medium"
              customStyle={{
                color: common.uiWhite,
                '& > strong': { color: secondary.red.light }
              }}
            >
              😎 <strong>무료진행</strong>중입니다!
            </Typography>
          }
          customStyle={{
            top: 'auto',
            bottom: 10
          }}
        >
          <LegitButton triggered={triggered} onlyIcon>
            <Icon name="LegitFilled" size="medium" color={common.uiWhite} />
          </LegitButton>
        </Tooltip>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'} + 80px);
  transform: translateX(-50%);
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 2};
`;

const LegitButton = styled.button<{ triggered: boolean; onlyIcon?: boolean }>`
  width: ${({ onlyIcon }) => {
    if (onlyIcon) {
      return 52;
    }
    return 121;
  }}px;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  opacity: ${({ triggered, onlyIcon }) => {
    if (!triggered && onlyIcon) {
      return 1;
    }
    if (triggered && onlyIcon) {
      return 0;
    }
    if (triggered) {
      return 1;
    }
    return 0;
  }};
  white-space: nowrap;
  transition: ${({ triggered, onlyIcon }) => {
    if (!triggered && onlyIcon) {
      return 'transform 0.3s, scale 0.3s, opacity 0.4s';
    }
    if (triggered && onlyIcon) {
      return 'transform 0.5s, scale 0.5s, opacity 0.3s';
    }
    if (triggered) {
      return 'transform 0.3s, scale 0.3s, opacity 0.4s';
    }
    return 'transform 0.5s, scale 0.5s, opacity 0.3s';
  }};
  transform: ${({ triggered, onlyIcon }) => {
    if (!triggered && onlyIcon) {
      return 'scale(1, 1)';
    }
    if (triggered && onlyIcon) {
      return 'scale(0, 1)';
    }
    if (triggered) {
      return 'scale(1, 1)';
    }
    return 'scale(0, 1)';
  }};
  background: linear-gradient(285.02deg, #111214 57.69%, #5e6066 100%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-radius: 26px;
`;

export default LegitFloatingButton;
