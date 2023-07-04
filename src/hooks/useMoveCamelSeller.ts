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
import { camelSellerAppUpdateDialogOpenState, loginBottomSheetState } from '@recoil/common';
import {
  camelSellerDialogStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useSession from '@hooks/useSession';

import useOsAlarm from './useOsAlarm';

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
  const setContinueDialog = useSetRecoilState(camelSellerDialogStateFamily('continue'));
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetHasOpenedSurveyBottomSheetState = useResetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );
  const resetSurveyState = useResetRecoilState(camelSellerSurveyState);

  const { isLoggedIn, data: accessUser } = useSession();
  const { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog } = useOsAlarm();

  const handleMoveCamelSeller = () => {
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

    if (!isLoggedIn) {
      setOpenLoginBottomSheetState({
        open: true,
        returnUrl: checkedProductPhotoUploadGuide
          ? '/camelSeller/registerConfirm'
          : '/camelSeller/guide'
      });
      return;
    }

    if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
      window.getAuthCamera = (result: boolean) => {
        if (!result) {
          //
        }
      };
    }

    const savedCamelSellerProductData = LocalStorage.get<SaveCamelSellerProductData>(
      SAVED_CAMEL_SELLER_PRODUCT_DATA
    );

    // 이어하기 다이얼로그 띄우는 조건
    if (
      isLoggedIn &&
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
        router.replace('/camelSeller/registerConfirm').then(() => checkOsAlarm());
      } else {
        router.push('/camelSeller/registerConfirm').then(() => checkOsAlarm());
      }
    } else {
      router.push('/camelSeller/guide').then(() => checkOsAlarm());
    }
  };

  return { handleMoveCamelSeller, openOsAlarmDialog, handleCloseOsAlarmDialog };
}
