import { useMemo } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { Flexbox, Toast, Typography, useTheme } from 'mrcamel-ui';

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
          <Typography
            weight="medium"
            customStyle={{ flexGrow: 1, color: palette.common.white, textAlign: 'left' }}
          >
            {toastText[type][status]}
          </Typography>
          <Typography
            onClick={action}
            customStyle={{ textDecoration: 'underline', color: palette.common.grey['80'] }}
          >
            {toastActionButtonText[type as keyof typeof toastActionButtonText][status]}
          </Typography>
        </Flexbox>
      )}
    </Toast>
  );
}

export default ToastProvider;
