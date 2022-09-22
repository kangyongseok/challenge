import { useMemo } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { toastActionButtonText, toastText } from '@constants/toast';

import { toastState } from '@recoil/common';

function ToastProvider() {
  const {
    theme: { palette }
  } = useTheme();
  const { type, status, hideDuration, action } = useRecoilValue(toastState);
  const resetToastState = useResetRecoilState(toastState);
  const toastDisplayType = useMemo(() => {
    if (
      Object.keys(toastActionButtonText).includes(type || '') &&
      Object.values(toastActionButtonText)
        .flatMap((i) => Object.keys(i))
        .includes(status || '')
    )
      return 'textWithActionButton';

    return 'text';
  }, [status, type]);

  return (
    <Toast open={!!type && !!status} autoHideDuration={hideDuration} onClose={resetToastState}>
      {type && status && toastDisplayType === 'text' && (
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
          {toastText[type][status]}
        </Typography>
      )}
      {type && status && toastDisplayType === 'textWithActionButton' && (
        <Flexbox alignment="center">
          <Text weight="medium">{toastText[type][status]}</Text>
          <ActionButton onClick={action}>
            {toastActionButtonText[type as keyof typeof toastActionButtonText][status]}
          </ActionButton>
        </Flexbox>
      )}
    </Toast>
  );
}

const Text = styled(Typography)`
  flex-grow: 1;
  color: ${({ theme: { palette } }) => palette.common.white};
  text-align: left;
`;

const ActionButton = styled(Typography)`
  text-decoration: underline;
  color: ${({ theme: { palette } }) => palette.common.grey['80']};
  cursor: pointer;
`;

export default ToastProvider;
