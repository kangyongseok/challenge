import { useRecoilState } from 'recoil';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { Button, Dialog, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { fetchProduct } from '@api/product';
import { fetchOrderSearch, postOrderConfirm } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { mypageOrdersPurchaseConfirmDialogState } from '@recoil/mypageOrders';

function MypageOrdersPurchaseConfirmDialog() {
  const [{ open, order }, setDialogState] = useRecoilState(mypageOrdersPurchaseConfirmDialogState);
  const productId = order?.orderDetails[0]?.targetId || 0;

  const { refetch } = useInfiniteQuery(
    queryKeys.orders.orderSearch({
      type: 0,
      isConfirmed: false,
      page: 0
    }),
    ({ pageParam = 0 }) =>
      fetchOrderSearch({
        type: 0,
        isConfirmed: false,
        page: pageParam
      }),
    {
      getNextPageParam: ({ number }, allPages) => (allPages.length <= 10 ? number + 1 : undefined)
    }
  );

  const { data: { product } = {}, isLoading } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      refetchOnMount: true,
      enabled: !!productId
    }
  );

  const { mutate } = useMutation(postOrderConfirm);

  const handleClose = () =>
    setDialogState({
      open: false,
      order: null
    });

  const handleClick = () => {
    logEvent(attrKeys.mypage.CLICK_ORDER_STATUS, {
      name: attrProperty.name.ORDER_LIST,
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
        await refetch();
        setDialogState({
          open: false,
          order: null
        });
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
          disabled={!order || isLoading}
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

export default MypageOrdersPurchaseConfirmDialog;
