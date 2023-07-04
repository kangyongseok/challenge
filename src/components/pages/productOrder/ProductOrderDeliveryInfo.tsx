import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { fetchProductOrder } from '@api/order';

import queryKeys from '@constants/queryKeys';

import useSession from '@hooks/useSession';

function ProductOrderDeliveryInfo() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { isLoggedInWithSMS } = useSession();

  const { data: { deliveryInfo } = {}, isLoading } = useQuery(
    queryKeys.orders.productOrder({ productId, isCreated: true }),
    () => fetchProductOrder({ productId, isCreated: true }),
    {
      enabled: isLoggedInWithSMS && !!productId,
      refetchOnMount: true
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
        배송지
      </Typography>
      {isLoading && (
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            margin: '20px 0 12px'
          }}
        >
          <Flexbox gap={8}>
            <Skeleton width={40} height={20} round={8} disableAspectRatio />
            <Skeleton width={83} height={20} round={8} disableAspectRatio />
          </Flexbox>
          <Skeleton width="100%" maxWidth={100} height={20} round={8} disableAspectRatio />
        </Flexbox>
      )}
      {!isLoading && deliveryInfo && (
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            margin: '20px 0 12px'
          }}
        >
          <Flexbox gap={8}>
            <Typography variant="h4" weight="bold">
              {deliveryInfo.name}
            </Typography>
            <Typography
              variant="h4"
              customStyle={{
                color: common.ui60
              }}
            >
              {deliveryInfo.phone}
            </Typography>
          </Flexbox>
          <Typography variant="h4">{deliveryInfo.address}</Typography>
        </Flexbox>
      )}
      {isLoading && <Skeleton width={96.57} height={44} round={8} disableAspectRatio />}
      {!isLoading && (
        <Button
          variant="ghost"
          size="large"
          brandColor="black"
          fullWidth={!deliveryInfo}
          onClick={() => router.push(`/products/${id}/order/deliveryInfo`)}
          customStyle={{
            marginTop: deliveryInfo ? 0 : 20
          }}
        >
          {deliveryInfo ? '배송지 변경' : '배송지 입력'}
        </Button>
      )}
    </Box>
  );
}

export default ProductOrderDeliveryInfo;
