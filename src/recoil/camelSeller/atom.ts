import { atom, atomFamily, selector } from 'recoil';

import type { CamelSellerTempData, SubmitType } from '@typings/camelSeller';

export const camelSellerTempSaveDataState = atom<CamelSellerTempData>({
  key: '@camelSeller/TempSaveDataState',
  default: {
    title: '',
    quoteTitle: '',
    condition: { id: 0, name: '' },
    color: { id: 0, name: '' },
    size: { id: 0, name: '' },
    brand: { id: 0, name: '' },
    category: { id: 0, name: '' },
    brandIds: [],
    price: 0,
    description: '',
    photoGuideImages: []
  }
});

export const camelSellerSubmitState = atom<SubmitType | null>({
  key: '@camelSeller/Store',
  default: null
});

export const submitValidatorState = selector({
  key: 'submitValidatorState',
  get: ({ get }) => {
    const submitData = get(camelSellerTempSaveDataState);
    if (submitData) {
      return !!(submitData.condition.id && submitData.color.id && submitData.price);
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
  key: '@camelSeller/BooleanStateFamily',
  default: (type: string) => ({
    type,
    isState: false
  })
});

export const camelSellerDialogStateFamily = atomFamily({
  key: '@camelSeller/DialogState',
  default: (type: string) => ({
    type,
    open: false
  })
});

export const camelSellerIsImageLoadingState = atom({
  key: '@camelSeller/camelSellerIsImageLoadingState',
  default: false
});
