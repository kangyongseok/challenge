import { useRouter } from 'next/router';

import { productType } from '@constants/user';

function useProductType(sellerType: (typeof productType)[keyof typeof productType] | undefined) {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id)?.split('-');
  const productId = splitIds ? Number(splitIds[splitIds.length - 1] || 0) : 0;

  const {
    normal,
    collection,
    certification,
    operatorProduct,
    operatorB2CProduct,
    operatorC2CProduct
  } = productType;

  const isNormalProduct = normal === sellerType;
  const isCertificationProduct = certification === sellerType;
  const isCrawlingProduct = collection === sellerType;
  const isOperatorProduct = operatorProduct === sellerType;
  const isOperatorB2CProduct = operatorB2CProduct === sellerType;
  const isOperatorC2CProduct = operatorC2CProduct === sellerType;
  const isChannelProduct = [1, 2, 3].includes(sellerType || NaN);
  const isAllOperatorProduct = [5, 6, 7].includes(sellerType || NaN);
  const isCamelButlerProduct = [
    44118684, 44117833, 44116863, 44116421, 44115778, 44115603, 44115252
  ].includes(productId); // 샤넬 가브리엘 백팩
  const isAllCrawlingProduct = isCrawlingProduct || isAllOperatorProduct;

  return {
    isNormalProduct,
    isOperatorProduct,
    isOperatorB2CProduct,
    isOperatorC2CProduct,
    isAllOperatorProduct,
    isCrawlingProduct,
    isCertificationProduct,
    isChannelProduct,
    isCamelButlerProduct,
    isAllCrawlingProduct
  };
}

export default useProductType;
