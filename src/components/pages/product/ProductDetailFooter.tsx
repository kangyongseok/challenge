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
  soldout
}: {
  data?: ProductDetail;
  productButton: ReactJSXElement;
  isRedirectPage: boolean;
  isCamelSellerProduct: boolean;
  viewDetail: boolean;
  soldout: boolean;
}) {
  const isMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp());
  if (isMoweb && soldout && !viewDetail) return <Box />;
  if (isCamelSellerProduct)
    return <ProductSellerBottomMenu status={data?.product.status as number} />;
  return !isRedirectPage ? productButton : <Box />;
}

export default ProductDetailFooter;
