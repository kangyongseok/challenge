import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

interface UserWithdrawalDialogProps {
  open: boolean;
  onClose: () => void;
  onClick: () => void;
}

function UserWithdrawalDialog({ open, onClose, onClick }: UserWithdrawalDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h4">
        지금까지 쌓아놓은 검색 이력과 찜 리스트,
        <br />
        맞춤 추천을 위한 정보가 모두 삭제됩니다.
        <br />
        그래도 회원탈퇴 하시겠어요?
      </Typography>
      <Flexbox
        gap={8}
        customStyle={{
          marginTop: 20
        }}
      >
        <Button fullWidth variant="ghost" brandColor="black" size="large" onClick={onClick}>
          회원탈퇴
        </Button>
        <Button fullWidth variant="solid" brandColor="primary" size="large" onClick={onClose}>
          회원정보 유지
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default UserWithdrawalDialog;
