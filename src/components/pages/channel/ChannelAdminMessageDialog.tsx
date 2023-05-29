import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

interface ChannelAdminMessageDialogProps {
  variant?: string;
  open: boolean;
  onClose: () => void;
}

function ChannelAdminMessageDialog({ variant, open, onClose }: ChannelAdminMessageDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      {variant !== 'productSoldOut' && (
        <>
          <Typography variant="h3" weight="bold">
            판매 완료된 매물입니다.
          </Typography>
          <Typography
            variant="h4"
            customStyle={{
              marginTop: 8
            }}
          >
            판매 완료된 매물은 수정이 불가능합니다.
          </Typography>
        </>
      )}
      {variant === 'productDelete' && (
        <>
          <Typography variant="h3" weight="bold">
            삭제된 매물입니다.
          </Typography>
          <Typography
            variant="h4"
            customStyle={{
              marginTop: 8
            }}
          >
            삭제된 매물은 수정이 불가능합니다.
          </Typography>
        </>
      )}
      {variant === 'productHidden' && (
        <>
          <Typography variant="h3" weight="bold">
            숨긴 매물입니다.
          </Typography>
          <Typography
            variant="h4"
            customStyle={{
              marginTop: 8
            }}
          >
            숨긴 매물은 수정이 불가능합니다.
          </Typography>
        </>
      )}
      {variant === 'productReservation' && (
        <>
          <Typography variant="h3" weight="bold">
            예약중인 매물입니다.
          </Typography>
          <Typography
            variant="h4"
            customStyle={{
              marginTop: 8
            }}
          >
            예약중인 매물은 수정이 불가능합니다.
          </Typography>
        </>
      )}
      <Button
        fullWidth
        variant="solid"
        brandColor="primary"
        size="large"
        onClick={onClose}
        customStyle={{
          marginTop: 20
        }}
      >
        확인
      </Button>
    </Dialog>
  );
}

export default ChannelAdminMessageDialog;
