import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { putOrderApprove } from '@api/order';

import { ordersDetailOpenSalesApproveDialogState } from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';

function OrdersDetailSalesApproveDialog() {
  const router = useRouter();
  const { id } = router.query;

  const [open, setOpenState] = useRecoilState(ordersDetailOpenSalesApproveDialogState);

  const { data: { id: orderId = 0, additionalInfo } = {}, refetch } = useQueryOrder({
    id: Number(id)
  });

  const { mutate, isLoading } = useMutation(putOrderApprove);

  const handleClick = () =>
    mutate(orderId, {
      async onSuccess() {
        await refetch();
        setOpenState(false);
      }
    });

  const handleClose = () => setOpenState(false);

  return (
    <Dialog open={open} onClose={handleClose}>
      <Typography variant="h3" weight="bold">
        {additionalInfo?.buyerName}님에게 판매할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        승인하면 판매가 진행됩니다.
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
          판매승인
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default OrdersDetailSalesApproveDialog;
