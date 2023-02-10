import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Icon, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import {
  CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE,
  SAVED_CAMEL_SELLER_PRODUCT_DATA,
  SOURCE
} from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import type { SaveCamelSellerProductData } from '@typings/camelSeller';
import { dialogState } from '@recoil/common';
import {
  camelSellerDialogStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { FloatingButton, Wrapper } from './CamelSellerFloatingButton.style';

function CamelSellerFloatingButton({ source }: { source: string }) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setDialogState = useSetRecoilState(dialogState);
  const setContinueDialog = useSetRecoilState(camelSellerDialogStateFamily('continue'));
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetHasOpenedSurveyBottomSheetState = useResetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );
  const resetSurveyState = useResetRecoilState(camelSellerSurveyState);

  const { data: { notProcessedLegitCount = 0 } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo
  );
  const triggered = useReverseScrollTrigger();

  /**
   *
   * @prevStep 임시저장한 매물등록
   * @SOURCE 판매등록하기의 진입점 (홈, 마이, 상점)
   */
  const handleClickMoveToCamelSeller = () => {
    const savedCamelSellerProductData = LocalStorage.get<SaveCamelSellerProductData>(
      SAVED_CAMEL_SELLER_PRODUCT_DATA
    );
    LocalStorage.set(SOURCE, source);

    const getName = () => {
      if (router.pathname === '/') return attrProperty.name.MAIN;
      if (router.pathname === '/mypage') return attrProperty.name.MY;
      if (router.pathname === '/user/shop') return attrProperty.name.MY_STORE;
      return '';
    };

    const getTitle = () => {
      if (router.pathname === '/') return attrProperty.title.MAIN_FLAOTING;
      if (router.pathname === '/mypage') return attrProperty.title.MY_FLOATING;
      if (router.pathname === '/user/shop') return attrProperty.title.MY_STORE_FLOATING;
      return '';
    };

    logEvent(attrKeys.camelSeller.CLICK_NEWPRODUCT, {
      name: getName(),
      title: getTitle()
    });

    // 개발 모드에서는 모웹에서도 테스트하기 위해 분기처리
    if (process.env.NODE_ENV !== 'development') {
      if (!(checkAgent.isIOSApp() || checkAgent.isAndroidApp())) {
        setOpenAppDown(({ type }) => ({
          type,
          open: true
        }));
        return;
      }

      if (isNeedUpdateImageUploadIOSVersion(1151)) {
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

      if (isNeedUpdateImageUploadAOSVersion(1147)) {
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

      if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
        window.getAuthCamera = (result: boolean) => {
          if (!result) {
            setDialogState({
              type: 'appAuthCheck',
              customStyleTitle: { minWidth: 269, marginTop: 12 },
              firstButtonAction: () => {
                if (
                  checkAgent.isIOSApp() &&
                  window.webkit &&
                  window.webkit.messageHandlers &&
                  window.webkit.messageHandlers.callMoveToSetting &&
                  window.webkit.messageHandlers.callMoveToSetting.postMessage
                ) {
                  window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
                }
                if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
                  window.webview.moveToSetting();
                }
              }
            });
          }
        };
      }
    }

    // 이어하기 다이얼로그 띄우는 조건
    if (
      accessUser &&
      savedCamelSellerProductData &&
      savedCamelSellerProductData[accessUser.snsType]
    ) {
      setContinueDialog(({ type }) => ({ type, open: true }));
      return;
    }

    resetTempData();
    resetSurveyState();
    resetHasOpenedSurveyBottomSheetState();
    SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);

    if (!LocalStorage.get(CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE)) {
      router.push('/camelSeller/guide');
    } else {
      router.push('/camelSeller/registerConfirm');
    }
  };

  return (
    <>
      <Wrapper
        onClick={handleClickMoveToCamelSeller}
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <FloatingButton triggered={triggered}>
          <Typography variant="h3" weight="medium" customStyle={{ color: common.uiWhite }}>
            판매하기
          </Typography>
          <Icon name="PlusOutlined" size="medium" color={common.uiWhite} />
        </FloatingButton>
      </Wrapper>
      <Wrapper
        onClick={handleClickMoveToCamelSeller}
        isLegitTooltip={!!notProcessedLegitCount && router.pathname === '/'}
        isUserShop={router.pathname === '/user/shop'}
      >
        <FloatingButton triggered={triggered} onlyIcon>
          <Icon name="PlusOutlined" size="medium" color={common.uiWhite} />
        </FloatingButton>
      </Wrapper>
    </>
  );
}

export default CamelSellerFloatingButton;
