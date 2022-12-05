import type { ReactElement } from 'react';

import { Box } from 'mrcamel-ui';

import type { DialogType } from '@typings/common';

export const dialogTitle: Record<DialogType, string | number | ReactElement> = {
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
  legitPhotoGuide: '샘플사진을 확인해 주세요!'
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
  >,
  string | number | ReactElement
> = {
  readyNextCrazyCuration: '홈으로 가기',
  closedCrazyCuration: '아니오',
  endCrazyCuration: '아니오',
  deleteLegitAdminOpinion: '취소',
  deleteLegitResultComment: '취소',
  deleteLegitResultReply: '취소',
  appAuthCheck: '설정으로 이동'
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
  legitPhotoGuide: '사진 샘플 보기'
};

const dialog = {
  dialogTitle,
  dialogContent,
  firstButtonText,
  secondButtonText
};

export default dialog;
