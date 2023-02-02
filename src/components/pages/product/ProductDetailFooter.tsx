import { Box } from 'mrcamel-ui';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';

import type { ProductDetail } from '@dto/product';

import { checkAgent } from '@utils/common';

import ProductSellerBottomMenu from './ProductSellerBottomMenu';

function ProductDetailFooter({
  data,
  productButton,
  isRedirectPage,
  isCamelSellerProduct,
  viewDetail,
  soldout,
  deleted,
  refresh
}: {
  data?: ProductDetail;
  productButton: ReactJSXElement;
  isRedirectPage: boolean;
  isCamelSellerProduct: boolean;
  viewDetail: boolean;
  soldout: boolean;
  deleted: boolean;
  refresh: () => void;
}) {
  const isMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp());

  if (isMoweb && soldout && !viewDetail) return <Box />;
  if (isCamelSellerProduct)
    return (
      <ProductSellerBottomMenu
        product={data?.product}
        noSellerReviewAndHasTarget={data?.noSellerReviewAndHasTarget || false}
        status={data?.product.status as number}
        refresh={refresh}
      />
    );
  return !isRedirectPage && !deleted ? productButton : <Box />;
}

export default ProductDetailFooter;
