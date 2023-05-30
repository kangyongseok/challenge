import { productType } from '@constants/user';

function useProductType(sellerType: (typeof productType)[keyof typeof productType] | undefined) {
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
  const isCamelButlerProduct = false; // 샤넬 가브리엘 백팩
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
