import { atom } from 'recoil';

import { PostProductLegitData, ProductLegitsParams, PutProductLegitData } from '@dto/productLegit';

export const legitRequestState = atom({
  key: 'legitRequest/state',
  default: {
    brandId: 0,
    brandName: '',
    brandLogo: '',
    categoryId: 0,
    categoryName: '',
    modelImage: '',
    isCompleted: false
  }
});

export const legitRequestParamsState = atom<ProductLegitsParams>({
  key: 'legitRequest/paramsState',
  default: {
    size: 20
  }
});

export const legitRequestListCountsState = atom<{
  cntAuthorized: number;
  cntAuthenticating: number;
  cntAuthenticatingOpinion: number;
  cntPreConfirm: number;
  cntPreConfirmEdit: number;
  cntPreConfirmEditDone: number;
}>({
  key: 'legitRequest/listCountsState',
  default: {
    cntAuthorized: 0,
    cntAuthenticating: 0,
    cntAuthenticatingOpinion: 0,
    cntPreConfirm: 0,
    cntPreConfirmEdit: 0,
    cntPreConfirmEditDone: 0
  }
});

export const productLegitParamsState = atom<PostProductLegitData>({
  key: 'legitRequest/productLegitParamsState',
  default: {
    title: '',
    brandIds: [],
    categoryIds: [],
    photoGuideImages: []
  }
});

export const productLegitEditParamsState = atom<PutProductLegitData>({
  key: 'legitRequest/productLegitEditParamsState',
  default: {
    productId: 0,
    title: '',
    brandIds: [],
    categoryIds: [],
    photoGuideImages: []
  }
});
