import { useRecoilState } from 'recoil';
import { Button, Dialog, Typography } from '@mrcamelhub/camel-ui';

import { settingsAccountConfirmDialogOpenState } from '@recoil/settingsAccount';

function SettingsAccountConfirmDialog() {
  const [open, setOpenState] = useRecoilState(settingsAccountConfirmDialogOpenState);

  return (
    <Dialog
      open={open}
      onChange={() => setOpenState(false)}
      fullWidth
      customStyle={{
        maxWidth: 311,
        padding: '32px 20px 20px'
      }}
    >
      <Typography variant="h3" weight="bold" textAlign="center">
        계좌 등록 실패
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        customStyle={{
          marginTop: 8
        }}
      >
        입력한 정보가 일치하지 않아요.
        <br />
        정보를 다시 확인해주세요.
      </Typography>
      <Button
        variant="solid"
        size="large"
        brandColor="black"
        fullWidth
        onClick={() => setOpenState(false)}
        customStyle={{
          marginTop: 32
        }}
      >
        확인
      </Button>
    </Dialog>
  );
}

export default SettingsAccountConfirmDialog;
