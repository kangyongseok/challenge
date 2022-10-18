import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import { PageHead } from '@components/UI/atoms';

import { fetchProductLegit } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

function LegitResultPageHead() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const productId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: { productResult: { imageMain = '', imageThumbnail = '' } = {} } = {} } = useQuery(
    queryKeys.productLegits.legit(productId),
    () => fetchProductLegit(productId),
    {
      enabled: !!id
    }
  );

  return <PageHead ogImage={imageMain || imageThumbnail} />;
}

export default LegitResultPageHead;
