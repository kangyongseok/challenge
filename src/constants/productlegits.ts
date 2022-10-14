import { PostType } from '@dto/product';

export const additionalInfos = [
  { id: 10, label: '박스없음' },
  { id: 11, label: '대체 부속품 없음' },
  { id: 12, label: '영수증 잃어버림' },
  { id: 13, label: '구매날짜, 장소를 몰라요' }
];

export const postType: Record<PostType, string> = {
  0: '크롤링',
  1: '판매등록',
  2: '감정등록'
};
