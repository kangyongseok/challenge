import { useRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import type { ProductResult } from '@dto/product';
import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { putOrderConfirm } from '@api/order';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelDialogStateFamily } from '@recoil/channel';

interface ChannelPurchaseConfirmDialogProps {
  order?: Order | null;
  product?: ProductResult | null;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelPurchaseConfirmDialog({
  order,
  product,
  refetchChannel
}: ChannelPurchaseConfirmDialogProps) {
  const [{ open }, setOpenState] = useRecoilState(channelDialogStateFamily('purchaseConfirm'));

  const { mutate } = useMutation(putOrderConfirm);

  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.DELIVERY_COMPLETE,
      orderId: order?.id
    });
    logEvent(attrKeys.channel.CLICK_CAMEL, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.DELIVERY_COMPLETE,
      att: 'BUYER',
      ...product
    });

    if (!order) return;

    mutate(order?.id, {
      onSuccess: async () => {
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
      <Typography variant="h3" weight="bold" textAlign="center">
        구매하신 매물 잘 받으셨나요?
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        customStyle={{
          marginTop: 8
        }}
      >
        구매확정 후 반품/교환은 불가능하니
        <br />
        매물을 꼼꼼히 확인 후 구매확정해주세요.
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
          disabled={!order}
        >
          구매확정
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default ChannelPurchaseConfirmDialog;
