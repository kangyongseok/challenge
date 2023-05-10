import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import dayjs from 'dayjs';
import type { AdminMessage } from '@sendbird/chat/message';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { ProductOffer } from '@dto/productOffer';
import type { Order } from '@dto/order';

import { commaNumber } from '@utils/formats';
import { getOrderStatusText } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOfferApproveMessageProps {
  message: AdminMessage;
  offer?: ProductOffer | null;
  order?: Order | null;
  isTargetUserBlocked: boolean;
  isAdminBlockUser: boolean;
  isSeller: boolean;
  status: number;
  targetUserName?: string;
  onClickSafePayment?: (e: MouseEvent<HTMLButtonElement>) => void;
}

function ChannelOfferApproveMessage({
  message: { createdAt },
  offer,
  order,
  isTargetUserBlocked,
  isAdminBlockUser,
  isSeller,
  status,
  targetUserName,
  onClickSafePayment
}: ChannelOfferApproveMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [isOfferRequestUser, setIsOfferRequestUser] = useState(false);
  const [hideSafePaymentButton, setHideSafePaymentButton] = useState(false);

  useEffect(() => {
    setIsOfferRequestUser(offer?.userId === accessUser?.userId);
  }, [accessUser?.userId, offer?.userId]);

  useEffect(() => {
    setHideSafePaymentButton(
      (!['결제대기', '결제취소', '환불완료/거래취소'].includes(
        getOrderStatusText({ status: order?.status, result: order?.result })
      ) &&
        !!order) ||
        status !== 0 ||
        isTargetUserBlocked ||
        isAdminBlockUser ||
        offer?.status !== 1
    );
  }, [isAdminBlockUser, isTargetUserBlocked, offer?.status, order, status]);

  // 판매자 역제안을 구매자가 수락했을 때 구매자게에 보여지는 메시지
  if (!isOfferRequestUser && !isSeller) {
    return (
      <Flexbox
        gap={4}
        alignment="flex-end"
        customStyle={{
          margin: '20px 0'
        }}
      >
        <Box
          customStyle={{
            flexGrow: 1,
            maxWidth: 265,
            padding: 20,
            border: `1px solid ${common.line01}`,
            borderRadius: 20,
            overflow: 'hidden'
          }}
        >
          <Typography variant="h4" weight="bold">
            가격제안 수락
          </Typography>
          <Typography
            customStyle={{
              marginTop: 8
            }}
          >
            {dayjs(offer?.dateExpired).format('MM월 DD일(ddd)')}까지{' '}
            {commaNumber(offer?.price || 0)}
            원으로 구매할 수 있어요.
          </Typography>
          {!hideSafePaymentButton && (
            <Button
              variant="ghost"
              brandColor="black"
              fullWidth
              onClick={onClickSafePayment}
              customStyle={{
                marginTop: 20
              }}
            >
              안전결제로 구매하기
            </Button>
          )}
        </Box>
        <Typography
          variant="small2"
          customStyle={{
            color: common.ui60
          }}
        >
          {dayjs(createdAt).format('A hh:mm')}
        </Typography>
      </Flexbox>
    );
  }

  // 구매자의 제안 수락
  if (!isOfferRequestUser) {
    return (
      <Typography
        variant="body2"
        weight="medium"
        customStyle={{
          margin: '20px 0',
          textAlign: 'center',
          color: common.ui60,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          '& span': {
            marginLeft: 3,
            textDecoration: 'underline'
          }
        }}
      >
        {offer?.userName}님의 제안을 수락했어요.
        <br />
        {dayjs(offer?.dateExpired).format('MM월 DD일(ddd)')}까지 {offer?.userName}님에게만{' '}
        {commaNumber(offer?.price || 0)}
        원으로 노출됩니다.
      </Typography>
    );
  }

  // 판매자가 역제안 한 것을 구매자가 수락했을 때
  if (isOfferRequestUser && isSeller) {
    return (
      <Typography
        variant="body2"
        weight="medium"
        customStyle={{
          margin: '20px 0',
          textAlign: 'center',
          color: common.ui60,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          '& span': {
            marginLeft: 3,
            textDecoration: 'underline'
          }
        }}
      >
        {offer?.userName}님의 제안을 수락했어요.
        <br />
        {dayjs(offer?.dateExpired).format('MM월 DD일(ddd)')}까지 {targetUserName}님에게만{' '}
        {commaNumber(offer?.price || 0)}
        원으로 노출됩니다.
      </Typography>
    );
  }

  return (
    <Flexbox
      gap={4}
      alignment="flex-end"
      customStyle={{
        margin: '20px 0'
      }}
    >
      <Box
        customStyle={{
          flexGrow: 1,
          maxWidth: 265,
          padding: 20,
          border: `1px solid ${common.line01}`,
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        <Typography variant="h4" weight="bold">
          가격제안 수락
        </Typography>
        <Typography
          customStyle={{
            marginTop: 8
          }}
        >
          {dayjs(offer?.dateExpired).format('MM월 DD일(ddd)')}까지 {commaNumber(offer?.price || 0)}
          원으로 구매할 수 있어요.
        </Typography>
        {!hideSafePaymentButton && (
          <Button
            variant="ghost"
            brandColor="black"
            fullWidth
            onClick={onClickSafePayment}
            customStyle={{
              marginTop: 20
            }}
          >
            안전결제로 구매하기
          </Button>
        )}
      </Box>
      <Typography
        variant="small2"
        customStyle={{
          color: common.ui60
        }}
      >
        {dayjs(createdAt).format('A hh:mm')}
      </Typography>
    </Flexbox>
  );
}

export default ChannelOfferApproveMessage;
