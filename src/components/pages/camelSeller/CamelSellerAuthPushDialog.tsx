import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

interface CamelSellerAuthPushDialogProps {
  open: boolean;
  onClose: () => void;
}

function CamelSellerAuthPushDialog({ open, onClose }: CamelSellerAuthPushDialogProps) {
  const handeClick = () => {
    logEvent(attrKeys.camelSeller.CLICK_ALARM, {
      name: attrProperty.name.ALARM_POPUP,
      title: 'DEVICE_ALARM'
    });

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
      <Typography customStyle={{ fontSize: 52 }}>🫢</Typography>
      <Typography weight="bold" variant="h3" customStyle={{ marginTop: 32 }}>
        기기 알림이 꺼져있어요!
      </Typography>
      <Typography variant="h4" customStyle={{ marginTop: 8 }}>
        알림이 꺼져있으면 채팅을 받을 수 없어요.
        <br />
        설정으로 이동하여 알림을 켜주세요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={handeClick}
        customStyle={{
          marginTop: 20
        }}
      >
        알림 켜기
      </Button>
    </Dialog>
  );
}

export default CamelSellerAuthPushDialog;
