import { useRecoilState } from 'recoil';
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useMutation
} from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { putOrderConfirm } from '@api/order';

import { channelDialogStateFamily } from '@recoil/channel';

interface ChannelDeliveryCompleteConfirmDialogProps {
  order?: Order | null;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelDeliveryCompleteConfirmDialog({
  order,
  refetchChannel
}: ChannelDeliveryCompleteConfirmDialogProps) {
  const [{ open }, setOpenState] = useRecoilState(
    channelDialogStateFamily('deliveryCompleteConfirm')
  );

  const { mutate, isLoading } = useMutation(putOrderConfirm);

  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  const handleClick = () => {
    mutate(order?.id || 0, {
      async onSuccess() {
        await refetchChannel();
        setOpenState((prevState) => ({
          ...prevState,
          open: false
        }));
      }
    });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography variant="h3" weight="bold">
        배송완료로 변경할까요?
      </Typography>
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          marginTop: 32
        }}
      >
        <Button
          variant="solid"
          brandColor="black"
          size="large"
          fullWidth
          disabled={isLoading}
          onClick={handleClick}
        >
          변경하기
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default ChannelDeliveryCompleteConfirmDialog;
