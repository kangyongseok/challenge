import { useEffect } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { CtaButton, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import {
  productsKeywordDialogState,
  productsKeywordInduceTriggerState,
  productsKeywordState
} from '@recoil/productsKeyword';

function ProductsKeywordDialog() {
  const router = useRouter();
  const [{ open, pathname }, setProductsKeywordDialogState] = useRecoilState(
    productsKeywordDialogState
  );
  const setProductsKeywordState = useSetRecoilState(productsKeywordState);
  const setProductsKeywordInduceTriggerState = useSetRecoilState(productsKeywordInduceTriggerState);

  const handleClose = () => {
    logEvent(attrKeys.products.CLICK_BACK, {
      name: 'MYLIST_POPUP',
      att: 'SAVE'
    });
    setProductsKeywordDialogState({
      open: false,
      pathname: '/'
    });
    if (!pathname) {
      router.back();
    } else {
      router.push(pathname);
    }
  };

  const handleClick = () => {
    logEvent(attrKeys.products.CLICK_MYLIST, {
      name: 'MYLIST_POPUP',
      att: 'SAVE'
    });
    setProductsKeywordDialogState({ open: false, pathname: '/' });
    setProductsKeywordState(true);
  };

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.products.VIEW_MYLIST_POPUP);

      setProductsKeywordInduceTriggerState((prevState) => ({
        ...prevState,
        dialog: false,
        latestTriggerTime: new Date().getTime()
      }));
    }
  }, [setProductsKeywordInduceTriggerState, open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography weight="medium" customStyle={{ textAlign: 'center' }}>
        마음에 드는 매물이 없나요?
        <br />
        목록 저장하면 꿀매물 찾아드릴게요!
      </Typography>
      <Flexbox gap={7} customStyle={{ marginTop: 20 }}>
        <CtaButton
          fullWidth
          variant="ghost"
          brandColor="primary"
          onClick={handleClose}
          customStyle={{ width: 128 }}
        >
          닫기
        </CtaButton>
        <CtaButton
          fullWidth
          variant="contained"
          brandColor="primary"
          onClick={handleClick}
          customStyle={{ width: 128 }}
        >
          목록 저장하기
        </CtaButton>
      </Flexbox>
    </Dialog>
  );
}

export default ProductsKeywordDialog;
