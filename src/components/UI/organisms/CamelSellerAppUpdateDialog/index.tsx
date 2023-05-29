import { useRecoilState } from 'recoil';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { checkAgent } from '@utils/common';

import { camelSellerAppUpdateDialogOpenState } from '@recoil/common';

function CamelSellerAppUpdateDialog() {
  const [open, setOpen] = useRecoilState(camelSellerAppUpdateDialogOpenState);

  const handleClick = () => {
    if (checkAgent.isIOSApp()) {
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callExecuteApp
      )
        window.webkit.messageHandlers.callExecuteApp.postMessage(
          'itms-apps://itunes.apple.com/app/id1541101835'
        );
      return;
    }
    if (checkAgent.isAndroidApp()) {
      if (window.webview && window.webview.callExecuteApp) {
        window.webview.callExecuteApp('market://details?id=kr.co.mrcamel.android');
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Typography
        variant="h3"
        weight="bold"
        textAlign="center"
        customStyle={{
          marginTop: 12
        }}
      >
        판매하려면
        <br />
        업데이트가 필요해요.
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        customStyle={{
          marginTop: 8
        }}
      >
        앱 버전이 낮아 판매등록이 불가능해요.
        <br />
        최신버전으로 업데이트해주세요.
      </Typography>
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          marginTop: 32
        }}
      >
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={handleClick}>
          카멜 앱 업데이트
        </Button>
        <Button
          fullWidth
          variant="ghost"
          brandColor="black"
          size="large"
          onClick={() => setOpen(false)}
        >
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default CamelSellerAppUpdateDialog;
