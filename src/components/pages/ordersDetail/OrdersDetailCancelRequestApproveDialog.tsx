import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { putOrderCancel } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { ordersDetailOpenCancelRequestApproveDialogState } from '@recoil/ordersDetail';
import useOrdersDetail from '@hooks/useOrdersDetail';

function OrdersDetailCancelRequestApproveDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const { data: { id: orderId, additionalInfo } = {}, isSeller } = useOrdersDetail({
    id: Number(id)
  });

  const [open, setOpenState] = useRecoilState(ordersDetailOpenCancelRequestApproveDialogState);

  const { mutate, isLoading } = useMutation(putOrderCancel);

  const handleClose = () => setOpenState(false);

  const handleClick = () => {
    logEvent(attrKeys.orderDetail.SUBMIT_ORDER_CANCEL, {
      name: attrProperty.name.ORDER_DETAIL,
      title: attrProperty.title.APPROVE,
      orderId,
      productId: additionalInfo?.product?.id,
      att: isSeller ? 'BUYER' : 'SELLER'
    });

    mutate(
      {
        id: Number(id),
        type: 1
      },
      {
        async onSuccess() {
          await queryClient.refetchQueries(queryKeys.orders.order(Number(id)));
          setOpenState(false);
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

export default OrdersDetailCancelRequestApproveDialog;
