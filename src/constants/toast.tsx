import { ReactElement } from 'react';

import dayjs from 'dayjs';

import { ToastStatus, ToastType } from '@typings/common';

const common = {
  saved: '저장이 완료되었습니다',
  overLimitText: '{length}글자만 입력할 수 있어요.',
  undeLimitText: '최소 {length}자 이상으로 작성해주세요.',
  savedChannelMessage: '저장되었습니다'
};

const bottomSheetLogin = {
  loginSuccess: '로그인 되었습니다.'
};

const sellerProductState = {
  hoisting: '끌어올리기가 완료되었어요. 👍',
  reserve: '예약중으로 변경되었어요.',
  sell: '판매중으로 변경되었어요.',
  deleted: '상품이 삭제되었어요.',
  soldout: '판매완료 처리되었어요!',
  hide: '숨김 처리되었어요!'
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

const event = {
  onready: '이미 참여 하셨습니다.'
};

const product = {
  successCopy: 'URL이 복사 되었어요.',
  successReport: '감사합니다! 신고 접수 완료되었습니다 😇',
  successRemoveWish: '찜목록에서 삭제했어요.',
  successAddWish: '찜목록에 추가했어요!',
  selfCamelProduct: '내 매물은 찜할 수 없어요.',
  saleSuccess: (
    <>
      <p>내 매물이 등록되었어요! 판매시작!</p>
      <p>(검색결과 반영까지 1분 정도 걸릴 수 있습니다)</p>
    </>
  ),
  soldout: '죄송합니다. 판매 완료된 매물입니다!'
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
  saved: '실시간 사진감정이 신청되었어요!',
  isAgree: '이미 동의 중 입니다.',
  disAgree: (
    <>
      <p>{dayjs().format('YYYY-MM-DD')} 마케팅 수신 동의 처리 되었습니다.</p>
      <p>(재설정: 마이 -{'>'} 해제)</p>
    </>
  )
};

const mypage = {
  overFiveStyle: '최대 5개까지 고를 수 있어요!'
};

const user = {
  agreeNight: '야간 방해금지 모드가 설정 되었어요',
  disAgreeNight: '야간 방해금지 모드가 해제 되었어요',
  agreeAlarm: (
    <>
      {dayjs().format('YYYY.M.D')} 마케팅 수신 동의 처리되었습니다.
      <br />
      (재설정: 마이 {'->'} 해제)
    </>
  ),
  disAgreeAlarm: (
    <>
      {dayjs().format('YYYY.M.D')} 마케팅 수신 미동의 처리되었습니다.
      <br />
      (재설정: 마이 {'->'} 해제)
    </>
  ),
  reviewReport: (
    <>
      신고가 접수되었습니다.
      <br />이 리뷰는 가려드릴게요!
    </>
  ),
  reviewBlock: (
    <>
      차단 처리되었습니다.
      <br />이 사용자는 가려드릴게요!
    </>
  ),
  block: '{role} {userName}을 차단했어요.',
  unBlock: '{userName}님을 차단 해제했어요.',
  unBlockWithRole: '{userName}님을 차단 해제했어요.',
  channelNotiOff: '채팅 알림을 받지 않아요.',
  channelNotiOn: '채팅 알림을 받아요.',
  report: '신고 접수 완료되었습니다.',
  successSendReview: '후기를 보냈어요.',
  saved: '저장을 완료했어요.',
  duplicatedNickName: '이미 사용 중인 닉네임이에요.',
  invalidBanWord: '욕설 및 비속어는 사용할 수 없어요!',
  invalidAdminWord: '관리자로 오해할 수 있는 단어는 쓸 수 없어요.',
  disableImageUpload: '사진 업로드는 앱에서만 할 수 있어요!',
  savedProfileImage: '프로필 사진을 저장했어요',
  savedBackgroundImage: '배경 사진을 저장했어요.'
};

const channel = {
  notiOff: '채팅 알림을 받지 않아요.',
  notiOn: '채팅 알림을 받아요.',
  createFail: '채팅방 생성에 실패했어요. 새로고침 후 시도해 주세요.',
  disabledMakeAppointment: '{userName}님과 대화를 나눈 뒤 약속을 잡을 수 있어요.'
};

const sendbird = {
  settingError: '설정 변경에 실패했어요. 잠시 후 다시 시도해 주세요.',
  createFail: '채팅방 생성에 실패했어요.'
};

export const toastText: Record<
  ToastType,
  Partial<Record<ToastStatus, string | number | ReactElement>>
> = {
  common,
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
  mypage,
  user,
  channel,
  sendbird,
  event
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
