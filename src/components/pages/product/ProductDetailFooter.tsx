import { Box } from '@mrcamelhub/camel-ui';

import { checkAgent } from '@utils/common';

import ProductMySelfFooter from './ProductMySelfFooter';
import ProductCTAButton from './ProductCTAButton';

function ProductDetailFooter({
  isRedirectPage,
  isMySelfProduct,
  viewDetail,
  soldout,
  deleted
}: {
  isRedirectPage: boolean;
  isMySelfProduct: boolean;
  viewDetail: boolean;
  soldout: boolean;
  deleted: boolean;
}) {
  const isMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp());

  if ((isMoweb && soldout && !viewDetail) || isRedirectPage || deleted) return <Box />;

  if (isMySelfProduct) return <ProductMySelfFooter />;
  return <ProductCTAButton />;
}

// eslint-disable-next-line no-lone-blocks
{
  /* <>
        <ProductSellerBottomMenu
          product={data?.product}
          status={data?.product.status as number}
          refresh={refresh}
        />
        {data?.product && <SelectTargetUserBottomSheet productId={data.product.id} />}
      </> */
}

export default ProductDetailFooter;
