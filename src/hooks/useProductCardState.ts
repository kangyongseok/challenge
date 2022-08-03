import { useMemo } from 'react';

import { useTheme } from 'mrcamel-ui';

import type { Product } from '@dto/product';

import { ID_FILTER, LABELS, PRODUCT_SITE } from '@constants/product';

import getProductLabelColor from '@utils/product/getProductLabelColor';

export default function useProductCardState({
  imageMain,
  imageThumbnail,
  purchaseCount = 0,
  wishCount = 0,
  viewCount = 0,
  status,
  targetProductId,
  targetProductPrice = 0,
  targetProductStatus,
  price = 0,
  priceBefore,
  productSeller,
  productLegit,
  isProductLegit,
  labels = []
}: Product) {
  const { theme } = useTheme();
  const imageUrl = imageMain || imageThumbnail;
  const { status: productLegitStatus } = productLegit || {};

  const productLabels = useMemo(() => {
    const { site } = productSeller || {};
    if (!site || !labels || !labels.length) return [];

    const newLabels = labels
      .filter(
        (label) =>
          label.codeId === ID_FILTER &&
          LABELS[ID_FILTER].some(
            ({ description: labelDescription, name: labelName }) =>
              ['카멜인증', '새상품급', '시세이하'].includes(labelDescription) &&
              labelName === label.name
          )
      )
      .map(({ id: labelId, name, description: labelDescription }) => ({
        id: labelId,
        name,
        description: labelDescription,
        brandColor: getProductLabelColor(labelDescription, theme)
      }));

    return newLabels;
  }, [labels, productSeller, theme]);

  const discountedPrice = useMemo(() => {
    if (!priceBefore) {
      return 0;
    }

    return priceBefore - price;
  }, [priceBefore, price]);

  const productLegitStatusText = useMemo(() => {
    if (!isProductLegit) return '';

    if (productLegitStatus === 30) return '감정완료';
    if (productLegitStatus === 11) return '감정불가';
    if (productLegitStatus === 10 || productLegitStatus === 20 || productLegitStatus === 1)
      return '감정중';
    return '감정가능';
  }, [productLegitStatus, isProductLegit]);

  const isDuplicate = !targetProductStatus;

  const isPriceDown = targetProductPrice ? targetProductPrice < price : false;

  const isSale = status === 0;

  const isSafe = useMemo(() => {
    const { site } = productSeller || {};

    if (!site || !labels || !labels.length) return false;

    return (
      Object.entries(PRODUCT_SITE).some(
        ([key, productSite]) => ['HELLO', 'KREAM'].includes(key) && productSite.id === site.id
      ) ||
      labels.some(
        (label) =>
          label.codeId === ID_FILTER &&
          LABELS[ID_FILTER].some(
            ({ name, description }) => name === label.name && description === '안전'
          )
      )
    );
  }, [labels, productSeller]);

  const hasTarget = !!targetProductId;

  const salePrice = useMemo(() => {
    if (isDuplicate && hasTarget && targetProductPrice != null) {
      return Number((price - targetProductPrice).toFixed(1));
    }

    return 0;
  }, [isDuplicate, hasTarget, price, targetProductPrice]);

  const showPriceDown = !!priceBefore && isSale && discountedPrice >= 10000;

  const isPopular =
    !showPriceDown && (viewCount >= 80 || wishCount >= 5 || purchaseCount >= 6) && isSale;

  const showDuplicateUploadAlert = isDuplicate && hasTarget && (!isPriceDown || salePrice < 10000);
  const showDuplicateWithPriceDownAlert = isDuplicate && hasTarget;

  return {
    imageUrl,
    productLabels,
    salePrice,
    hasTarget,
    discountedPrice,
    showPriceDown,
    showDuplicateUploadAlert,
    showDuplicateWithPriceDownAlert,
    isPopular,
    isDuplicate,
    isSafe,
    isPriceDown,
    productLegitStatusText
  };
}
