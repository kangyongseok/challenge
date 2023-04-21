import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductListCard, NewProductListCardSkeleton } from '@components/UI/molecules';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';

function ProductOrderCard() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { data: { product, offers = [] } = {}, isLoading } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId }),
    {
      refetchOnMount: true,
      enabled: !!productId
    }
  );

  const isAllOperatorType = [5, 6, 7].includes(product?.sellerType || 0);

  return (
    <Box
      component="section"
      customStyle={{
        padding: 20
      }}
    >
      {isLoading && <NewProductListCardSkeleton variant="listB" hideMetaInfo hideAreaInfo />}
      {!isLoading && product && (
        <NewProductListCard
          product={product}
          offer={offers[0]}
          variant="listB"
          hideLabel
          hideMetaInfo
          hideAreaInfo
          hideWishButton
        />
      )}
      {isAllOperatorType && (
        <Flexbox
          alignment="flex-start"
          gap={6}
          customStyle={{ borderTop: '1px solid #DCDDE0', marginTop: 20, paddingTop: 20 }}
        >
          <Avatar
            width={16}
            height={16}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${product?.site.id}.png`}
            alt="플랫폼 이미지"
          />
          <Typography variant="body2" color="ui60">
            {product?.site.name} 매물을 카멜이 대신 구매하여 입력한 배송지로 보내드립니다.
          </Typography>
        </Flexbox>
      )}
    </Box>
  );
}

export default ProductOrderCard;
