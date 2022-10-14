import { atom, atomFamily, selector } from 'recoil';

import type { CamelSellerLocalStorage, SubmitType } from '@typings/camelSeller';

export const camelSellerSubmitState = atom<SubmitType | null>({
  key: 'camelSellerStore',
  default: null
});

export const camelSellerEditState = atom<CamelSellerLocalStorage | null>({
  key: 'camelSellerEditState',
  default: null
});

export const submitValidatorState = selector({
  key: 'submitValidatorState',
  get: ({ get }) => {
    const submitData = get(camelSellerSubmitState);
    if (submitData) {
      return !!(submitData.conditionId && submitData.colorIds?.length > 0 && submitData.price);
    }
    return false;
  }
});

export const toggleBottomSheetState = atom({
  key: 'toggleBottomSheet',
  default: ''
});

export const setModifyProductTitleState = atom({
  key: 'setModifyProductTitle',
  default: ''
});

export const setModifyProductPriceState = atom({
  key: 'setModifyProductPrice',
  default: 0
});

export const recentPriceCardTabNumState = atom<{ id: number; index: number } | null>({
  key: 'recentPriceCardTabNumState',
  default: null
});

export const camelSellerBooleanStateFamily = atomFamily({
  key: 'camelSellerBooleanStateFamily',
  default: (type: string) => ({
    type,
    isState: false
  })
});

export const camelSellerDialogStateFamily = atomFamily({
  key: 'camelSellterDialogState',
  default: (type: string) => ({
    type,
    open: false
  })
});
