import { useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Icon, Label, Tooltip, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { OrderFeeTooltipMessage } from '@constants/product';

import { commaNumber } from '@utils/formats';

import useQueryProductOrder from '@hooks/useQueryProductOrder';
import useQueryProduct from '@hooks/useQueryProduct';

function ProductOrderPaymentInfo() {
  const router = useRouter();
  const { id, includeLegit, type = 0 } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);
  const [openTooltip, setOpenTooltip] = useState<0 | 1 | 2 | null>(null);

  const { data: { product } = {} } = useQueryProduct();

  const isAllOperatorType = [5, 6, 7].includes(product?.sellerType || 0);
  const isLegit = product?.purchaseType === 2;

  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();

  const { data: { totalPrice = 0, orderFees = [] } = {} } = useQueryProductOrder({
    productId,
    includeLegit: String(includeLegit),
    type: Number(type)
  });

  const { data: { product: { price = 0 } = {}, offers = [], orderInfo } = {} } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      refetchOnMount: true,
      enabled: !!productId
    }
  );

  return (
    <Box
      component="section"
      customStyle={{
        padding: '32px 20px'
      }}
    >
      <Typography variant="h3" weight="bold">
        결제금액
      </Typography>
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          marginTop: 20,
          color: common.ui60
        }}
      >
        <Typography
          variant="h4"
          customStyle={{
            color: common.ui60
          }}
        >
          {isAllOperatorType ? '매물금액' : '상품금액'}
        </Typography>
        <Typography variant="h4">
          {commaNumber(isAllOperatorType ? orderInfo?.price || 0 : price)}원
        </Typography>
      </Flexbox>
      {offers[0] && offers[0].status === 1 && (
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{
            marginTop: 8,
            color: common.ui60
          }}
        >
          <Typography
            variant="h4"
            customStyle={{
              color: common.ui60
            }}
          >
            가격제안 할인
          </Typography>
          <Typography variant="h4">- {commaNumber(price - totalPrice)}원</Typography>
        </Flexbox>
      )}
      {orderFees?.map((orderFee) => (
        <Flexbox
          key={orderFee.name}
          alignment="center"
          justifyContent="space-between"
          customStyle={{
            marginTop: 8,
            color: common.ui60,
            flexWrap: 'wrap'
          }}
        >
          <Typography
            variant="h4"
            customStyle={{
              color: common.ui60,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            {orderFee.name}
            <Tooltip
              open={openTooltip === orderFee.type}
              message={
                <>
                  {OrderFeeTooltipMessage({ safeFee: orderFee.feeRate })[orderFee.type].map(
                    (message: string) => (
                      <TooltipText key={message} color="uiWhite" variant="body2" weight="medium">
                        {message}
                      </TooltipText>
                    )
                  )}
                </>
              }
              placement="top"
              spaceBetween={5}
              triangleLeft={33}
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
                onClick={() => {
                  if (orderFee.type === openTooltip) {
                    setOpenTooltip(null);
                    return;
                  }
                  setOpenTooltip(orderFee.type);
                }}
              />
            </Tooltip>
          </Typography>
          {!orderFee.totalFee && !orderFee.fee && !orderFee.discountFee ? (
            <Typography color="ui60" customStyle={{ marginLeft: 'auto' }}>
              {isLegit ? '선택안함' : '감정불가'}
            </Typography>
          ) : (
            <Flexbox alignment="center" gap={8} customStyle={{ marginLeft: 'auto' }}>
              {!orderFee.fee && !orderFee.discountFee && !orderFee.totalFee && (
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
              {orderFee.discountFee > 0 && !orderFee.totalFee && (
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
              {orderFee.discountFee > 0 && (
                <Typography color="ui80" customStyle={{ textDecoration: 'line-through' }}>
                  {commaNumber(orderFee.fee)}원
                </Typography>
              )}
              <Typography>{commaNumber(orderFee?.totalFee)}원</Typography>
            </Flexbox>
          )}
        </Flexbox>
      ))}
      {!orderFees.find((fee) => fee.type === 2) && !isLegit && isAllOperatorType && (
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ marginTop: 8 }}>
          <Typography color="ui60" customStyle={{ display: 'flex', alignItems: 'center' }}>
            정품검수
            <Tooltip
              open={openTooltip === 2}
              message={
                <>
                  {OrderFeeTooltipMessage({ safeFee: 0 })[2].map((message: string) => (
                    <TooltipText key={message} color="uiWhite" variant="body2" weight="medium">
                      {message}
                    </TooltipText>
                  ))}
                </>
              }
              placement="top"
              triangleLeft={33}
              customStyle={{
                top: 15,
                bottom: 'auto',
                left: 100,
                zIndex: 5
              }}
            >
              <Icon
                name="QuestionCircleOutlined"
                width={16}
                color="ui80"
                onClick={() => {
                  if (openTooltip === 2) {
                    setOpenTooltip(null);
                    return;
                  }
                  setOpenTooltip(2);
                }}
              />
            </Tooltip>
          </Typography>
          <Typography color="ui60">감정불가</Typography>
        </Flexbox>
      )}
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          marginTop: 23,
          color: common.ui60,
          flexWrap: 'wrap'
        }}
      >
        <Typography variant="h4" weight="medium">
          총 결제금액
        </Typography>
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{
            color: secondary.red.light,
            marginLeft: 'auto'
          }}
        >
          {commaNumber(totalPrice)}원
        </Typography>
      </Flexbox>
    </Box>
  );
}

const TooltipText = styled(Typography)<{ w?: number }>`
  text-align: left;
  width: ${({ w }) => w || 240}px;
  white-space: pre-wrap;
  word-break: keep-all;
`;

export default ProductOrderPaymentInfo;
