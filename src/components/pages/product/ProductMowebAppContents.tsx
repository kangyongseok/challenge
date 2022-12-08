import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Typography, useTheme } from 'mrcamel-ui';

import { ErrorBoundary } from '@components/UI/organisms';

import type { ProductDetail } from '@dto/product';

import { commaNumber } from '@utils/formats';
import { checkAgent } from '@utils/common';

import ProductSellerReviews from './ProductSellerReviews';
import ProductSellerProductList from './ProductSellerProductList';
import ProductLastLowerPrice from './ProductLastLowerPrice';
import ProductKeywordList from './ProductKeywordList';
import ProductAveragePriceChart from './ProductAveragePriceChart';

function ProductMowebAppContents({ data }: { data: ProductDetail | undefined }) {
  const {
    query: { isCrm }
  } = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (checkAgent.isAndroidApp() || checkAgent.isIOSApp()) {
      setIsApp(true);
    }
  }, []);

  const isShowChart = useMemo(() => {
    if (data?.product?.weekAvgPrices) {
      return (
        data.product.weekAvgPrices.slice(1).reduce((acc, v) => acc + v) > 0 &&
        data.product.scorePriceCount > 20
      );
    }

    if (data?.product?.quoteTitle) {
      return data.product.quoteTitle.indexOf(' ') < 0;
    }

    return false;
  }, [data?.product.quoteTitle, data?.product.scorePriceCount, data?.product.weekAvgPrices]);

  const relatedKeywordParams = {
    quoteTitle: data?.product.quoteTitle || '',
    brandIds: data?.product.brand.id ? [data.product.brand.id] : [],
    categoryIds: data?.product.category.id ? [data.product.category.id] : []
  };

  if (isApp) {
    return (
      <>
        <ErrorBoundary disableFallback>
          <ProductAveragePriceChart product={data?.product} />
        </ErrorBoundary>
        <ProductSellerProductList product={data?.product} roleSellerId={data?.roleSeller?.userId} />
        <ProductSellerReviews product={data?.product} />
        <Box customStyle={{ paddingTop: 20 }} />
        <ProductLastLowerPrice />
        {isCrm && (
          <Button variant="contained" brandColor="primary" customStyle={{ margin: '42px auto 0' }}>
            <Typography variant="body1" weight="bold" customStyle={{ color: common.cmnW }}>
              지금 모델 전체보기 ({commaNumber(data?.quoteTitleCount || 0)}개)
            </Typography>
          </Button>
        )}
        {!isCrm && (
          <ProductKeywordList productId={data?.product.id} params={relatedKeywordParams} />
        )}
      </>
    );
  }
  return (
    <>
      <ProductLastLowerPrice />
      {isCrm && (
        <Button variant="contained" brandColor="primary" customStyle={{ margin: '42px auto 0' }}>
          <Typography variant="body1" weight="bold" customStyle={{ color: common.cmnW }}>
            지금 모델 전체보기 ({commaNumber(data?.quoteTitleCount || 0)}개)
          </Typography>
        </Button>
      )}
      {!isCrm && <ProductKeywordList productId={data?.product.id} params={relatedKeywordParams} />}
      <ErrorBoundary disableFallback>
        <ProductAveragePriceChart product={data?.product} />
      </ErrorBoundary>
      {!isShowChart && <Box customStyle={{ paddingTop: 32 }} />}
      <ProductSellerProductList product={data?.product} roleSellerId={data?.roleSeller?.userId} />
      <ProductSellerReviews product={data?.product} />
    </>
  );
}

export default ProductMowebAppContents;
