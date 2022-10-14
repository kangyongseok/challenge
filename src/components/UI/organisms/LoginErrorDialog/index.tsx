import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import ChannelTalk from '@library/channelTalk';

interface LoginErrorDialogProps {
  open: boolean;
  onClose: () => void;
  provider?: string;
}

function LoginErrorDialog({ open, onClose, provider }: LoginErrorDialogProps) {
  if (provider) {
    return (
      <Dialog open={open} onClose={onClose}>
        <Typography
          variant="body1"
          weight="medium"
          customStyle={{ marginBottom: 20, textAlign: 'center' }}
        >
          {`${provider} 로그인 오류가 발생했어요😰`}
          <br />
          다른 방법을 시도해 보세요.
        </Typography>
        <Button variant="ghost" brandColor="black" customStyle={{ width: 263 }} onClick={onClose}>
          확인
        </Button>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      {
        <>
          <Typography
            variant="body1"
            weight="medium"
            customStyle={{ marginBottom: 20, textAlign: 'center' }}
          >
            앗! 로그인 오류가 발생했어요😰
            <br />
            다시 시도하시거나 1:1문의를 이용해주세요.
          </Typography>
          <Flexbox gap={7}>
            <Button
              variant="ghost"
              brandColor="black"
              customStyle={{ width: 128 }}
              onClick={onClose}
            >
              확인
            </Button>
            <Button
              variant="contained"
              brandColor="primary"
              customStyle={{ width: 128 }}
              // TODO 병합시 호출 변경
              onClick={() => ChannelTalk.showMessenger}
            >
              1:1 문의
            </Button>
          </Flexbox>
        </>
      }
    </Dialog>
  );
}

export default LoginErrorDialog;
