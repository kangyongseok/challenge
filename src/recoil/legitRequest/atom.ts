import { atom } from 'recoil';

import type {
  PostProductLegitData,
  ProductLegitsParams,
  PutProductLegitData
} from '@dto/productLegit';

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
