import { useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Button, Flexbox, Icon, Label, Tooltip, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import { Gap } from '@components/UI/atoms';

import { OrderFeeTooltipMessage } from '@constants/product';

import { commaNumber } from '@utils/formats';

import {
  ordersDetailOpenCancelDialogState,
  ordersDetailOpenCancelRequestDialogState
} from '@recoil/ordersDetail';
import useQueryOrder from '@hooks/useQueryOrder';
import useOrderStatus from '@hooks/useOrderStatus';

function OrdersDetailPaymentInfo() {
  const router = useRouter();
  const { id } = router.query;

  const {
    palette: { primary }
  } = useTheme();

  const setOpenCancelDialogState = useSetRecoilState(ordersDetailOpenCancelDialogState);
  const setOpenCancelRequestDialogState = useSetRecoilState(
    ordersDetailOpenCancelRequestDialogState
  );

  const [openOrderFeeType, setOpenOrderFeeType] = useState<0 | 1 | 2 | null>(null);

  const {
    data,
    data: {
      price = 0,
      totalPrice = 0,
      orderPayments = [],
      orderFees = [],
      type,
      hold,
      cancelReasons
    } = {}
  } = useQueryOrder({ id: Number(id) });
  const orderStatus = useOrderStatus({ order: data });

  const handleClick = (newFeeType: 0 | 1 | 2) => () => {
    if (openOrderFeeType === newFeeType) {
      setOpenOrderFeeType(null);
    } else {
      setOpenOrderFeeType(newFeeType);
    }
  };

  if (
    orderStatus.isSeller ||
    ['결제취소', '환불대기', '환불진행', '환불완료', '배송준비 중 취소 요청'].includes(
      orderStatus.name
    )
  )
    return null;

  return (
    <>
      <Gap height={8} />
      <Flexbox
        component="section"
        direction="vertical"
        gap={20}
        customStyle={{
          padding: '32px 20px'
        }}
      >
        <Typography variant="h3" weight="bold">
          결제정보
        </Typography>
        <Flexbox direction="vertical" gap={4}>
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">매물가격</Typography>
            <Typography>{commaNumber(price || 0)}원</Typography>
          </Flexbox>
          {orderFees.map(
            ({ name, fee: orderFee, type: orderFeeType, feeRate, discountFee, totalFee }) => (
              <Flexbox key={`order-fee-${name}`} justifyContent="space-between" alignment="center">
                <Typography
                  color="ui60"
                  customStyle={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  {name}
                  <Tooltip
                    open={openOrderFeeType === orderFeeType}
                    message={
                      <>
                        {OrderFeeTooltipMessage({ safeFee: feeRate })[orderFeeType].map(
                          (message: string) => (
                            <TooltipText
                              key={message}
                              color="uiWhite"
                              variant="body2"
                              weight="medium"
                            >
                              {message}
                            </TooltipText>
                          )
                        )}
                      </>
                    }
                    placement="top"
                    triangleLeft={33}
                    spaceBetween={5}
                    customStyle={{
                      display: 'flex',
                      left: 100,
                      zIndex: 5
                    }}
                  >
                    <Icon
                      name="QuestionCircleOutlined"
                      width={16}
                      height={16}
                      color="ui80"
                      onClick={handleClick(orderFeeType)}
                    />
                  </Tooltip>
                </Typography>
                <Flexbox alignment="center" gap={8}>
                  {!orderFee && !discountFee && !totalFee && (
                    <Label
                      text="무료"
                      variant="solid"
                      brandColor="primary"
                      round={10}
                      size="xsmall"
                      customStyle={{
                        backgroundColor: primary.light
                      }}
                    />
                  )}
                  {discountFee > 0 && !totalFee && (
                    <Label
                      text="무료 이벤트"
                      variant="solid"
                      brandColor="primary"
                      round={10}
                      size="xsmall"
                      customStyle={{
                        backgroundColor: primary.light
                      }}
                    />
                  )}
                  {discountFee > 0 && (
                    <Typography color="ui80" customStyle={{ textDecoration: 'line-through' }}>
                      {commaNumber(orderFee)}원
                    </Typography>
                  )}
                  <Typography>{commaNumber(totalFee || 0)}원</Typography>
                </Flexbox>
              </Flexbox>
            )
          )}
          {type !== 1 && (
            <Flexbox justifyContent="space-between" alignment="center">
              <Typography color="ui60">배송비</Typography>
              <Typography>배송비 별도</Typography>
            </Flexbox>
          )}
          <Flexbox justifyContent="space-between" alignment="center">
            <Typography color="ui60">결제방법</Typography>
            <Typography>
              {orderPayments[0]?.method === 1 ? '무통장입금' : orderPayments[0]?.agencyName}
            </Typography>
          </Flexbox>
          {orderPayments[0]?.method === 1 && (
            <>
              <Flexbox justifyContent="space-between" alignment="center">
                <Typography color="ui60">입금은행</Typography>
                <Typography>{orderPayments[0]?.agencyName}</Typography>
              </Flexbox>
              <Flexbox justifyContent="space-between" alignment="center">
                <Typography color="ui60">입금계좌</Typography>
                <Typography>{orderPayments[0]?.data}</Typography>
              </Flexbox>
              {orderStatus.name === '결제진행' && (
                <Flexbox justifyContent="space-between" alignment="center">
                  <Typography color="ui60">입금기한</Typography>
                  <Typography>
                    {dayjs(orderPayments[0]?.dateExpired).format('YYYY.MM.DD')}
                  </Typography>
                </Flexbox>
              )}
            </>
          )}
        </Flexbox>
        <Flexbox justifyContent="space-between">
          <Typography variant="h4" weight="medium">
            {orderPayments[0]?.method === 1 && orderStatus.name === '결제진행'
              ? '입금예정금액'
              : '총 결제금액'}
          </Typography>
          <Typography variant="h3" weight="bold" color="red-light">
            {commaNumber(totalPrice || 0)}원
          </Typography>
        </Flexbox>
        {orderStatus.name === '결제완료' && !hold && (
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpenCancelDialogState(true)}
          >
            주문취소
          </Button>
        )}
        {!orderStatus.isSeller &&
          !cancelReasons?.request &&
          ['배송대기', '거래대기'].includes(orderStatus.name) &&
          orderStatus.paymentMethod !== '카멜 구매대행' &&
          !hold && (
            <Button
              variant="ghost"
              brandColor="black"
              size="large"
              fullWidth
              onClick={() => setOpenCancelRequestDialogState(true)}
            >
              주문취소 요청
            </Button>
          )}
      </Flexbox>
    </>
  );
}

const TooltipText = styled(Typography)`
  text-align: left;
  width: 240px;
  white-space: pre-wrap;
  word-break: keep-all;
`;

export default OrdersDetailPaymentInfo;
