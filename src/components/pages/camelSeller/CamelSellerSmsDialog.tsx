import { useEffect } from 'react';

import { useRecoilState } from 'recoil';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import { parseToDashPhoneNumber } from '@utils/common';

import { camelSellerDialogStateFamily } from '@recoil/camelSeller';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function CamelSellerSmsDialog() {
  const [state, setOpen] = useRecoilState(camelSellerDialogStateFamily('initDialog'));
  const { data: accessUser } = useQueryAccessUser();
  useEffect(() => {
    setTimeout(() => {
      setOpen(({ type }) => ({
        type,
        open: true
      }));
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog
      open={state.open}
      onClose={() =>
        setOpen(({ type }) => ({
          type,
          open: false
        }))
      }
      customStyle={{ width: 311, height: 284, padding: 20, textAlign: 'center' }}
    >
      <Flexbox direction="vertical" customStyle={{ height: '100%' }}>
        <Typography customStyle={{ fontSize: 52, height: 52, paddingTop: 20 }}>💬</Typography>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 32 }}>
          <Typography variant="h4" weight="bold">
            문자를 통해 거래 연락을 받을거에요
          </Typography>
          <Typography variant="body1">
            입력해둔 {parseToDashPhoneNumber(accessUser?.phone as string)}으로
            <br />
            구매자들이 연락하게 됩니다.
          </Typography>
        </Flexbox>
        <Button
          fullWidth
          size="large"
          variant="contained"
          brandColor="primary"
          customStyle={{ marginTop: 'auto' }}
          onClick={() =>
            setOpen(({ type }) => ({
              type,
              open: false
            }))
          }
        >
          알겠어요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default CamelSellerSmsDialog;
