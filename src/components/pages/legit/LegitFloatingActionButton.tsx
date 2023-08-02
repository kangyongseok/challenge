import { useEffect, useRef, useState } from 'react';

import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Typography } from '@mrcamelhub/camel-ui';
import { useTheme } from '@emotion/react';

import { AppUpdateNoticeDialog, LegitRequestOnlyInAppDialog } from '@components/UI/organisms';
import { FloatingActionButton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { SAVED_LEGIT_REQUEST } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import { legitRequestState } from '@recoil/legitRequest';
import { loginBottomSheetState } from '@recoil/common';
import useSession from '@hooks/useSession';
import useQueryUserData from '@hooks/useQueryUserData';

function LegitFloatingActionButton() {
  const router = useRouter();

  const {
    palette: { secondary, common }
  } = useTheme();

  const [open, setOpen] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openIOSNoticeDialog, setOpenIOSNoticeDialog] = useState(false);
  const [openAOSNoticeDialog, setOpenAOSNoticeDialog] = useState(false);

  const openTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const resetLegitRequestState = useResetRecoilState(legitRequestState);

  const { isLoggedIn } = useSession();
  const { data: userData, remove: removeUserDate } = useQueryUserData();

  const handleClick = () => {
    logEvent(attrKeys.legit.CLICK_LEGIT_PROCESS, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.FLOATING
    });

    if (!checkAgent.isMobileApp()) {
      setOpenDialog(true);
      return;
    }

    if (isNeedUpdateImageUploadIOSVersion()) {
      setOpenIOSNoticeDialog(true);
      return;
    }

    if (isNeedUpdateImageUploadAOSVersion()) {
      setOpenAOSNoticeDialog(true);
      return;
    }

    // 매물등록 후 사진감정 신청 중단한 케이스 있을 경우 초기화
    if (userData?.[SAVED_LEGIT_REQUEST]?.state?.productId) removeUserDate(SAVED_LEGIT_REQUEST);

    if (!isLoggedIn) {
      setLoginBottomSheet({ open: true, returnUrl: '' });
      return;
    }

    resetLegitRequestState();

    router.push({ pathname: '/legit/request/selectCategory' });
  };

  const handleClickIOSAppUpdateNoticeDialog = () => {
    if (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callExecuteApp
    )
      window.webkit.messageHandlers.callExecuteApp.postMessage(
        'itms-apps://itunes.apple.com/app/id1541101835'
      );
  };

  const handleClickAOSAppUpdateNoticeDialog = () => {
    if (window.webview && window.webview.callExecuteApp)
      window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
  };

  useEffect(() => {
    if (open)
      openTimerRef.current = setTimeout(() => {
        setOpen(false);
      }, 3000);

    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, [open]);

  return (
    <>
      <FloatingActionButton
        iconName="LegitOutlined"
        text="사진감정"
        bottom={20}
        onClick={handleClick}
        tooltip={{
          open,
          message: (
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
          )
        }}
      />
      <LegitRequestOnlyInAppDialog open={openDialog} onClose={() => setOpenDialog(false)} />
      <AppUpdateNoticeDialog
        open={openIOSNoticeDialog}
        onClose={() => setOpenIOSNoticeDialog(false)}
        onClick={handleClickIOSAppUpdateNoticeDialog}
      />
      <AppUpdateNoticeDialog
        open={openAOSNoticeDialog}
        onClose={() => setOpenAOSNoticeDialog(false)}
        onClick={handleClickAOSAppUpdateNoticeDialog}
      />
    </>
  );
}

export default LegitFloatingActionButton;
