import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { useRecoilState } from 'recoil';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters
} from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Button, Flexbox, RadioGroup, Typography } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import type { ChannelUser } from '@dto/user';
import { Order } from '@dto/order';
import type { ChannelDetail } from '@dto/channel';

import { logEvent } from '@library/amplitude';

import { postOrderRefuse } from '@api/order';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { channelDialogStateFamily } from '@recoil/channel';

interface ChannelSaleRequestRefuseDialogProps {
  order?: Order | null;
  channelTargetUser?: ChannelUser | null;
  refetchChannel: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ChannelDetail, unknown>>;
}

function ChannelSaleRequestRefuseDialog({
  order,
  channelTargetUser,
  refetchChannel
}: ChannelSaleRequestRefuseDialogProps) {
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');

  const [{ open }, setOpenState] = useRecoilState(channelDialogStateFamily('saleRequestRefuse'));

  const { mutate } = useMutation(postOrderRefuse);

  const handleClose = () =>
    setOpenState((prevState) => ({
      ...prevState,
      open: false
    }));

  const handleChange = (newValue?: string | number) => setValue(String(newValue));

  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setReason(e.currentTarget.value);

  const handleClick = () => {
    logEvent(attrKeys.channel.CLICK_ORDER_STATUS, {
      name: attrProperty.name.CHANNEL_DETAIL,
      title: attrProperty.title.PAYMENT_COMPLETE,
      att: 'REFUSE',
      orderId: order?.id,
      reason: value === '직접입력' ? reason : value
    });

    if (!order) return;

    mutate(
      { id: order?.id, reason: value === '직접입력' ? reason : value },
      {
        onSuccess: async () => {
          await refetchChannel();
          setOpenState((prevState) => ({
            ...prevState,
            open: false
          }));
        }
      }
    );
  };

  useEffect(() => {
    if (!open) {
      setValue('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} renderScope="component">
      <Typography variant="h3" weight="bold" textAlign="center">
        주문을 취소할까요?
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        customStyle={{
          marginTop: 8
        }}
      >
        {channelTargetUser?.user?.nickName}님의 주문이 취소됩니다.
      </Typography>
      <Typography
        weight="medium"
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
        <TextArea onChange={handleChangeTextArea} value={reason} placeholder="취소사유 입력" />
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
          거래취소
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

export default ChannelSaleRequestRefuseDialog;
