import { atom, atomFamily } from 'recoil';

import { LikeStyleSelectedModelDetail } from '@typings/common';

export const disabledState = atomFamily({
  key: 'onboarding/disabledState',
  default: (type: string) => ({
    type,
    open: true
  })
});

export const openState = atomFamily({
  key: 'onboarding/openState',
  default: (type: string) => ({
    type,
    open: false
  })
});

export const purchaseTypeIdState = atom<number>({
  key: 'onboarding/putchaseTypeIdState',
  default: 0
});

export const modelParentCategoryIdsState = atom<number[]>({
  key: 'onboarding/modelParentCategoryIdsState',
  default: []
});

export const selectedModelCardState = atom<LikeStyleSelectedModelDetail[]>({
  key: 'onboarding/selectedModelCardState',
  default: []
});
