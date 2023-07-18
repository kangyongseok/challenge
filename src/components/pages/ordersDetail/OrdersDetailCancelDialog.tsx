import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { postOrderCancel } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { ordersDetailOpenCancelDialogState } from '@recoil/ordersDetail';

function OrdersDetailCancelDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const [open, setOpenState] = useRecoilState(ordersDetailOpenCancelDialogState);

  const { mutate, isLoading } = useMutation(postOrderCancel);

  const handleClose = () => setOpenState(false);

  const handleClick = () =>
    mutate(
      { id: Number(id) },
      {
        async onSuccess() {
          await queryClient.refetchQueries(queryKeys.orders.order(Number(id)));
          setOpenState(false);
        }
      }
    );

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography variant="h3" weight="bold">
        주문을 정말 취소할까요?
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
          주문취소
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          아니요, 계속 거래할게요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default OrdersDetailCancelDialog;
