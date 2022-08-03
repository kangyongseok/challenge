/* eslint-disable no-underscore-dangle */
import { useCallback, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { TypographyVariant } from 'mrcamel-ui';
import styled from '@emotion/styled';

import {
  DuplicatedOverlay,
  PriceDownOverlay,
  ReservingOverlay,
  SoldOutOverlay
} from '@components/UI/molecules';
import { ProductFixedSummary } from '@components/pages/product';

import { fetchProduct } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { ID_FILTER, LABELS, PRODUCT_SITE, PRODUCT_STATUS } from '@constants/product';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';

import { getTenThousandUnitPrice } from '@utils/formats';

import { deviceIdState, showAppDownloadBannerState } from '@recoil/common';

function ProductLegitSummaryCard() {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const deviceId = useRecoilValue(deviceIdState);
  const router = useRouter();
  const productId = Number(router.query.id);
  const { data } = useQuery(
    queryKeys.products.product({ productId }),
    () => fetchProduct({ productId, deviceId }),
    {
      enabled: !!router.query.id && !!deviceId
    }
  );
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

  const { isPriceDown, isDup, hasTarget } = useMemo(() => {
    const _price = getTenThousandUnitPrice(data?.product.price || 0);
    const _targetProductPrice = getTenThousandUnitPrice(data?.product.targetProductPrice || 0);
    let _isPriceDown = _targetProductPrice < _price;
    const _isDup = !data?.product.targetProductStatus;
    const _hasTarget = !!data?.product.targetProductId;
    const _salePrice = _isDup && _hasTarget && _isPriceDown ? _price - _targetProductPrice : 0;

    if (_salePrice < 1) {
      _isPriceDown = false;
    }

    return {
      isPriceDown: _isPriceDown,
      isDup: _isDup,
      hasTarget: _hasTarget,
      salePrice: _salePrice
    };
  }, [data]);

  const getProductImageOverlay = useCallback(
    ({ status, variant }: { status: number; variant?: TypographyVariant }) => {
      if (PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['0']) {
        return null;
      }

      if (isDup && hasTarget) {
        return isPriceDown ? (
          <PriceDownOverlay variant={variant} />
        ) : (
          <DuplicatedOverlay variant={variant} />
        );
      }

      if (PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['4']) {
        return <ReservingOverlay variant={variant} />;
      }

      return <SoldOutOverlay variant={variant} />;
    },
    [hasTarget, isDup, isPriceDown]
  );

  return (
    <ProductFixedSummaryCard
      isOpen
      showAppDownloadBanner={showAppDownloadBanner}
      onClick={() => router.push(`/products/${router.query.id}`)}
    >
      {data?.product && (
        <ProductFixedSummary
          isSafe={isSafe}
          image={data.product.imageThumbnail || data.product.imageMain}
          title={data.product.title}
          price={data.product.price}
          status={data.product.status}
          getProductImageOverlay={getProductImageOverlay}
        />
      )}
    </ProductFixedSummaryCard>
  );
}

const ProductFixedSummaryCard = styled.div<{ isOpen: boolean; showAppDownloadBanner: boolean }>`
  position: fixed;
  display: grid;
  grid-template-columns: 64px auto;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  opacity: ${({ isOpen }) => Number(isOpen)};
  transition: opacity 0.3s ease-in 0s;
  width: 100%;
  margin: 0 -20px;
  background-color: ${({ theme }) => theme.palette.common.grey['98']};
`;

export default ProductLegitSummaryCard;
