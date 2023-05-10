import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Flexbox, Label, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { fetchProduct } from '@api/product';
import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/formats';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function ProductOrderPaymentInfo() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const { data: { totalPrice = 0, fee = 0 } = {} } = useQuery(
    queryKeys.orders.productOrder({ productId, isCreated: true }),
    () => fetchProductOrder({ productId, isCreated: true }),
    {
      enabled: !!accessUser && !!productId,
      refetchOnMount: true
    }
  );

  const { data: { product: { price = 0 } = {}, offers = [] } = {} } = useQuery(
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
          상품금액
        </Typography>
        <Typography variant="h4">
          {commaNumber(offers[0] && offers[0].status === 1 ? price : totalPrice)}원
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
        <Flexbox gap={8}>
          <Label variant="solid" brandColor="blue" size="xsmall" text="무료" round={9} />
          <Typography
            variant="h4"
            customStyle={{
              textDecoration: 'line-through',
              color: common.ui80
            }}
          >
            {commaNumber(fee || 0)}원
          </Typography>
          <Typography variant="h4">0원</Typography>
        </Flexbox>
      </Flexbox>
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

export default ProductOrderPaymentInfo;
