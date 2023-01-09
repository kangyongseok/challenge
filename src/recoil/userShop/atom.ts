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
      | 'soldOutConfirm'
      | 'deleteFeedback';
    open: boolean;
  },
  | 'deleteConfirm'
  | 'updatePostedFeedback'
  | 'reservingFeedback'
  | 'saleFeedback'
  | 'manage'
  | 'soldOutFeedback'
  | 'soldOutConfirm'
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

export const userShopSelectProductManageState = atom<ProductResult & Product>({
  key: 'users/userShopSelectProductManageState',
  default: {} as ProductResult & Product
});
