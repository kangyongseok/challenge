import { atom, atomFamily } from 'recoil';

import type { Product } from '@dto/product';

export const userShopOpenStateFamily = atomFamily<
  {
    type:
      | 'manage'
      | 'soldOutConfirm'
      | 'deleteConfirm'
      | 'updatePostedFeedback'
      | 'reservingFeedback'
      | 'saleFeedback'
      | 'soldOutFeedback'
      | 'deleteFeedback';
    open: boolean;
  },
  | 'manage'
  | 'soldOutConfirm'
  | 'deleteConfirm'
  | 'updatePostedFeedback'
  | 'reservingFeedback'
  | 'saleFeedback'
  | 'soldOutFeedback'
  | 'deleteFeedback'
>({
  key: 'users/userShopOpenStateFamily',
  default: (type) => ({
    type,
    open: false
  })
});

export const userShopSelectedProductState = atom<Partial<Product>>({
  key: 'users/userShopSelectedProductState',
  default: {}
});
