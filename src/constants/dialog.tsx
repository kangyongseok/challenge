import { ReactElement } from 'react';

import { DialogType } from '@typings/common';

export const dialogTitle: Record<DialogType, string | number | ReactElement> = {
  SNSShare: '공유하기',
  readyNextCrazyCuration: '다음주 월요일을 기대해주세요!',
  closedCrazyCuration: '앗! 이미 마감된 테마에요.',
  endCrazyCuration: '앗! 이미 마감된 테마에요.'
};

export const dialogContent = {
  readyNextCrazyCuration: (
    <>
      벌써 이번주는 다 마감됐어요.
      <br />
      월요일에 다시 급처 매물 모아올게요!
    </>
  ),
  endCrazyCuration: '다른 중고 명품 전국에서 찾아볼까요?'
};

export const firstButtonText: Record<
  Extract<DialogType, 'closedCrazyCuration' | 'readyNextCrazyCuration' | 'endCrazyCuration'>,
  string | number | ReactElement
> = {
  readyNextCrazyCuration: '홈으로 가기',
  closedCrazyCuration: '아니오',
  endCrazyCuration: '아니오'
};

export const secondButtonText: Record<
  Extract<DialogType, 'closedCrazyCuration' | 'readyNextCrazyCuration' | 'endCrazyCuration'>,
  string | number | ReactElement
> = {
  readyNextCrazyCuration: '검색하기',
  closedCrazyCuration: '찾아볼래요',
  endCrazyCuration: '검색할래요'
};

const dialog = {
  dialogTitle,
  dialogContent,
  firstButtonText,
  secondButtonText
};

export default dialog;
