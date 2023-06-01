import { atom } from 'recoil';

import { GENDER } from '@constants/user';

export const searchTabPanelsSwiperThresholdState = atom({
  key: 'search/tabPanelsSwiperThresholdState',
  default: 5
});

export const searchValueState = atom({
  key: 'search/valueState',
  default: ''
});

export const searchCategoryState = atom<{
  parentId: number;
  subParentId: number;
  gender: keyof typeof GENDER;
  selectedAll: boolean;
}>({
  key: 'search/categoryState',
  default: {
    parentId: 0,
    subParentId: 0,
    gender: 'male',
    selectedAll: false
  }
});

export const searchAutoFocusState = atom({
  key: 'search/autoFocusState',
  default: true
});
