import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { putOrderConfirm } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { ordersDetailPurchaseConfirmDialogState } from '@recoil/ordersDetail';

function OrdersDetailPurchaseConfirmDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const [{ open, variant }, setOpenState] = useRecoilState(ordersDetailPurchaseConfirmDialogState);

  const { mutate, isLoading } = useMutation(putOrderConfirm);

  const handleClick = () => {
    mutate(Number(id), {
      async onSuccess() {
        await queryClient.refetchQueries(queryKeys.orders.order(Number(id)));
        setOpenState((prevState) => ({
          ...prevState,
          open: false
        }));
      }
    });
  };

  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography variant="h3" weight="bold">
        {variant === 'delivery' ? '구매하신 매물 잘 받으셨나요?' : '직거래를 완료하셨나요?'}
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        매물을 꼼꼼히 확인 후 구매확정해주세요. 구매확정 후 반품/교환은 불가능합니다.
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
          구매확정
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default OrdersDetailPurchaseConfirmDialog;
