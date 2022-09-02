import { ReactElement } from 'react';

import { ToastStatus, ToastType } from '@typings/common';

const productsKeyword = {
  saved: '저장이 완료되었어요',
  deleted: '저장한 매물목록이 삭제되었습니다.',
  restored: '삭제한 매물목록을 다시 저장했어요',
  limited: '매물목록은 최대 20개까지 저장할 수 있어요.',
  autoSaved: (
    <>
      홈에서 바로 볼 수 있게
      <br />이 검색 목록을 저장했어요!
    </>
  )
};

const mapFilter = {
  locationInfo: '위치 정보가 필요해요!',
  signIn: '로그인이 필요해요'
};

const product = {
  successCopy: 'URL이 복사 되었어요.',
  successReport: '감사합니다! 신고 접수 완료되었습니다 😇',
  successRemoveWish: '찜목록에서 삭제했어요.',
  successAddWish: '찜목록에 추가했어요!'
};

export const toastText: Record<
  ToastType,
  Partial<Record<ToastStatus, string | number | ReactElement>>
> = {
  productsKeyword,
  mapFilter,
  product
};

const productsKeywordActionButton = {
  deleted: '되돌리기'
};

const mapFilterActionButton = {
  locationInfo: '입력하기',
  signIn: '로그인하기'
};

const productActionButton = {
  successAddWish: '찜목록 보기'
};

export const toastActionButtonText: Record<
  Extract<ToastType, 'productsKeyword' | 'mapFilter' | 'product'>,
  Partial<Record<ToastStatus, string | number | ReactElement>>
> = {
  productsKeyword: productsKeywordActionButton,
  mapFilter: mapFilterActionButton,
  product: productActionButton
};

const toast = {
  toastText,
  toastActionButtonText
};

export default toast;
