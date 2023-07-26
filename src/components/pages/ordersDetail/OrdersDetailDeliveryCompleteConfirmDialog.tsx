import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { putOrderConfirm } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { ordersDetailOpenDeliveryCompleteConfirmDialogState } from '@recoil/ordersDetail';

function OrdersDetailDeliveryCompleteConfirmDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const [open, setOpenState] = useRecoilState(ordersDetailOpenDeliveryCompleteConfirmDialogState);

  const { mutate, isLoading } = useMutation(putOrderConfirm);

  const handleClose = () => setOpenState(false);

  const handleClick = () => {
    mutate(Number(id), {
      async onSuccess() {
        await queryClient.refetchQueries(queryKeys.orders.order(Number(id)));
        setOpenState(false);
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

export default OrdersDetailDeliveryCompleteConfirmDialog;
