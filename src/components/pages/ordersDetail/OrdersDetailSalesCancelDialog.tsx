import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, RadioGroup, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { postOrderCancel } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { ordersDetailSalesCancelDialogState } from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';

function OrdersDetailSalesCancelDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const [{ open, variant }, setOpenState] = useRecoilState(ordersDetailSalesCancelDialogState);

  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');

  const { data: { additionalInfo } = {} } = useQueryOrder({ id: Number(id) });
  const { mutate, isLoading } = useMutation(postOrderCancel);

  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  const handleChange = (newValue?: string | number) => setValue(String(newValue));

  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setReason(e.currentTarget.value);

  const handleClick = () =>
    mutate(
      {
        id: Number(id),
        reason: value === '직접입력' ? reason : value
      },
      {
        async onSuccess() {
          await queryClient.refetchQueries(queryKeys.orders.order(Number(id)));
          setOpenState((prevState) => ({
            ...prevState,
            open: false
          }));
        }
      }
    );

  return (
    <Dialog open={open} onClose={handleClose} renderScope="component">
      <Typography variant="h3" weight="bold">
        {variant === 'cancel' ? '주문을 취소할까요?' : '판매요청을 거절할까요?'}
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        {additionalInfo?.buyerName}님에게 {variant === 'cancel' ? '취소사유' : '거절사유'}가
        <br />
        전달되며 주문이 취소됩니다.
      </Typography>
      <Typography
        weight="medium"
        color="ui60"
        textAlign="left"
        customStyle={{
          marginTop: 32
        }}
      >
        {variant === 'cancel' ? '취소사유' : '거절사유'}
      </Typography>
      <Flexbox
        direction="vertical"
        gap={16}
        customStyle={{
          marginTop: 8
        }}
      >
        <RadioGroup
          text="품절 또는 예약된 매물"
          onChange={handleChange}
          value="매물이 이미 판매되었습니다."
          checked={value === '매물이 이미 판매되었습니다.'}
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
          placeholder={`구매자가 이해할 수 있도록 ${
            variant === 'cancel' ? '취소사유' : '거절사유'
          }를 친절하게 입력해주세요.`}
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
          주문취소
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

export default OrdersDetailSalesCancelDialog;
