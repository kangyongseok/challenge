import type { ReactElement } from 'react';

import { Box, Flexbox, Label, Typography } from 'mrcamel-ui';

import type { DialogType } from '@typings/common';

export const dialogTitle: Record<
  Exclude<
    DialogType,
    | 'unblockBlockedUser'
    | 'blockUser'
    | 'confirmDeal'
    | 'loginError'
    | 'loginProviderError'
    | 'deleteAccount'
  >,
  string | number | ReactElement
> = {
  SNSShare: '공유하기',
  readyNextCrazyCuration: '다음주 월요일을 기대해주세요!',
  closedCrazyCuration: '앗! 이미 마감된 테마에요.',
  endCrazyCuration: '앗! 이미 마감된 테마에요.',
  deleteLegitAdminOpinion: '감정의견을 삭제하시겠습니까?',
  deleteLegitResultComment: '댓글을 삭제하시겠습니까?',
  deleteLegitResultReply: '답글을 삭제하시겠습니까?',
  legitRequestOnlyInApp: (
    <>
      사진으로 감정신청은
      <br />
      App에서만 진행할 수 있어요!
    </>
  ),
  legitRequestOnlyInIOS: '현재 이 기능은 iOS에서만 가능합니다!',
  legitServiceNotice: '곧 서비스가 시작 됩니다!',
  appUpdateNotice: '카멜 App이 업데이트 되었어요!',
  appAuthCheck: (
    <>
      사진 및 카메라 권한을
      <br />
      허용해주세요.
    </>
  ),
  legitPhotoGuide: '샘플사진을 확인해 주세요!',
  leaveChannel: <Box customStyle={{ marginTop: 12 }}>채팅방 나가기</Box>,
  successMakeAppointment: (
    <Box customStyle={{ margin: '12px 0' }}>
      직거래 약속을 잡았어요
      <br />
      매물을 예약중으로 바꿀까요?
    </Box>
  ),
  cancelAppointment: <Box customStyle={{ marginTop: 12 }}>상대방과 직거래 약속을 취소할까요?</Box>,
  requiredAppUpdateForChat: (
    <Box customStyle={{ margin: '12px 0' }}>
      채팅 메세지를 확인하려면
      <br />
      업데이트가 필요해요
    </Box>
  ),
  leaveEditProfile: <Box customStyle={{ marginTop: 12 }}>페이지를 나가시겠어요?</Box>,
  featureIsMobileAppDown: '이 기능은 앱에서만 할 수 있어요!',
  legitSampleGuid: '샘플사진을 확인해주세요!',
  legitPermissionCheck: (
    <>
      모든 사진 권한 및 카메라 권한을
      <br />
      설정해주세요.
    </>
  ),
  leaveLegitRequest: <Box customStyle={{ marginTop: 12 }}>사진감정 신청을 중단하시겠습니까?</Box>,
  productSoldout: '판매 완료된 매물입니다',
  productDelete: '삭제된 매물입니다',
  productHidden: '숨긴 매물입니다',
  productReservation: '예약중인 매물입니다',
  locationInfo: <Box customStyle={{ marginTop: 12 }}>위치정보 권한을 허용해주세요</Box>,
  endEvent: '종료된 이벤트입니다.',
  notiChannelFalse: '',
  notiDeviceFalse: '',
  requiredAppUpdateForSafePayment: (
    <Box customStyle={{ margin: '12px 0 0' }}>
      안전결제를 이용하려면
      <br />앱 업데이트가 필요해요
    </Box>
  ),
  osAlarm: (
    <Flexbox
      alignment="center"
      justifyContent="center"
      customStyle={{ position: 'relative', width: 70, height: 52, margin: '0 auto', marginTop: 10 }}
    >
      <Typography customStyle={{ fontSize: 52 }}>🔔</Typography>
      <Label
        variant="solid"
        brandColor="black"
        text="알림설정"
        customStyle={{
          position: 'absolute',
          top: -5,
          right: -20,
          borderRadius: 12,
          padding: '4px 8px',
          minWidth: 59
        }}
      />
    </Flexbox>
  )
};

export const dialogContent = {
  readyNextCrazyCuration: (
    <>
      벌써 이번주는 다 마감됐어요.
      <br />
      월요일에 다시 급처 매물 모아올게요!
    </>
  ),
  endCrazyCuration: '다른 중고 명품 전국에서 찾아볼까요?',
  legitRequestOnlyInApp: (
    <>
      카멜App에서 사진으로 간편하게
      <br />
      실시간 정가품의견 받아보세요
    </>
  ),
  legitRequestOnlyInIOS: (
    <>
      빠르게 Android에서도
      <br />
      사용가능하게 준비하겠습니다.
    </>
  ),
  legitServiceNotice: (
    <Box customStyle={{ marginBottom: 12 }}>
      카멜의 실시간 사진감정이
      <br />
      10월 중순에 재개될 예정입니다.
      <br />
      조금만 기다려 주세요 🙏
    </Box>
  ),
  appUpdateNotice: (
    <Box customStyle={{ marginBottom: 12 }}>
      원활한 이용을 위해 최신
      <br />
      App으로 업데이트해주세요.
    </Box>
  ),
  appAuthCheck: (
    <Box customStyle={{ marginBottom: 12 }}>
      내 물건의 사진을 등록하려면
      <br />
      권한이 필요해요
    </Box>
  ),
  legitPhotoGuide: (
    <Box customStyle={{ marginBottom: 12 }}>
      어떻게 등록해야 감정결과를
      <br />더 빨리 받을 수 있는지 알아보세요.
    </Box>
  ),
  leaveChannel: (
    <Box customStyle={{ marginBottom: 12 }}>
      채팅방을 나가도 상대방이 말을 걸면
      <br />
      다시 열릴 수 있어요.
    </Box>
  ),
  cancelAppointment: <Box customStyle={{ marginBottom: 12 }}>상대방에게 알림이 발송됩니다.</Box>,
  loginError: (
    <>
      앗! 로그인 오류가 발생했어요😰
      <br />
      다시 시도하시거나 1:1문의를 이용해주세요.
    </>
  ),
  leaveEditProfile: (
    <Box customStyle={{ marginBottom: 12 }}>
      수정한 내용이 저장되지 않았어요.
      <br />
      그래도 떠나시나요?
    </Box>
  ),
  featureIsMobileAppDown: '지금 바로 앱을 다운받아볼까요?',
  locationInfo: (
    <Box customStyle={{ marginBottom: 12 }}>
      주변에 있는 당근마켓의 꿀매물을
      <br />
      보시려면 허용해주세요!
    </Box>
  ),
  legitSampleGuid: (
    <Box customStyle={{ marginBottom: 8 }}>
      어떻게 등록해야 감정결과를
      <br />더 빨리 받을 수 있는지 알아보세요.
    </Box>
  ),
  legitPermissionCheck: (
    <Box customStyle={{ marginBottom: 8 }}>
      내 물건의 사진을 등록하려면
      <br />
      권한이 필요해요
    </Box>
  ),
  leaveLegitRequest: (
    <Box customStyle={{ marginBottom: 12 }}>
      매물등록은 완료되며
      <br />
      사진감정은 &quot;마이&quot;에서 이어할 수 있습니다.
    </Box>
  ),
  productSoldout: '판매 완료된 매물은 수정이 불가능합니다.',
  productDelete: '삭제 된 매물은 수정이 불가능합니다.',
  productHidden: '숨긴 매물은 수정이 불가능합니다.',
  productReservation: '예약중인 매물은 수정이 불가능합니다.',
  notiChannelFalse: (
    <Box customStyle={{ paddingTop: 20 }}>
      <Typography customStyle={{ fontSize: 52 }}>🫢</Typography>
      <Typography weight="bold" variant="h3" customStyle={{ marginTop: 32 }}>
        채팅알림이 꺼져있어요!
      </Typography>
      <Typography variant="h4" customStyle={{ marginTop: 8 }}>
        알림이 꺼져있으면 채팅을 받을 수 없어요.
      </Typography>
    </Box>
  ),
  notiDeviceFalse: (
    <Box customStyle={{ paddingTop: 20 }}>
      <Typography customStyle={{ fontSize: 52 }}>🫢</Typography>
      <Typography weight="bold" variant="h3" customStyle={{ marginTop: 32 }}>
        기기 알림이 꺼져있어요!
      </Typography>
      <Typography variant="h4" customStyle={{ marginTop: 8 }}>
        알림이 꺼져있으면 채팅을 받을 수 없어요.
        <br />
        설정으로 이동하여 알림을 켜주세요.
      </Typography>
    </Box>
  ),
  requiredAppUpdateForSafePayment: (
    <Typography variant="h4" customStyle={{ marginBottom: 12 }}>
      스토어로 이동하여 최신버전으로
      <br />
      업데이트해주세요.
    </Typography>
  ),
  osAlarm: (
    <>
      <Typography variant="h3" weight="bold" customStyle={{ marginTop: 32 }}>
        채팅과 가격 변동, 사진 감정결과를
        <br />
        실시간으로 보내드려요
      </Typography>
      <Typography customStyle={{ marginTop: 8 }}>설정에서 언제든 변경이 가능해요</Typography>
    </>
  )
};

export const firstButtonText: Record<
  Extract<
    DialogType,
    | 'closedCrazyCuration'
    | 'readyNextCrazyCuration'
    | 'endCrazyCuration'
    | 'deleteLegitAdminOpinion'
    | 'deleteLegitResultComment'
    | 'deleteLegitResultReply'
    | 'appAuthCheck'
    | 'unblockBlockedUser'
    | 'leaveChannel'
    | 'blockUser'
    | 'confirmDeal'
    | 'successMakeAppointment'
    | 'cancelAppointment'
    | 'loginError'
    | 'deleteAccount'
    | 'leaveEditProfile'
    | 'legitPermissionCheck'
    | 'leaveLegitRequest'
  >,
  string | number | ReactElement
> = {
  readyNextCrazyCuration: '홈으로 가기',
  closedCrazyCuration: '아니오',
  endCrazyCuration: '아니오',
  deleteLegitAdminOpinion: '취소',
  deleteLegitResultComment: '취소',
  deleteLegitResultReply: '취소',
  appAuthCheck: '설정으로 이동',
  unblockBlockedUser: '차단 해제하기',
  leaveChannel: '취소',
  blockUser: '취소',
  confirmDeal: '네, 거래했어요.',
  successMakeAppointment: '예약중으로 변경',
  cancelAppointment: '약속 취소하기',
  loginError: '확인',
  deleteAccount: '회원탈퇴',
  leaveEditProfile: '취소',
  legitPermissionCheck: '취소',
  leaveLegitRequest: '취소'
};

export const secondButtonText: Record<
  Extract<
    DialogType,
    | 'closedCrazyCuration'
    | 'readyNextCrazyCuration'
    | 'endCrazyCuration'
    | 'deleteLegitAdminOpinion'
    | 'deleteLegitResultComment'
    | 'deleteLegitResultReply'
    | 'legitRequestOnlyInApp'
    | 'legitRequestOnlyInIOS'
    | 'legitServiceNotice'
    | 'appUpdateNotice'
    | 'appAuthCheck'
    | 'legitPhotoGuide'
    | 'unblockBlockedUser'
    | 'leaveChannel'
    | 'blockUser'
    | 'confirmDeal'
    | 'successMakeAppointment'
    | 'cancelAppointment'
    | 'requiredAppUpdateForChat'
    | 'loginError'
    | 'loginProviderError'
    | 'deleteAccount'
    | 'leaveEditProfile'
    | 'featureIsMobileAppDown'
    | 'locationInfo'
    | 'legitSampleGuid'
    | 'legitPermissionCheck'
    | 'leaveLegitRequest'
    | 'productSoldout'
    | 'productDelete'
    | 'productHidden'
    | 'productReservation'
    | 'endEvent'
    | 'notiChannelFalse'
    | 'notiDeviceFalse'
    | 'requiredAppUpdateForSafePayment'
    | 'osAlarm'
  >,
  string | number | ReactElement
> = {
  readyNextCrazyCuration: '검색하기',
  closedCrazyCuration: '찾아볼래요',
  endCrazyCuration: '검색할래요',
  deleteLegitAdminOpinion: '확인',
  deleteLegitResultComment: '확인',
  deleteLegitResultReply: '확인',
  legitRequestOnlyInApp: '3초 앱 다운로드',
  legitRequestOnlyInIOS: '확인',
  legitServiceNotice: '확인',
  appUpdateNotice: '3초 업데이트',
  appAuthCheck: '취소',
  legitPhotoGuide: '사진 샘플 보기',
  unblockBlockedUser: '취소',
  leaveChannel: '나가기',
  blockUser: '차단하기',
  confirmDeal: '취소',
  successMakeAppointment: '취소',
  cancelAppointment: '취소',
  requiredAppUpdateForChat: '스토어로 이동하기',
  loginError: '1:1 문의',
  loginProviderError: '확인',
  deleteAccount: '회원정보 유지',
  leaveEditProfile: '나가기',
  featureIsMobileAppDown: '3초 앱 다운로드',
  legitSampleGuid: '사진 샘플 보기',
  legitPermissionCheck: '설정으로 이동',
  leaveLegitRequest: '확인',
  productSoldout: '확인',
  productDelete: '확인',
  productHidden: '확인',
  productReservation: '확인',
  locationInfo: '동의하고 매물보기',
  endEvent: '확인',
  notiChannelFalse: '채팅알림 켜기',
  notiDeviceFalse: '알림 켜기',
  requiredAppUpdateForSafePayment: '3초 업데이트',
  osAlarm: '확인'
};

const dialog = {
  dialogTitle,
  dialogContent,
  firstButtonText,
  secondButtonText
};

export default dialog;
