import type { ProductSellerType, Site } from '@dto/product';

import { sellerType } from '@constants/user';

function useProductSellerType({
  productSellerType,
  site
}: {
  productSellerType?: ProductSellerType;
  site?: Site;
}) {
  const isTransferSeller = sellerType.transferSeller === productSellerType;
  const isLegitSeller = sellerType.legitSeller === productSellerType;
  const isCertificationSeller = sellerType.certificationSeller === productSellerType;
  const isBlockSeller = sellerType.blockSeller === productSellerType;
  const isCamelSeller = sellerType.none === productSellerType && site?.id === 34;

  const isViewProductModifySellerType = isTransferSeller || isCamelSeller || isLegitSeller;

  return {
    isTransferSeller,
    isLegitSeller,
    isCertificationSeller,
    isBlockSeller,
    isCamelSeller,
    isViewProductModifySellerType
  };
}

export default useProductSellerType;
