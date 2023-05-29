import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

interface AppUpdateForChatDialogProps {
  open: boolean;
}

function AppUpdateForChatDialog({ open }: AppUpdateForChatDialogProps) {
  return (
    <Dialog open={open}>
      <Typography variant="h3" weight="bold">
        채팅 메세지를 확인하려면
        <br />
        업데이트가 필요해요
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={() => {
          window.webkit?.messageHandlers?.callExecuteApp?.postMessage?.(
            'itms-apps://itunes.apple.com/app/id1541101835'
          );
        }}
        customStyle={{
          marginTop: 20
        }}
      >
        스토어로 이동하기
      </Button>
    </Dialog>
  );
}

export default AppUpdateForChatDialog;
