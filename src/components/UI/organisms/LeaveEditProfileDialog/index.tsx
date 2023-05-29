import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface LeaveEditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onClick: () => void;
}

function LeaveEditProfileDialog({ open, onClose, onClick }: LeaveEditProfileDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h3" weight="bold">
        페이지를 나가시겠어요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        수정한 내용이 저장되지 않았어요.
        <br />
        그래도 떠나시나요?
      </Typography>
      <Flexbox
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={onClose}>
          취소
        </Button>
        <Button fullWidth variant="ghost" brandColor="black" size="large" onClick={onClick}>
          나가기
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default LeaveEditProfileDialog;
