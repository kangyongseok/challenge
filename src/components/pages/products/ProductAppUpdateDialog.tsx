import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

interface ProductAppUpdateDialogProps {
  open: boolean;
  onClose: () => void;
}

function ProductAppUpdateDialog({ open, onClose }: ProductAppUpdateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        안전결제를 이용하려면
        <br />앱 업데이트가 필요해요
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        스토어로 이동하여 최신버전으로
        <br />
        업데이트해주세요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={() => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callExecuteApp
          )
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
        }}
        customStyle={{
          marginTop: 20
        }}
      >
        3초 업데이트
      </Button>
    </Dialog>
  );
}

export default ProductAppUpdateDialog;
