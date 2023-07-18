import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, RadioGroup, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { postOrderCancel } from '@api/order';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { ordersDetailOpenCancelRequestDialogState } from '@recoil/ordersDetail';
import useOrdersDetail from '@hooks/useOrdersDetail';

function OrdersDetailCancelRequestDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const { data: { id: orderId, additionalInfo } = {}, isSeller } = useOrdersDetail({
    id: Number(id)
  });

  const [open, setOpenState] = useRecoilState(ordersDetailOpenCancelRequestDialogState);

  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');

  const { mutate, isLoading } = useMutation(postOrderCancel);

  const handleClose = () => setOpenState(false);

  const handleChange = (newValue?: string | number) => setValue(String(newValue));

  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setReason(e.currentTarget.value);

  const handleClick = () => {
    logEvent(attrKeys.orderDetail.SUBMIT_ORDER_CANCEL, {
      name: attrProperty.name.ORDER_DETAIL,
      title: attrProperty.title.REQUEST,
      orderId,
      productId: additionalInfo?.product?.id,
      att: isSeller ? 'BUYER' : 'SELLER'
    });

    mutate(
      {
        id: Number(id),
        reason: value === '직접입력' ? reason : value
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
        주문을 취소할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        판매자가 취소사유를 확인 한 후,
        <br />
        취소절차가 진행됩니다.{' '}
      </Typography>
      <Typography
        weight="medium"
        color="ui60"
        textAlign="left"
        customStyle={{
          marginTop: 32
        }}
      >
        취소사유
      </Typography>
      <Flexbox
        direction="vertical"
        gap={16}
        customStyle={{
          marginTop: 16
        }}
      >
        <RadioGroup
          text="주문 실수"
          onChange={handleChange}
          value="주문 실수로 취소 요청합니다."
          checked={value === '주문 실수로 취소 요청합니다.'}
        />
        <RadioGroup
          text="배송 지연으로 인한 취소"
          onChange={handleChange}
          value="배송 지연으로 취소 요청합니다."
          checked={value === '배송 지연으로 취소 요청합니다.'}
        />
        <RadioGroup
          text="직접입력"
          onChange={handleChange}
          value="직접입력"
          checked={value === '직접입력'}
        />
      </Flexbox>
      {value === '직접입력' && (
        <TextArea
          onChange={handleChangeTextArea}
          value={reason}
          placeholder="판매자에게 전할 취소사유를 친절하게 입력해주세요."
        />
      )}
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          marginTop: value === '직접입력' ? 32 : 40
        }}
      >
        <Button
          variant="solid"
          brandColor="black"
          size="large"
          fullWidth
          onClick={handleClick}
          disabled={!value || (value === '직접입력' && !reason) || isLoading}
        >
          주문취소 요청
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          아니요, 계속 거래할게요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

const TextArea = styled.textarea`
  width: 100%;
  min-height: 84px;
  margin-top: 16px;
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

export default OrdersDetailCancelRequestDialog;
