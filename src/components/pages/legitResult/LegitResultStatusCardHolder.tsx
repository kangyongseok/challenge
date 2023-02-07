import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import LegitStatusCardHolder from '@components/UI/organisms/LegitStatusCardHolder';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

function LegitResultStatusCardHolder() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: productLegit } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  if (!productLegit) return null;

  return <LegitStatusCardHolder productLegit={productLegit} simplify />;
}

export default LegitResultStatusCardHolder;
