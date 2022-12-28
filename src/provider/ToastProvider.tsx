import { useMemo } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { Flexbox, ThemeProvider, Toast, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { toastActionButtonText, toastText } from '@constants/toast';

import { toastState } from '@recoil/common';

function ToastProvider() {
  const { type, status, theme, params, hideDuration, action, customStyle } =
    useRecoilValue(toastState);
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

  const parsedToastText = useMemo(() => {
    let text = '';
    if (type && status && toastDisplayType === 'text') {
      text = toastText[type][status] as string;

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          text = text.replace(`{${key}}`, String(value));
        });
      }
    }

    return text;
  }, [params, status, toastDisplayType, type]);

  return (
    <ThemeProvider theme={theme || 'light'}>
      <Toast
        open={!!type && !!status}
        autoHideDuration={hideDuration}
        onClose={resetToastState}
        customStyle={customStyle}
      >
        {type && status && toastDisplayType === 'text' && (
          <Content variant="body1" weight="medium">
            {parsedToastText}
          </Content>
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
    </ThemeProvider>
  );
}

const Text = styled(Typography)`
  flex-grow: 1;
  color: ${({ theme: { palette } }) => palette.common.uiWhite};
  text-align: left;
`;

const Content = styled(Typography)`
  color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

const ActionButton = styled(Typography)`
  text-decoration: underline;
  color: ${({ theme: { palette } }) => palette.common.ui80};
  cursor: pointer;
`;

export default ToastProvider;
