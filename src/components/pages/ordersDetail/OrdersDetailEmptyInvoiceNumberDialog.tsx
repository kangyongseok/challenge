import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, RadioGroup, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { postOrderDelivery } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { ordersDetailOpenEmptyInvoiceNumberDialogState } from '@recoil/ordersDetail';

function OrdersDetailEmptyInvoiceNumberDialog() {
  const router = useRouter();
  const { id } = router.query;

  const queryClient = useQueryClient();

  const [open, setOpenState] = useRecoilState(ordersDetailOpenEmptyInvoiceNumberDialogState);

  const [value, setValue] = useState('');
  const [contents, setContents] = useState('');

  const { mutate, isLoading } = useMutation(postOrderDelivery);

  const handleClose = () => setOpenState(false);

  const handleChange = (newValue?: string | number) => setValue(String(newValue));

  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setContents(e.currentTarget.value);

  const handleClick = () =>
    mutate(
      {
        id: Number(id),
        type: Number(value) as 0 | 1 | 2 | 3,
        contents
      },
      {
        async onSuccess() {
          await queryClient.refetchQueries(queryKeys.orders.order(Number(id)));
          setOpenState(false);
        }
      }
    );

  return (
    <Dialog open={open} onClose={handleClose} renderScope="component">
      <Typography variant="h3" weight="bold">
        송장번호가 없나요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8
        }}
      >
        매물을 어떻게 구매자에게 전달하는지
        <br />
        선택해주세요.
      </Typography>
      <Typography
        weight="medium"
        color="ui60"
        textAlign="left"
        customStyle={{
          marginTop: 32
        }}
      >
        전달방법
      </Typography>
      <RadioGroupWrapper>
        <RadioGroup text="퀵 서비스" onChange={handleChange} value="2" checked={value === '2'} />
        <RadioGroup text="용달" onChange={handleChange} value="3" checked={value === '3'} />
        <RadioGroup text="직접입력" onChange={handleChange} value="0" checked={value === '0'} />
      </RadioGroupWrapper>
      {value === '0' && (
        <TextArea onChange={handleChangeTextArea} value={contents} placeholder="전달방법 입력" />
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
          disabled={!value || (value === '0' && !contents) || isLoading}
        >
          확인
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          취소
        </Button>
      </Flexbox>
    </Dialog>
  );
}

const RadioGroupWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
  margin-top: 8px;

  & > div {
    height: 36px;
  }
`;

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

export default OrdersDetailEmptyInvoiceNumberDialog;
