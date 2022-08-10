import { useCallback, useEffect } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { CtaButton, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { SHOW_PRODUCTS_KEYWORD_POPUP } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import { searchParamsState, selectedSearchOptionsState } from '@recoil/searchHelper';
import { productsSaveSearchPopupState } from '@recoil/productsKeyword';

function ProductsSaveSearchPopup() {
  const router = useRouter();
  const [open, setProductsSaveSearchPopup] = useRecoilState(productsSaveSearchPopupState);
  const resetSearchParams = useResetRecoilState(searchParamsState);
  const resetSelectedSearchOptions = useResetRecoilState(selectedSearchOptionsState);

  const handleClose = useCallback(() => {
    setProductsSaveSearchPopup(false);
  }, [setProductsSaveSearchPopup]);

  const handleClickCancel = useCallback(() => {
    logEvent(attrKeys.searchHelper.CLICK_LOGIN_POPUP, {
      title: 'SEARCHHELPER',
      name: 'PRODUCT_LIST',
      att: 'NO'
    });
    LocalStorage.remove(SHOW_PRODUCTS_KEYWORD_POPUP);
    resetSearchParams();
    resetSelectedSearchOptions();
    setProductsSaveSearchPopup(false);
  }, [resetSearchParams, resetSelectedSearchOptions, setProductsSaveSearchPopup]);

  const handleClickOk = useCallback(() => {
    logEvent(attrKeys.searchHelper.CLICK_LOGIN_POPUP, {
      title: 'SEARCHHELPER',
      name: 'PRODUCT_LIST',
      att: 'YES'
    });
    setProductsSaveSearchPopup(false);
    router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
  }, [router, setProductsSaveSearchPopup]);

  useEffect(() => {
    return () => setProductsSaveSearchPopup(false);
  }, [setProductsSaveSearchPopup]);

  useEffect(() => {
    if (open) {
      logEvent(attrKeys.searchHelper.VIEW_LOGIN_POPUP, {
        title: 'SEARCHHELPER',
        name: 'PRODUCT_LIST'
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography
        variant="body1"
        weight="medium"
        customStyle={{ marginBottom: 16, textAlign: 'center' }}
      >
        똑같은 검색 또 하기 귀찮다면
        <br />
        로그인하고 저장해두세요!
      </Typography>
      <Flexbox gap={7}>
        <CtaButton
          variant="ghost"
          brandColor="black"
          size="medium"
          customStyle={{ width: 128 }}
          onClick={handleClickCancel}
        >
          그냥 볼게요
        </CtaButton>
        <CtaButton
          variant="contained"
          brandColor="primary"
          size="medium"
          customStyle={{ width: 128 }}
          onClick={handleClickOk}
        >
          로그인하기
        </CtaButton>
      </Flexbox>
    </Dialog>
  );
}

export default ProductsSaveSearchPopup;
