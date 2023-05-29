import { useRouter } from 'next/router';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface AppointmentMakeSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onClick: () => void;
}

function AppointmentMakeSuccessDialog({
  open,
  onClose,
  onClick
}: AppointmentMakeSuccessDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        직거래 약속을 잡았어요
        <br />
        매물을 예약중으로 바꿀까요?
      </Typography>
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={onClick}>
          예약중으로 변경
        </Button>
        <Button
          fullWidth
          variant="ghost"
          brandColor="black"
          size="large"
          onClick={() => router.back()}
        >
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default AppointmentMakeSuccessDialog;
