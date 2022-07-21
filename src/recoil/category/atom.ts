import { atom } from 'recoil';

import type { GENDER } from '@constants/user';

const categoryState = atom<{
  initialized: boolean;
  parentId: number;
  subParentId: number;
  gender: keyof typeof GENDER;
}>({
  key: 'category',
  default: {
    initialized: false,
    parentId: 0,
    subParentId: 0,
    gender: 'male'
  }
});

export default categoryState;
