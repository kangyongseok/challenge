import { atom } from 'recoil';

import type { PostProductLegitCommentData, PutProductLegitCommentData } from '@dto/productLegit';

export const legitResultCommentDataState = atom<
  Omit<PostProductLegitCommentData, 'productId'> & Omit<PutProductLegitCommentData, 'productId'>
>({
  key: 'legitResultComment/dataState',
  default: {
    commentId: 0,
    result: 0,
    description: ''
  }
});

export const legitResultCommentEditableState = atom({
  key: 'legitResultComment/editableState',
  default: false
});

export const legitResultCommentFocusedState = atom({
  key: 'legitResultComment/focusedState',
  default: false
});

export const legitResultCommentOpenContactBannerState = atom({
  key: 'legitResultComment/openContactBannerState',
  default: false
});
