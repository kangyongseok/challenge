import { atom, atomFamily } from 'recoil';

import type { Product, ProductResult } from '@dto/product';

export const userShopOpenStateFamily = atomFamily<
  {
    type:
      | 'manage'
      | 'deleteConfirm'
      | 'updatePostedFeedback'
      | 'reservingFeedback'
      | 'saleFeedback'
      | 'soldOutFeedback'
      | 'deleteFeedback';
    open: boolean;
  },
  | 'manage'
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

export const userShopSelectedProductState = atom<
  Partial<Product & { isNoSellerReviewAndHasTarget?: boolean }> | Partial<ProductResult>
>({
  key: 'users/userShopSelectedProductState',
  default: {}
});
