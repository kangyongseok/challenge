import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Flexbox, RadioGroup, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { postOrderRefuse } from '@api/order';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelDialogStateFamily } from '@recoil/channel';

function OrderRefuseDialog({ orderId }: { orderId?: number }) {
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');

  const { mutate: orderRfuseMutate } = useMutation(postOrderRefuse);
  const [{ open }, setOpenState] = useRecoilState(channelDialogStateFamily('orderRequestRefuse'));

  const handleChange = (newValue?: string | number) => setValue(String(newValue));
  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setReason(e.currentTarget.value);
  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.PAYMENT_COMPLETE,
      att: 'REFUSE',
      orderId,
      reason: value === '직접입력' ? reason : value
    });

    if (!orderId) return;

    orderRfuseMutate(
      { id: orderId, reason: value === '직접입력' ? reason : value },
      {
        onSuccess: async () => {
          setOpenState((prevState) => ({
            ...prevState,
            open: false
          }));
        }
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      customStyle={{
        maxWidth: 311,
        padding: '32px 20px 20px'
      }}
    >
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          textAlign: 'center'
        }}
      >
        안전결제 요청을 거절할까요?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8,
          textAlign: 'center'
        }}
      >
        거절 사유를 선택해주세요.
      </Typography>
      <Typography
        weight="medium"
        customStyle={{
          marginTop: 32
        }}
      >
        거절사유
      </Typography>
      <Flexbox
        direction="vertical"
        gap={16}
        customStyle={{
          marginTop: 16
        }}
      >
        <RadioGroup
          text="이미 판매된 매물"
          onChange={handleChange}
          value="이미 판매된 매물"
          checked={value === '이미 판매된 매물'}
          customStyle={{
            gap: 8
          }}
        />
        <RadioGroup
          text="다른 사람에게 예약됨"
          onChange={handleChange}
          value="다른 사람에게 예약됨"
          checked={value === '다른 사람에게 예약됨'}
          customStyle={{
            gap: 8
          }}
        />
        <RadioGroup
          text="직접입력"
          onChange={handleChange}
          value="직접입력"
          checked={value === '직접입력'}
          customStyle={{
            gap: 8
          }}
        />
      </Flexbox>
      {value === '직접입력' && (
        <TextArea onChange={handleChangeTextArea} value={reason} placeholder="거절사유 입력" />
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
          disabled={!value || (value === '직접입력' && !reason)}
          onClick={handleClick}
        >
          거절하기
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

export default OrderRefuseDialog;
