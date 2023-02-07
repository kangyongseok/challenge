import { useRouter } from 'next/router';
import { Box, Grid, Image, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import {
  LegitGridCard,
  LegitGridCardSkeleton,
  ProductGridCard,
  ProductGridCardSkeleton
} from '@components/UI/molecules';
import { LegitLabel } from '@components/UI/atoms';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchLegit } from '@api/dashboard';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { commaNumber, getProductDetailUrl } from '@utils/common';

import { ABTestGroup } from '@provider/ABTestProvider';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function HomeLegitAuthenticProductList() {
  const router = useRouter();

  const { data: { recommLegitInfo: { legitTargetCount = 0 } = {} } = {} } = useQueryUserInfo();

  const { isLoading, data: { caseHistories = [] } = {} } = useQuery(
    queryKeys.dashboards.legit({ result: 1 }),
    () =>
      fetchLegit({
        result: 1
      })
  );

  const handleClickBanner = () => {
    logEvent(attrKeys.home.CLICK_LEGIT_MAIN, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.LEGIT_MAIN
    });

    router.push('/legit');
  };

  const handleClickCard = (product: ProductResult) => () => {
    logEvent(attrKeys.home.CLICK_LEGIT_INFO, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.BEST
    });
    router.push(
      `/legit${getProductDetailUrl({
        type: 'productResult',
        product
      }).replace(/\/products/g, '')}/result`
    );
  };

  return (
    <Box component="section" customStyle={{ marginTop: 32, overflow: 'hidden' }}>
      <Image
        disableAspectRatio
        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/welcome/legit_banner.png`}
        alt="Legit Banner Img"
        onClick={handleClickBanner}
      />
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{ margin: !legitTargetCount ? '32px 16px 20px' : '0 16px 20px' }}
      >
        전문가들이 정품의견을 주었어요 🔍
      </Typography>
      <Grid container columnGap={12} rowGap={20} customStyle={{ padding: '0 16px' }}>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2301} belong="A">
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`home-authentic-product-skeleton-${index}`} item xs={2}>
                <LegitGridCardSkeleton variant="gridB" />
              </Grid>
            ))}
          {!isLoading &&
            caseHistories.map(({ productResult, result, status, legitOpinions }) => (
              <Grid key={`home-authentic-product-${productResult.id}`} item xs={2}>
                <LegitGridCard
                  variant="gridB"
                  product={productResult}
                  result={result}
                  resultCount={
                    legitOpinions.filter(({ result: opinionResult }) => result === opinionResult)
                      .length
                  }
                  status={status}
                  onClick={handleClickCard(productResult)}
                />
              </Grid>
            ))}
        </ABTestGroup>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2301} belong="B">
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`home-authentic-product-skeleton-${index}`} item xs={2}>
                <LegitGridCardSkeleton variant="gridB" />
              </Grid>
            ))}
          {!isLoading &&
            caseHistories.map(({ productResult, result, status, legitOpinions }) => (
              <Grid key={`home-authentic-product-${productResult.id}`} item xs={2}>
                <LegitGridCard
                  variant="gridB"
                  product={productResult}
                  result={result}
                  resultCount={
                    legitOpinions.filter(({ result: opinionResult }) => result === opinionResult)
                      .length
                  }
                  status={status}
                  onClick={handleClickCard(productResult)}
                />
              </Grid>
            ))}
        </ABTestGroup>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2301} belong="C">
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`home-authentic-product-skeleton-${index}`} item xs={2}>
                <ProductGridCardSkeleton
                  // eslint-disable-next-line react/no-array-index-key
                  key={`home-authentic-product-skeleton-${index}`}
                  isRound
                  compact
                  hasAreaWithDateInfo={false}
                  hasMetaInfo={false}
                />
              </Grid>
            ))}
          {!isLoading &&
            caseHistories.map(({ productResult, legitOpinions }) => (
              <Grid key={`home-authentic-product-${productResult.id}`} item xs={2}>
                <ProductGridCard
                  product={productResult}
                  hidePrice
                  hideAreaWithDateInfo
                  hideProductLabel
                  hidePlatformLogo
                  hideWishButton
                  hideOverlay
                  isRound
                  compact
                  onClick={handleClickCard(productResult)}
                  customLabel={
                    <LegitLabel
                      text={`정품의견 ${commaNumber(
                        legitOpinions.filter(({ result }) => result === 1).length
                      )} 개`}
                      customStyle={{ width: 'fit-content', marginTop: 4 }}
                    />
                  }
                />
              </Grid>
            ))}
        </ABTestGroup>
      </Grid>
    </Box>
  );
}

export default HomeLegitAuthenticProductList;
