import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { checkAgent } from '@utils/common';

interface AppAuthCheckDialogProps {
  open: boolean;
  onClose: () => void;
}

function AppAuthCheckDialog({ open, onClose }: AppAuthCheckDialogProps) {
  const handleClick = () => {
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callMoveToSetting &&
      window.webkit.messageHandlers.callMoveToSetting.postMessage
    ) {
      window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
    }
    if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
      window.webview.moveToSetting();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        사진 및 카메라 권한을
        <br />
        허용해주세요.
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        내 물건의 사진을 등록하려면
        <br />
        권한이 필요해요
      </Typography>
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={handleClick}>
          설정으로 이동
        </Button>
        <Button fullWidth variant="ghost" brandColor="black" size="large" onClick={onClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default AppAuthCheckDialog;
