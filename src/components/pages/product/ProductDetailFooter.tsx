import { Box } from '@mrcamelhub/camel-ui';

import { checkAgent } from '@utils/common';

import ProductMySelfFooter from './ProductMySelfFooter';
import ProductCTAButton from './ProductCTAButton';

function ProductDetailFooter({
  isRedirectPage,
  isMySelfProduct,
  soldout,
  deleted
}: {
  isRedirectPage: boolean;
  isMySelfProduct: boolean;
  soldout: boolean;
  deleted: boolean;
}) {
  const isMoweb = !(checkAgent.isIOSApp() || checkAgent.isAndroidApp());

  if ((isMoweb && soldout) || isRedirectPage || deleted) return <Box />;

  if (isMySelfProduct) return <ProductMySelfFooter />;
  return <ProductCTAButton />;
}

export default ProductDetailFooter;
