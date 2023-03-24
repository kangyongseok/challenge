import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductListCard, NewProductListCardSkeleton } from '@components/UI/molecules';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';

function ProductOrderCard() {
  const router = useRouter();
  const { id } = router.query;
  const splitId = String(id).split('-');
  const productId = Number(splitId[splitId.length - 1] || 0);

  const { data: { product } = {}, isLoading } = useQuery(
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
        padding: 20
      }}
    >
      {isLoading && <NewProductListCardSkeleton variant="listB" hideMetaInfo hideAreaInfo />}
      {!isLoading && product && (
        <NewProductListCard
          product={product}
          variant="listB"
          hideLabel
          hideMetaInfo
          hideAreaInfo
          hideWishButton
        />
      )}
    </Box>
  );
}

export default ProductOrderCard;
