import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import {
  CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE,
  SAVED_CAMEL_SELLER_PRODUCT_DATA,
  SOURCE
} from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import {
  checkAgent,
  isNeedUpdateImageUploadAOSVersion,
  isNeedUpdateImageUploadIOSVersion
} from '@utils/common';

import type { SaveCamelSellerProductData } from '@typings/camelSeller';
import {
  camelSellerAppUpdateDialogOpenState,
  dialogState,
  loginBottomSheetState
} from '@recoil/common';
import {
  camelSellerDialogStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface UseMoveCamelSellerProps {
  attributes: {
    name: string;
    title: string;
    source: string;
    [key: string]: string | string[] | number | boolean | null | undefined;
  };
}

export default function useMoveCamelSeller({
  attributes: { name, title, source, ...otherAttributes }
}: UseMoveCamelSellerProps) {
  const router = useRouter();

  const setOpenAppDown = useSetRecoilState(camelSellerDialogStateFamily('nonMemberAppdown'));
  const setOpenAppUpdateDialogState = useSetRecoilState(camelSellerAppUpdateDialogOpenState);
  const setOpenLoginBottomSheetState = useSetRecoilState(loginBottomSheetState);
  const setDialogState = useSetRecoilState(dialogState);
  const setContinueDialog = useSetRecoilState(camelSellerDialogStateFamily('continue'));
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetHasOpenedSurveyBottomSheetState = useResetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );
  const resetSurveyState = useResetRecoilState(camelSellerSurveyState);

  const { data: accessUser } = useQueryAccessUser();

  const handleClick = () => {
    LocalStorage.set(SOURCE, source);

    logEvent(attrKeys.camelSeller.CLICK_NEWPRODUCT, {
      name,
      title,
      ...otherAttributes
    });

    if (!checkAgent.isIOSApp() && !checkAgent.isAndroidApp()) {
      setOpenAppDown(({ type }) => ({
        type,
        open: true
      }));
      return;
    }

    if (isNeedUpdateImageUploadIOSVersion(1151)) {
      setOpenAppUpdateDialogState(true);
      return;
    }

    if (isNeedUpdateImageUploadAOSVersion(1147)) {
      setOpenAppUpdateDialogState(true);
      return;
    }

    const checkedProductPhotoUploadGuide = LocalStorage.get(CHECKED_PRODUCT_PHOTO_UPLOAD_GUIDE);

    if (!accessUser) {
      // setOpenLoginBottomSheetState({
      //   open: true,
      //   returnUrl: checkedProductPhotoUploadGuide
      //     ? '/camelSeller/registerConfirm'
      //     : // : '/camelSeller/guide'
      //       '/events/camelSellerEvent'
      // });
      setOpenLoginBottomSheetState({
        open: true,
        returnUrl: '/events/camelSellerEvent?login=true'
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

    const savedCamelSellerProductData = LocalStorage.get<SaveCamelSellerProductData>(
      SAVED_CAMEL_SELLER_PRODUCT_DATA
    );

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

    if (checkedProductPhotoUploadGuide) {
      if (router.query.banner) {
        router.replace('/camelSeller/registerConfirm');
      } else {
        router.push('/camelSeller/registerConfirm');
      }
    } else {
      // router.push('/camelSeller/guide');
      router.push('/events/camelSellerEvent?first=true');
    }
  };

  return handleClick;
}
