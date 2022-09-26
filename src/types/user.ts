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
