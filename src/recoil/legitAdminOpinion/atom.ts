import { atom } from 'recoil';

import type { PostProductLegitOpinionData } from '@dto/productLegit';

export const legitAdminOpinionDataState = atom<Omit<PostProductLegitOpinionData, 'productId'>>({
  key: 'legitAdminOpinion/dataState',
  default: {
    result: 0,
    description: ''
  }
});

export const legitAdminOpinionEditableState = atom({
  key: 'legitAdminOpinion/editableState',
  default: false
});
