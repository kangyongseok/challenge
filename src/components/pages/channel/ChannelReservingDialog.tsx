import { useRecoilState } from 'recoil';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Typography } from '@mrcamelhub/camel-ui';

import { channelDialogStateFamily } from '@recoil/channel';

function ChannelReservingDialog() {
  const [{ open }, setOpenState] = useRecoilState(channelDialogStateFamily('reserving'));

  return (
    <Dialog
      open={open}
      onClose={() =>
        setOpenState((prevState) => ({
          ...prevState,
          open: false
        }))
      }
    >
      <Typography variant="h3" weight="bold" textAlign="center">
        예약중인 매물은 결제할 수 없어요.
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        판매자에게 구매할 수 있는지 문의해보세요.
      </Typography>
      <Button
        variant="solid"
        size="large"
        brandColor="black"
        fullWidth
        onClick={() =>
          setOpenState((prevState) => ({
            ...prevState,
            open: false
          }))
        }
        customStyle={{
          marginTop: 32
        }}
      >
        확인
      </Button>
    </Dialog>
  );
}

export default ChannelReservingDialog;
