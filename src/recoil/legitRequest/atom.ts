import { atom } from 'recoil';

import type {
  PostProductLegitData,
  ProductLegitsParams,
  PutProductLegitData
} from '@dto/productLegit';

import LocalStorage from '@library/localStorage';

import { SAVED_LEGIT_REQUEST_STATE } from '@constants/localStorage';

export const legitRequestState = atom({
  key: 'legitRequest/state',
  default: {
    brandId: 0,
    brandName: '',
    brandLogo: '',
    categoryId: 0,
    categoryName: '',
    modelImage: '',
    isCompleted: false,
    isViewedSampleGuide: false
  },
  effects: [
    ({ setSelf }) => {
      const savedLegitRequestState = LocalStorage.get<{
        state: {
          brandId: number;
          brandName: string;
          brandLogo: string;
          categoryId: number;
          categoryName: string;
          modelImage: string;
          isCompleted: boolean;
          isViewedSampleGuide: boolean;
        };
      }>(SAVED_LEGIT_REQUEST_STATE);

      if (savedLegitRequestState) setSelf(savedLegitRequestState.state);
    }
  ]
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
  },
  effects: [
    ({ setSelf }) => {
      const savedLegitRequestParams = LocalStorage.get<{
        params: PostProductLegitData;
      }>(SAVED_LEGIT_REQUEST_STATE);

      if (savedLegitRequestParams) setSelf(savedLegitRequestParams.params);
    }
  ]
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
