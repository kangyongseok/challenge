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

import { logEvent } from '@library/amplitude';

import { putOrderCancel } from '@api/order';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelDialogStateFamily } from '@recoil/channel';

interface ChannelCancelRequestApproveDialogProps {
  order?: Order | null;
  productId: number;
  isSeller: boolean;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelCancelRequestApproveDialog({
  order,
  productId,
  isSeller,
  refetchChannel
}: ChannelCancelRequestApproveDialogProps) {
  const [{ open }, setOpenState] = useRecoilState(
    channelDialogStateFamily('orderCancelRequestApprove')
  );

  const { mutate, isLoading } = useMutation(putOrderCancel);

  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  const handleClick = () => {
    logEvent(attrKeys.orderDetail.SUBMIT_ORDER_CANCEL, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.APPROVE,
      orderId: order?.id,
      productId,
      att: isSeller ? 'BUYER' : 'SELLER'
    });

    mutate(
      {
        id: order?.id || 0,
        type: 1
      },
      {
        async onSuccess() {
          await refetchChannel();
          setOpenState((prevState) => ({
            ...prevState,
            open: false
          }));
        }
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography variant="h3" weight="bold">
        주문취소 요청을 승인할까요?
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
          onClick={handleClick}
          disabled={isLoading}
        >
          취소요청 승인
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default ChannelCancelRequestApproveDialog;
