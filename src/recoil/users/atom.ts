import { atom } from 'recoil';

import type { SelectSize } from '@typings/user';

const searchSelectSizesState = atom({
  key: 'searchSelectSize',
  default: []
});

const searchModeTypeState = atom({
  key: 'searchModeType',
  default: {
    kind: '',
    parentCategoryId: 0
  }
});

const selectedSizeState = atom<SelectSize[]>({
  key: 'selectedSize',
  default: []
});

const tempSelectedState = atom<SelectSize[]>({
  key: 'tempSelected',
  default: []
});

const searchModeDisabledState = atom({
  key: 'searchModeDisabled',
  default: false
});

export default {
  searchSelectSizesState,
  searchModeTypeState,
  selectedSizeState,
  tempSelectedState,
  searchModeDisabledState
};
