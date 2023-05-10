import { useEffect, useState } from 'react';

import type { AdminMessage } from '@sendbird/chat/message';
import { Typography, useTheme } from '@mrcamelhub/camel-ui';

import type { ProductOffer } from '@dto/productOffer';

import { commaNumber } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ChannelOfferAdminTextMessageProps {
  message: AdminMessage;
  offer?: ProductOffer | null;
}

function ChannelOfferAdminTextMessage({
  message: { customType },
  offer
}: ChannelOfferAdminTextMessageProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [isOfferRequestUser, setIsOfferRequestUser] = useState(false);

  useEffect(() => {
    setIsOfferRequestUser(offer?.userId === accessUser?.userId);
  }, [accessUser?.userId, offer?.userId]);

  if (customType === 'offerRefuse') {
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
        {isOfferRequestUser
          ? `${offer?.userName}님의 ${commaNumber(offer?.price || 0)}원 제안이 거절되었어요.`
          : `${offer?.userName}님의 ${commaNumber(offer?.price || 0)}원 제안을 거절했어요.`}
      </Typography>
    );
  }

  if (customType === 'offerTimeout') {
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
        {isOfferRequestUser
          ? `${offer?.userName}님의 ${commaNumber(offer?.price || 0)}원 제안이 거절되었어요.`
          : `${offer?.userName}님의 ${commaNumber(
              offer?.price || 0
            )}원 제안이 시간초과로 거절되었어요.`}
      </Typography>
    );
  }

  if (customType === 'offerApproveTimeout') {
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
        {isOfferRequestUser
          ? '시간 내에 구매하지 않아 가격이 변경되었습니다.'
          : '시간초과로 가격이 변경되었습니다.'}
      </Typography>
    );
  }

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
      {isOfferRequestUser
        ? '가격제안을 취소했어요.'
        : `${offer?.userName}님이 가격제안을 취소했어요.`}
    </Typography>
  );
}

export default ChannelOfferAdminTextMessage;
