import { atom } from 'recoil';

import type { AccessUser } from '@dto/userAuth';
import type {
  PostProductLegitData,
  ProductLegitsParams,
  PutProductLegitData
} from '@dto/productLegit';

import LocalStorage from '@library/localStorage';

import {
  ACCESS_USER,
  SAVED_LEGIT_REQUEST,
  SAVED_LEGIT_REQUEST_STATE
} from '@constants/localStorage';

import type { LegitRequest, UserData } from '@typings/user';

export const legitRequestState = atom<LegitRequest>({
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
      const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);
      const oldSavedLegitRequest =
        LocalStorage.get<UserData[typeof SAVED_LEGIT_REQUEST_STATE]>(SAVED_LEGIT_REQUEST_STATE);

      if (accessUser) {
        const userId = accessUser.userId.toString();
        const userData = LocalStorage.get<UserData>(userId);

        // 마이그레이션 코드
        if (oldSavedLegitRequest) {
          setSelf(oldSavedLegitRequest.state);
          LocalStorage.set(userId, {
            ...userData,
            [SAVED_LEGIT_REQUEST_STATE]: oldSavedLegitRequest
          });
          LocalStorage.remove(SAVED_LEGIT_REQUEST_STATE);
          // 사진 감정 정보 입력 중 카메라 설정 후 리디렉션 접근
        } else if (userData?.[SAVED_LEGIT_REQUEST_STATE]) {
          setSelf(userData?.[SAVED_LEGIT_REQUEST_STATE].state);
          // 매물 등록 후 사진감정 중단
        } else if (userData?.[SAVED_LEGIT_REQUEST]) {
          setSelf(userData?.[SAVED_LEGIT_REQUEST].state);
        }
      }
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
      const accessUser = LocalStorage.get<AccessUser>(ACCESS_USER);
      const oldSavedLegitRequest =
        LocalStorage.get<UserData[typeof SAVED_LEGIT_REQUEST_STATE]>(SAVED_LEGIT_REQUEST_STATE);

      if (accessUser) {
        const userId = accessUser.userId.toString();
        const userData = LocalStorage.get<UserData>(userId);

        // 마이그레이션 코드
        if (oldSavedLegitRequest) {
          setSelf(oldSavedLegitRequest.params);
          LocalStorage.set(userId, {
            ...userData,
            [SAVED_LEGIT_REQUEST_STATE]: oldSavedLegitRequest
          });
          LocalStorage.remove(SAVED_LEGIT_REQUEST_STATE);
          // 사진 감정 정보 입력 중 카메라 설정 후 리디렉션 접근
        } else if (userData?.[SAVED_LEGIT_REQUEST_STATE]) {
          setSelf(userData?.[SAVED_LEGIT_REQUEST_STATE].params);
          // 매물 등록 후 사진감정 중단
        } else if (userData?.[SAVED_LEGIT_REQUEST]) {
          setSelf(userData?.[SAVED_LEGIT_REQUEST].params);
        }
      }
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
