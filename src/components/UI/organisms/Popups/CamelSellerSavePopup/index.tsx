import { useEffect } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import type { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerEditState,
  camelSellerSubmitState
} from '@recoil/camelSeller';

function CamelSellerSavePopup() {
  const router = useRouter();
  const [continueRegister, setContinueRegisterDialog] = useRecoilState(
    camelSellerDialogStateFamily('continue')
  );
  const setSubmitClickState = useSetRecoilState(camelSellerBooleanStateFamily('submitClick'));
  const resetRecoilState = useResetRecoilState(camelSellerSubmitState);
  const resetEditState = useResetRecoilState(camelSellerEditState);
  // const [step, setStep] = useState('');
  useEffect(() => {
    const getCamelSeller = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;
    if (getCamelSeller && getCamelSeller.step) {
      // setStep(getCamelSeller.step);
      // setContinueRegisterDialog(({ type }) => ({ type, open: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    resetEditState();
    setContinueRegisterDialog(({ type }) => ({ type, open: false }));
    router.push('/camelSeller/registerConfirm');
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
    setSubmitClickState(({ type }) => ({ type, isState: false }));
  };

  return (
    <Dialog
      open={continueRegister.open}
      customStyle={{ width: '100%', textAlign: 'center' }}
      onClose={() => setContinueRegisterDialog(({ type }) => ({ type, open: false }))}
    >
      <Typography weight="medium">등록하던 물건이 있어요.</Typography>
      <Typography weight="medium">이어서 진행할까요?</Typography>
      <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 16 }}>
        <Button fullWidth variant="contained" brandColor="primary" onClick={handleClickContinue}>
          이어서 등록하기
        </Button>
        <Button fullWidth variant="outlined" brandColor="primary" onClick={handleClickNew}>
          새로 등록하기
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default CamelSellerSavePopup;
