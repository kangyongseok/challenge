import { useRecoilState } from 'recoil';
import { Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';
import { useMutation } from '@tanstack/react-query';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';

import type { ProductResult } from '@dto/product';
import type { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { postOrderConfirm } from '@api/order';

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

  const { mutate } = useMutation(postOrderConfirm);

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
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      customStyle={{
        maxWidth: 311,
        padding: '32px 20px 20px'
      }}
    >
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          textAlign: 'center'
        }}
      >
        구매한 매물을 구매확정할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8,
          textAlign: 'center'
        }}
      >
        매물상태를 확인하고 구매확정해주세요.
        <br />
        구매확정 후 반품은 불가능합니다.
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
