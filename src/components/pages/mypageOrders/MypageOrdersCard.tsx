import { useEffect, useState } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Image, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import styled from '@emotion/styled';

import type { Order } from '@dto/order';

import { logEvent } from '@library/amplitude';

import { putProductUpdateStatus } from '@api/product';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { getOrderStatusText } from '@utils/common';

import { mypageOrdersPurchaseConfirmDialogState } from '@recoil/mypageOrders';

interface MypageOrdersCardProps extends HTMLAttributes<HTMLDivElement> {
  order: Order;
  type?: 0 | 1; // 0: 구매, 1: 판매
}

function MypageOrdersCard({
  order,
  order: {
    channelId,
    orderDetails,
    price,
    status,
    result,
    reviewFormInfo: { hasReview, productId, targetUserName, targetUserId, isTargetUserSeller },
    dateCompleted
  },
  type = 0,
  ...props
}: MypageOrdersCardProps) {
  const router = useRouter();

  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const setPurchaseConfirmDialogState = useSetRecoilState(mypageOrdersPurchaseConfirmDialogState);

  const [src, setSrc] = useState('');
  const [brandName, setBrandName] = useState('');
  const [orderStatusText, setOrderStatusText] = useState('');
  const [isSafePayment, setIsSafePayment] = useState(false);

  const { mutate, isLoading } = useMutation(putProductUpdateStatus);

  const handleClick = () => {
    logEvent(attrKeys.mypage.CLICK_CHANNEL_DETAIL, {
      name: attrProperty.name.ORDER_LIST
    });

    router.push(`/channels/${channelId}`);
  };

  const handeClickReviewWrite = (e: MouseEvent<HTMLButtonElement>) => {
    logEvent(attrKeys.mypage.CLICK_REVIEW_SEND, {
      name: attrProperty.name.ORDER_LIST
    });

    e.stopPropagation();

    if (isTargetUserSeller) {
      router.push({
        pathname: '/user/reviews/form',
        query: {
          productId,
          targetUserName,
          targetUserId,
          isTargetUserSeller
        }
      });
    } else {
      mutate(
        {
          productId: Number(productId),
          status: 1,
          soldType: 1,
          targetUserId: Number(targetUserId)
        },
        {
          onSuccess() {
            router.push({
              pathname: '/user/reviews/form',
              query: {
                productId,
                targetUserName,
                targetUserId,
                isTargetUserSeller
              }
            });
          }
        }
      );
    }
  };

  const handleClickPurchaseConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setPurchaseConfirmDialogState({
      open: true,
      order
    });
  };

  useEffect(() => {
    if (!orderDetails[0]) return;

    const data = (orderDetails[0]?.data || '').split('|');

    if (!data[0] || !data[1]) return;

    setBrandName(
      data[0]
        .split(' ')
        .map(
          (splitNameEng) =>
            `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(1, splitNameEng.length)}`
        )
        .join(' ')
    );
    setSrc(data[1]);
  }, [orderDetails]);

  useEffect(() => {
    const newOrderStatusText = getOrderStatusText({
      status,
      result,
      options: {
        isBuyer: type === 0
      }
    });
    setOrderStatusText(newOrderStatusText.split('/')[type] || newOrderStatusText || '거래대기');
  }, [status, result, type]);

  useEffect(() => {
    setIsSafePayment(!!orderDetails[0]);
  }, [orderDetails]);

  return (
    <Flexbox gap={16} onClick={handleClick} {...props}>
      <Box
        customStyle={{
          position: 'relative',
          minWidth: 120,
          maxWidth: 120,
          minHeight: 144
        }}
      >
        {src && <Image ratio="5:6" src={src} alt={orderDetails[0]?.name} round={8} />}
        {orderStatusText !== '거래중' && (
          <Overlay>
            <Typography
              variant="h4"
              weight="bold"
              customStyle={{
                color: common.cmnW
              }}
            >
              {orderStatusText}
            </Typography>
          </Overlay>
        )}
      </Box>
      <div>
        {!brandName && <Skeleton width={60} height={16} round={8} disableAspectRatio />}
        {brandName && (
          <Typography variant="body2" weight="bold">
            {brandName}
          </Typography>
        )}
        <Typography
          variant="body2"
          noWrap
          lineClamp={2}
          customStyle={{
            marginTop: 2,
            color: common.ui60
          }}
        >
          {orderDetails[0]?.name}
        </Typography>
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{
            marginTop: 4
          }}
        >
          {getTenThousandUnitPrice(price)}만원
        </Typography>
        <Typography
          variant="small2"
          customStyle={{
            marginTop: 8,
            color: common.ui60,
            '& > span': {
              color: primary.light,
              fontWeight: 700
            }
          }}
        >
          {dateCompleted && dayjs(dateCompleted).format('MM월 DD일 ')}
          {orderStatusText === '거래중' ? <span>거래중</span> : orderStatusText}
          {isSafePayment ? ' · 안전결제' : ''}
        </Typography>
        {type === 0 && orderStatusText === '거래중' && (
          <Button
            variant="ghost"
            brandColor="black"
            onClick={handleClickPurchaseConfirm}
            customStyle={{
              marginTop: 12
            }}
          >
            구매확정
          </Button>
        )}
        {['거래완료', '정산완료'].includes(orderStatusText) && !hasReview && (
          <Button
            variant="ghost"
            brandColor="black"
            onClick={handeClickReviewWrite}
            disabled={isLoading}
            customStyle={{
              marginTop: 12
            }}
          >
            후기 작성하기
          </Button>
        )}
      </div>
    </Flexbox>
  );
}

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.overlay40};
  z-index: 2;
`;

export default MypageOrdersCard;
