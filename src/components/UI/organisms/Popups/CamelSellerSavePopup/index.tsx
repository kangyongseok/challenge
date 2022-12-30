import { useEffect } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography, useTheme } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerSubmitState,
  camelSellerTempSaveDataState
} from '@recoil/camelSeller';

function CamelSellerSavePopup() {
  const {
    theme: {
      palette: { primary }
    }
  } = useTheme();
  const router = useRouter();
  const [continueRegister, setContinueRegisterDialog] = useRecoilState(
    camelSellerDialogStateFamily('continue')
  );
  const setSubmitClickState = useSetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const resetRecoilState = useResetRecoilState(camelSellerSubmitState);
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);

  useEffect(() => {
    if (continueRegister.open) {
      logEvent(attrKeys.camelSeller.VIEW_PRODUCT_POPUP, {
        name: router.pathname,
        title: attrProperty.title.CONTINUE
      });
    }
  }, [continueRegister, router.pathname]);

  const handleClickContinue = () => {
    const saveData = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;

    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: router.pathname,
      title: attrProperty.title.CONTINUE,
      att: 'CONTINUE'
    });

    setContinueRegisterDialog(({ type }) => ({ type, open: false }));
    setTempData({
      ...tempData,
      title: saveData.title,
      color: saveData.color,
      size: saveData.size,
      price: saveData.price,
      condition: saveData.condition,
      quoteTitle: saveData.quoteTitle,
      description: saveData.description,
      photoGuideImages: saveData.photoGuideImages
    });

    router.push({
      pathname: '/camelSeller/registerConfirm',
      query: {
        title: saveData.title || saveData.quoteTitle || saveData.brand?.name,
        brandIds: saveData.brand.id,
        brandName: saveData.brand?.name,
        categoryIds: saveData.category.id,
        categoryName: saveData.category.name
        // subParentCategoryName: data.subParentCategoryName
      }
    });
  };

  const handleClickNew = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_POPUP, {
      name: router.pathname,
      title: attrProperty.title.CONTINUE,
      att: 'NEW'
    });

    setContinueRegisterDialog(({ type }) => ({ type, open: false }));
    reset();
    router.push('/camelSeller');
  };

  const reset = () => {
    LocalStorage.remove(CAMEL_SELLER);
    resetRecoilState();
    resetTempData();
    setSubmitClickState(({ type }) => ({ type, isState: false }));
  };

  return (
    <Dialog
      open={continueRegister.open}
      customStyle={{ width: '100%', textAlign: 'center' }}
      onClose={() => setContinueRegisterDialog(({ type }) => ({ type, open: false }))}
    >
      <Typography variant="h3" weight="bold">
        등록하던 물건이 있어요.
      </Typography>
      <Typography variant="h3" weight="bold">
        이어서 진행할까요?
      </Typography>
      <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 16 }}>
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          onClick={handleClickContinue}
          size="large"
        >
          이어서 등록하기
        </Button>
        <Button
          fullWidth
          variant="solid"
          onClick={handleClickNew}
          size="large"
          customStyle={{ background: primary.highlight, color: primary.light }}
        >
          새로 등록하기
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default CamelSellerSavePopup;
