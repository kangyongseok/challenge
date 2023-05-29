import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface AppointmentCancelDialogProps {
  open: boolean;
  onClose: () => void;
  onClick: () => void;
}

function AppointmentCancelDialog({ open, onClose, onClick }: AppointmentCancelDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        상대방과 직거래 약속을 취소할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        상대방에게 알림이 발송됩니다.
      </Typography>
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="solid" brandColor="black" size="large" onClick={onClick}>
          약속 취소하기
        </Button>
        <Button fullWidth variant="ghost" brandColor="black" size="large" onClick={onClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default AppointmentCancelDialog;
