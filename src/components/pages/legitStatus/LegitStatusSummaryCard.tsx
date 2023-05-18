/* eslint-disable no-underscore-dangle */
import { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';
import { TypographyVariant } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import {
  DuplicatedOverlay,
  PriceDownOverlay,
  ReservingOverlay,
  SoldOutOverlay
} from '@components/UI/molecules';
// TODO 추후 공통 컴포넌트화
import { ProductFixedSummary } from '@components/pages/product';

import { ID_FILTER, LABELS, PRODUCT_SITE } from '@constants/product';

import useQueryProduct from '@hooks/useQueryProduct';
import useProductState from '@hooks/useProductState';
import useProductSellerType from '@hooks/useProductSellerType';

function LegitStatusSummaryCard() {
  const router = useRouter();
  const { data } = useQueryProduct();
  const isSafe = useMemo(() => {
    if (data) {
      return (
        Object.entries(PRODUCT_SITE).some(
          ([key, productSite]) =>
            ['HELLO', 'KREAM'].includes(key) &&
            productSite.id === data.product.productSeller.site.id
        ) ||
        data.product.labels.some(
          (label) =>
            label.codeId === ID_FILTER &&
            LABELS[ID_FILTER].some(
              ({ name, description }) => name === label.name && description === '안전'
            )
        )
      );
    }

    return false;
  }, [data]);

  const { isDuplicate, isPriceDown, isTargetProduct, isForSale, isReservation } = useProductState({
    productDetail: data,
    product: data?.product
  });
  const { isViewProductModifySellerType } = useProductSellerType({
    productSellerType: data?.product.productSeller.type,
    site: data?.product.site
  });

  const getProductImageOverlay = useCallback(
    ({ variant }: { variant?: TypographyVariant }) => {
      if (isForSale) {
        return null;
      }

      if (isDuplicate && isTargetProduct) {
        return isPriceDown ? (
          <PriceDownOverlay variant={variant} />
        ) : (
          <DuplicatedOverlay variant={variant} />
        );
      }

      if (isReservation) {
        return <ReservingOverlay variant={variant} />;
      }

      return <SoldOutOverlay variant={variant} />;
    },
    [isForSale, isDuplicate, isTargetProduct, isReservation, isPriceDown]
  );

  return (
    <ProductFixedSummaryCard isOpen onClick={() => router.push(`/products/${router.query.id}`)}>
      {data?.product && (
        <ProductFixedSummary
          isSafe={isSafe}
          image={data.product.imageThumbnail || data.product.imageMain}
          title={data.product.title}
          price={data.product?.price || 0}
          status={data.product.status}
          isNormalSeller={isViewProductModifySellerType}
          getProductImageOverlay={getProductImageOverlay}
        />
      )}
    </ProductFixedSummaryCard>
  );
}

const ProductFixedSummaryCard = styled.div<{ isOpen: boolean }>`
  position: fixed;
  display: grid;
  grid-template-columns: 64px auto;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  opacity: ${({ isOpen }) => Number(isOpen)};
  transition: opacity 0.3s ease-in 0s;
  width: 100%;
  margin: 0 -20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
`;

export default LegitStatusSummaryCard;
