import { useEffect } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import { parseToDashPhoneNumber } from '@utils/common';

import { camelSellerSMSDialogState, camelSellerSubmitState } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function CamelSellerSmsDialog() {
  const [state, setOpen] = useRecoilState(camelSellerSMSDialogState);
  const submitData = useRecoilValue(camelSellerSubmitState);
  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    if (!submitData?.title) {
      setTimeout(() => {
        setOpen(true);
      }, 100);
    }
  }, [setOpen, submitData]);

  return (
    <Dialog
      open={state}
      onClose={() => setOpen(false)}
      customStyle={{ width: 311, height: 284, padding: 20, textAlign: 'center' }}
    >
      <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
        <Typography customStyle={{ fontSize: 52, height: 52, paddingTop: 20 }}>💬</Typography>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
          <Typography variant="h3" weight="bold">
            구매연락은 문자메시지로!
          </Typography>
          <Typography variant="body1">
            입력해두신 {parseToDashPhoneNumber(accessUser?.phone as string)}으로
            <br />
            구매자가 SMS를 보냅니다.
          </Typography>
        </Flexbox>
        <Button
          fullWidth
          size="large"
          variant="solid"
          brandColor="primary"
          customStyle={{ marginTop: 'auto' }}
          onClick={() => setOpen(false)}
        >
          알겠어요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default CamelSellerSmsDialog;
