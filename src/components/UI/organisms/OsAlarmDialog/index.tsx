import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { checkAgent } from '@utils/common';

interface OsAlarmDialogProps {
  open: boolean;
  onClose: () => void;
}

function OsAlarmDialog({ open, onClose }: OsAlarmDialogProps) {
  const handleClick = () => {
    if (checkAgent.isAndroidApp() && window.webview && window.webview.moveToSetting) {
      window.webview.moveToSetting();
    }
    if (
      checkAgent.isIOSApp() &&
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callMoveToSetting &&
      window.webkit.messageHandlers.callMoveToSetting.postMessage
    ) {
      window.webkit.messageHandlers.callMoveToSetting.postMessage(0);
    }

    onClose();
  };

  return (
    <Dialog open={open}>
      <Typography variant="h3" weight="bold">
        🔕 기기 알림이 꺼져있어요!
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        채팅 알림, 가격 변동, 꿀매물 알림을
        <br /> 놓치지 않도록 알림을 켜주세요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={handleClick}
        customStyle={{
          marginTop: 20
        }}
      >
        확인
      </Button>
    </Dialog>
  );
}

export default OsAlarmDialog;
