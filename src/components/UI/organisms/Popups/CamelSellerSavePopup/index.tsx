import { useEffect } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { LISTING_TECH_DATE, SAVED_CAMEL_SELLER_PRODUCT_DATA } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { SaveCamelSellerProductData } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerHasOpenedSurveyBottomSheetState,
  camelSellerSurveyState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function CamelSellerSavePopup() {
  const router = useRouter();
  const [continueRegister, setContinueRegisterDialog] = useRecoilState(
    camelSellerDialogStateFamily('continue')
  );
  const setSubmitClickState = useSetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const setSurveyState = useSetRecoilState(camelSellerSurveyState);
  const setHasOpenedSurveyBottomSheet = useSetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const resetHasOpenedSurveyBottomSheetState = useResetRecoilState(
    camelSellerHasOpenedSurveyBottomSheetState
  );
  const resetSurveyState = useResetRecoilState(camelSellerSurveyState);

  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    if (continueRegister.open) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_POPUP, {
        name: router.pathname,
        title: attrProperty.title.CONTINUE
      });
    }
  }, [continueRegister, router.pathname]);

  const handleClickContinue = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: router.pathname,
      title: attrProperty.title.CONTINUE,
      att: 'CONTINUE'
    });

    const savedCamelSellerProductData = LocalStorage.get<SaveCamelSellerProductData>(
      SAVED_CAMEL_SELLER_PRODUCT_DATA
    );

    if (
      !accessUser ||
      !savedCamelSellerProductData ||
      !savedCamelSellerProductData[accessUser.snsType]
    ) {
      router.push('/camelSeller/registerConfirm');
      return;
    }

    const {
      unitIds = [],
      storeIds = [],
      distanceIds = [],
      colors = [],
      hasOpenedSurveyBottomSheet = false,
      ...props
    } = savedCamelSellerProductData[accessUser.snsType];

    setContinueRegisterDialog(({ type }) => ({ type, open: false }));
    setTempData({
      ...tempData,
      ...props
    });
    setHasOpenedSurveyBottomSheet(hasOpenedSurveyBottomSheet);
    setSurveyState((prevState) => ({
      units: prevState.units.map((unit) => ({
        ...unit,
        selected: unitIds.includes(unit.id)
      })),
      stores: prevState.stores.map((store) => ({
        ...store,
        selected: storeIds.includes(store.id)
      })),
      distances: prevState.distances.map((distance) => ({
        ...distance,
        selected: distanceIds.includes(distance.id)
      })),
      colors
    }));

    router.push('/camelSeller/registerConfirm');
  };

  const handleClickNew = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: router.pathname,
      title: attrProperty.title.CONTINUE,
      att: 'NEW'
    });
    LocalStorage.remove(LISTING_TECH_DATE);
    LocalStorage.remove(SAVED_CAMEL_SELLER_PRODUCT_DATA);
    SessionStorage.remove(sessionStorageKeys.isFirstVisitCamelSellerRegisterConfirm);
    setContinueRegisterDialog(({ type }) => ({ type, open: false }));
    resetTempData();
    resetSurveyState();
    resetHasOpenedSurveyBottomSheetState();
    setSubmitClickState(({ type }) => ({ type, isState: false }));

    router.push('/camelSeller/registerConfirm');
  };

  return (
    <Dialog
      open={continueRegister.open}
      customStyle={{ width: '100%', textAlign: 'center' }}
      onClose={() => setContinueRegisterDialog(({ type }) => ({ type, open: false }))}
    >
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          marginTop: 12
        }}
      >
        등록하던 매물이 있어요.
      </Typography>
      <Typography variant="h3" weight="bold">
        이어서 진행할까요?
      </Typography>
      <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
        <Button
          fullWidth
          variant="solid"
          brandColor="blue"
          onClick={handleClickContinue}
          size="large"
        >
          이어서 등록하기
        </Button>
        <Button fullWidth variant="ghost" size="large" brandColor="black" onClick={handleClickNew}>
          새로 등록하기
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default CamelSellerSavePopup;
