import { useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Icon, Tooltip, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import useQueryProductOrder from '@hooks/useQueryProductOrder';
import useQueryProduct from '@hooks/useQueryProduct';

function ProductOrderPaymentInfo({ includeLegit }: { includeLegit: boolean }) {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);
  const [openTooltip, setOpenTooltip] = useState(false);

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
              {orderFee.type === 1 && (
                <Tooltip
                  open={openTooltip}
                  message={
                    <>
                      <TooltipText color="uiWhite" variant="body2" weight="medium">
                        {product?.site.name} 구매대행수수료는 {orderFee.feeRate}
                        %입니다
                      </TooltipText>
                      <TooltipText
                        color="uiWhite"
                        variant="body2"
                        weight="medium"
                        customStyle={{
                          margin: '10px 0'
                        }}
                      >
                        카멜은 판매자와 대신 대화하며 필요한 정보를 확인해 드려요. 필요 시, 판매자와
                        직거래도 진행합니다. 배송은 프리미엄 안전배송을 사용하여 안전합니다.
                      </TooltipText>
                      <TooltipText color="uiWhite" variant="body2" weight="medium">
                        카멜은 유저님의 편리하고 안전한 거래를 위해 최선을 다하겠습니다.
                      </TooltipText>
                    </>
                  }
                  placement="bottom"
                  triangleLeft={18}
                  customStyle={{
                    top: 'auto',
                    bottom: 20,
                    left: 115,
                    zIndex: 5
                  }}
                >
                  <Icon
                    name="QuestionCircleOutlined"
                    width={16}
                    color="ui60"
                    onClick={() => setOpenTooltip((prev) => !prev)}
                  />
                </Tooltip>
              )}
            </Typography>
            <Typography variant="h4">{commaNumber(orderFee.totalFee || 0)}원</Typography>
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
