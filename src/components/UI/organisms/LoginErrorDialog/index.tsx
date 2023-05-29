import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import ChannelTalk from '@library/channelTalk';

import { LOGIN_TYPE } from '@hooks/useSignIn';

interface LoginErrorDialogProps {
  variant?: 'common' | 'provider';
  provider: string;
  open: boolean;
  onClose: () => void;
}

function LoginErrorDialog({ variant = 'common', provider, open, onClose }: LoginErrorDialogProps) {
  if (variant === 'provider' && provider) {
    return (
      <Dialog open={open} onClose={onClose}>
        <Typography variant="h4">
          {`${LOGIN_TYPE[provider as keyof typeof LOGIN_TYPE]} 로그인 오류가 발생했어요😰`}
          <br />
          다른 방법을 시도해 보세요.
        </Typography>
        <Button
          fullWidth
          variant="solid"
          brandColor="primary"
          size="large"
          onClick={onClose}
          customStyle={{
            marginTop: 20
          }}
        >
          확인
        </Button>
      </Dialog>
    );
  }
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h4">
        앗! 로그인 오류가 발생했어요😰
        <br />
        다시 시도하시거나 1:1문의를 이용해주세요.
      </Typography>
      <Flexbox
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={onClose}>
          확인
        </Button>
        <Button
          fullWidth
          variant="ghost"
          brandColor="black"
          size="large"
          onClick={() => ChannelTalk.showMessenger()}
        >
          1:1 문의
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default LoginErrorDialog;
