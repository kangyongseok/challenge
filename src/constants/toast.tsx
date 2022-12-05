import { ReactElement } from 'react';

import { ToastStatus, ToastType } from '@typings/common';

const bottomSheetLogin = {
  loginSuccess: '로그인 되었습니다.'
};

const sellerProductState = {
  hoisting: '끌어올리기가 완료되었어요. 👍',
  reserve: '예약중으로 변경되었어요.',
  sell: '판매중으로 변경되었어요.',
  deleted: '상품이 삭제되었어요.',
  soldout: '판매완료 처리되었어요!'
};

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
  successAddWish: '찜목록에 추가했어요!',
  selfCamelProduct: '내 매물은 찜할 수 없어요.'
};

const legitAdminOpinion = {
  saved: '감정 의견 작성이 완료되었습니다.',
  preConfirmEdited: '사진보완 요청이 완료되었습니다.'
};

const legit = {
  saved: '감정신청이 완료되었습니다!',
  successRequest: '감정신청이 완료되었습니다',
  successEdit: '수정이 완료되어 다시 감정에 들어갑니다!',
  preConfirmEdited: '사진감정 계속하기가 신청되었습니다.'
};

const legitProfile = {
  disableUpload: '사진 업로드는 앱에서만 할 수 있어요!'
};

const legitStatus = {
  successCopy: '문구가 복사되었습니다!'
};

const home = {
  saved: '실시간 사진감정이 신청되었어요!'
};

const mypage = {
  overFiveStyle: '최대 5개까지 고를 수 있어요!'
};

export const toastText: Record<
  ToastType,
  Partial<Record<ToastStatus, string | number | ReactElement>>
> = {
  productsKeyword,
  mapFilter,
  product,
  sellerProductState,
  legitAdminOpinion,
  legit,
  legitProfile,
  legitStatus,
  bottomSheetLogin,
  home,
  mypage
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

const legitProfileActionButton = {
  disableUpload: '앱에서 진행'
};

export const toastActionButtonText: Record<
  Extract<ToastType, 'productsKeyword' | 'mapFilter' | 'product' | 'legitProfile'>,
  Partial<Record<ToastStatus, string | number | ReactElement>>
> = {
  productsKeyword: productsKeywordActionButton,
  mapFilter: mapFilterActionButton,
  product: productActionButton,
  legitProfile: legitProfileActionButton
};

const toast = {
  toastText,
  toastActionButtonText
};

export default toast;
