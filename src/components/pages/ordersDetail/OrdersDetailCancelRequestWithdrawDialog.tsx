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

import { ordersDetailOpenCancelRequestWithdrawDialogState } from '@recoil/ordersDetail';
import useOrdersDetail from '@hooks/useOrdersDetail';

function OrdersDetailCancelRequestWithdrawDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const { data: { id: orderId, additionalInfo } = {}, isSeller } = useOrdersDetail({
    id: Number(id)
  });

  const [open, setOpenState] = useRecoilState(ordersDetailOpenCancelRequestWithdrawDialogState);

  const { mutate, isLoading } = useMutation(putOrderCancel);

  const handleClose = () => setOpenState(false);

  const handleClick = () => {
    logEvent(attrKeys.orderDetail.SUBMIT_ORDER_CANCEL, {
      name: attrProperty.name.ORDER_DETAIL,
      title: attrProperty.title.WITHDRAW,
      orderId,
      productId: additionalInfo?.product?.id,
      att: isSeller ? 'BUYER' : 'SELLER'
    });

    mutate(
      {
        id: Number(id),
        type: 0
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
        취소요청을 철회할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        취소요청이 삭제되며
        <br />
        이전 상태로 돌아갑니다.
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
          취소요청 철회
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          아니요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default OrdersDetailCancelRequestWithdrawDialog;
