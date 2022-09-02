import { ReactElement } from 'react';

import { DialogType } from '@typings/common';

export const dialogTitle: Record<DialogType, string | number | ReactElement> = {
  SNSShare: '공유하기',
  closedCrazyCuration: '앗! 이미 마감된 테마에요.'
};

export const dialogContent = {
  closedCrazyCuration: '다른 중고 명품 전국에서 찾아볼까요?'
};

export const firstButtonText: Record<
  Extract<DialogType, 'closedCrazyCuration'>,
  string | number | ReactElement
> = {
  closedCrazyCuration: '아니오'
};

export const secondButtonText: Record<
  Extract<DialogType, 'closedCrazyCuration'>,
  string | number | ReactElement
> = {
  closedCrazyCuration: '구경할래요'
};

const dialog = {
  dialogTitle,
  dialogContent,
  firstButtonText,
  secondButtonText
};

export default dialog;
