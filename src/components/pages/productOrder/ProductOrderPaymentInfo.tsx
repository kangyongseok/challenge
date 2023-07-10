import { useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Icon, Tooltip, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { ORDER_FEE_TOOLTIP_MESSAGE } from '@constants/product';

import { commaNumber } from '@utils/formats';

import useQueryProductOrder from '@hooks/useQueryProductOrder';
import useQueryProduct from '@hooks/useQueryProduct';

function ProductOrderPaymentInfo({ includeLegit }: { includeLegit: boolean }) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);
  const [openTooltip, setOpenTooltip] = useState<0 | 1 | 2 | null>(null);

  const { data: { product } = {} } = useQueryProduct();

  const isAllOperatorType = [5, 6, 7].includes(product?.sellerType || 0);

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: { totalPrice = 0, fee = 0, orderFees } = {} } = useQueryProductOrder({
    productId,
    includeLegit
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
      {isAllOperatorType ? (
        orderFees?.map((orderFee) => (
          <Flexbox
            key={orderFee.name}
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
                color: common.ui60,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {orderFee.name}
              <Tooltip
                open={openTooltip === orderFee.type}
                message={
                  <>
                    {ORDER_FEE_TOOLTIP_MESSAGE[orderFee.type].map((message: string) => (
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
                    if (orderFee.type === openTooltip) {
                      setOpenTooltip(null);
                      return;
                    }
                    setOpenTooltip(orderFee.type);
                  }}
                />
              </Tooltip>
            </Typography>
            <Typography
              variant="h4"
              color={!orderFee.totalFee && !orderFee.fee && !orderFee.discountFee ? 'ui60' : 'ui20'}
            >
              {!orderFee.totalFee && !orderFee.fee && !orderFee.discountFee
                ? '선택안함'
                : `${commaNumber(orderFee.totalFee || 0)}원`}
            </Typography>
          </Flexbox>
        ))
      ) : (
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
            안전결제수수료
          </Typography>
          <Typography variant="h4">{commaNumber(fee || 0)}원</Typography>
        </Flexbox>
      )}
      <Flexbox
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          marginTop: 23,
          color: common.ui60
        }}
      >
        <Typography variant="h4" weight="medium">
          총 결제금액
        </Typography>
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{
            color: secondary.red.light
          }}
        >
          {commaNumber(totalPrice)}원
        </Typography>
      </Flexbox>
    </Box>
  );
}

const TooltipText = styled(Typography)`
  text-align: left;
  width: 240px;
  white-space: pre-wrap;
`;

export default ProductOrderPaymentInfo;
