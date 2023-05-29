import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

interface AppUpdateNoticeDialogProps {
  open: boolean;
  onClose: () => void;
  onClick: () => void;
}

function AppUpdateNoticeDialog({ open, onClose, onClick }: AppUpdateNoticeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        카멜 App이 업데이트 되었어요!
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        원활한 이용을 위해 최신
        <br />
        App으로 업데이트해주세요.
      </Typography>
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={onClick}
        customStyle={{
          marginTop: 20
        }}
      >
        3초 업데이트
      </Button>
    </Dialog>
  );
}

export default AppUpdateNoticeDialog;
