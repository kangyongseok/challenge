import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { putOrderCancel } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { ordersDetailOpenCancelRequestRefuseDialogState } from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailCancelRequestRefuseDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const { data, data: { id: orderId, additionalInfo } = {} } = useQueryOrder({
    id: Number(id)
  });
  const orderStatus = useOrderStatus({ order: data });

  const [open, setOpenState] = useRecoilState(ordersDetailOpenCancelRequestRefuseDialogState);

  const [reason, setReason] = useState('');

  const { mutate, isLoading } = useMutation(putOrderCancel);

  const handleClose = () => setOpenState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => setReason(e.currentTarget.value);

  const handleClick = () => {
    logEvent(attrKeys.orderDetail.SUBMIT_ORDER_CANCEL, {
      name: attrProperty.name.ORDER_DETAIL,
      title: attrProperty.title.REFUSE,
      orderId,
      productId: additionalInfo?.product?.id,
      att: orderStatus.isSeller ? 'BUYER' : 'SELLER'
    });

    mutate(
      {
        id: Number(id),
        type: 0,
        reason
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
    <Dialog open={open} onClose={handleClose} renderScope="component">
      <Typography variant="h3" weight="bold">
        주문취소 요청을 거절할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        구매자에게 거절사유를 알려주세요.
      </Typography>
      <Typography
        weight="medium"
        color="ui60"
        textAlign="left"
        customStyle={{
          marginTop: 32
        }}
      >
        거절사유
      </Typography>
      <TextArea
        onChange={handleChange}
        value={reason}
        placeholder="구매자가 이해할 수 있도록 거절사유를 친절하게 입력해주세요."
      />
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
          disabled={!reason || isLoading}
        >
          취소요청 거절
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

const TextArea = styled.textarea`
  width: 100%;
  min-height: 84px;
  margin-top: 8px;
  padding: 12px;
  resize: none;
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
  outline: 0;

  ${({
    theme: {
      typography: { h4 }
    }
  }): CSSObject => ({
    fontSize: h4.size,
    fontWeight: h4.weight.regular,
    lineHeight: h4.lineHeight,
    letterSpacing: h4.letterSpacing
  })}

  &::placeholder {
    color: ${({
      theme: {
        palette: { common }
      }
    }) => common.ui80};
  }
`;

export default OrdersDetailCancelRequestRefuseDialog;
