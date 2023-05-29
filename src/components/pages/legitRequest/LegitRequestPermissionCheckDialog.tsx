import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface LegitRequestPermissionCheckDialogProps {
  open: boolean;
  onClose: () => void;
  onClick: () => void;
}

function LegitRequestPermissionCheckDialog({
  open,
  onClose,
  onClick
}: LegitRequestPermissionCheckDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        모든 사진 권한 및 카메라 권한을
        <br />
        설정해주세요.
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
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={onClose}>
          취소
        </Button>
        <Button fullWidth variant="ghost" brandColor="black" size="large" onClick={onClick}>
          설정으로 이동
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default LegitRequestPermissionCheckDialog;
