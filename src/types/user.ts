import type { PostProductLegitData } from '@dto/productLegit';

import { SAVED_LEGIT_REQUEST, SAVED_LEGIT_REQUEST_STATE } from '@constants/localStorage';

export type Gender = 'M' | 'F';

export type SnsType = 'kakao' | 'facebook' | 'apple';

export type User = {
  adAgree: boolean;
  age: string;
  ageRange: string;
  alarmAgree: boolean;
  area: string;
  auth: boolean;
  birthday: string | null;
  email: string;
  gender: Gender;
  image: string;
  isLogin: boolean;
  mrcamelId: string;
  snsType: SnsType;
  userAuthStatus: boolean;
  userId: number;
  userName: string;
  lastProductModel?: string;
  lastKeyword?: string;
};

export type Kind = 'bottoms' | 'shoes' | 'tops';

export interface SelectSize {
  kind: Kind;
  categorySizeId: number;
  viewSize: string;
}

export interface UserData {
  [SAVED_LEGIT_REQUEST_STATE]?: {
    state: LegitRequest;
    params: PostProductLegitData;
  };
  [SAVED_LEGIT_REQUEST]?: {
    state: LegitRequest;
    params: PostProductLegitData;
    showToast?: boolean;
  };
}

export interface LegitRequest {
  brandId: number;
  brandName: string;
  brandLogo: string;
  categoryId: number;
  categoryName: string;
  modelImage: string;
  isCompleted: boolean;
  isViewedSampleGuide: boolean;
  productId?: number;
}
