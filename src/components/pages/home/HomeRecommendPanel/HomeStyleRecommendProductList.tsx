import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { Box, Grid, Typography, useTheme } from 'mrcamel-ui';

import {
  NewProductGridCard,
  NewProductGridCardSkeleton,
  ProductGridCard,
  ProductGridCardSkeleton
} from '@components/UI/molecules';

import { fetchRecommendProducts } from '@api/personal';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { hasHomeTabChangeState } from '@recoil/home';
import { ABTestGroup } from '@provider/ABTestProvider';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeStyleRecommendProductList() {
  const params = {
    size: 200,
    useStyle: true
  };
  const { data: accessUser } = useQueryAccessUser();
  const hasHomeTab = useRecoilValue(hasHomeTabChangeState);

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data, isFetching } = useQuery(
    queryKeys.personals.recommendProducts(params),
    () => fetchRecommendProducts(params),
    {
      refetchOnMount: hasHomeTab
    }
  );

  return (
    <Box
      component="section"
      customStyle={{
        marginTop: 32,
        padding: '32px 20px 20px',
        borderTop: `1px solid ${common.line01}`,
        overflowX: 'hidden'
      }}
    >
      <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
        {(accessUser || {}).userName || '회원'}님을 위한 추천
      </Typography>
      <Grid container rowGap={20} columnGap={12}>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2301} belong="A">
          {isFetching &&
            Array.from({ length: 4 }, (_, index) => (
              <Grid key={`home-style-recommend-product-skeleton-${index}`} item xs={2}>
                <NewProductGridCardSkeleton variant="gridB" isRound />
              </Grid>
            ))}
          {!isFetching &&
            data?.products?.content.map((product, index) => (
              <Grid key={`home-style-recommend-product-${product.id}`} item xs={2}>
                <NewProductGridCard
                  variant="gridB"
                  product={product}
                  isRound
                  attributes={{
                    name: attrProperty.name.MAIN,
                    title: attrProperty.title.STYLERECOMM,
                    source: attrProperty.source.MAIN_STYLE,
                    index: index + 1
                  }}
                />
              </Grid>
            ))}
        </ABTestGroup>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2301} belong="B">
          {isFetching &&
            Array.from({ length: 4 }, (_, index) => (
              <Grid key={`home-style-recommend-product-skeleton-${index}`} item xs={2}>
                <NewProductGridCardSkeleton variant="gridB" isRound />
              </Grid>
            ))}
          {!isFetching &&
            data?.products?.content.map((product, index) => (
              <Grid key={`home-style-recommend-product-${product.id}`} item xs={2}>
                <NewProductGridCard
                  variant="gridB"
                  product={product}
                  wishButtonType="B"
                  isRound
                  attributes={{
                    name: attrProperty.name.MAIN,
                    title: attrProperty.title.STYLERECOMM,
                    source: attrProperty.source.MAIN_STYLE,
                    index: index + 1
                  }}
                />
              </Grid>
            ))}
        </ABTestGroup>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2301} belong="C">
          {isFetching &&
            Array.from({ length: 4 }, (_, index) => (
              <Grid key={`home-style-recommend-product-skeleton-${index}`} item xs={2}>
                <ProductGridCardSkeleton isRound />
              </Grid>
            ))}
          {!isFetching &&
            data?.products?.content.map((product, i) => (
              <Grid key={`home-style-recommend-product-${product.id}`} item xs={2}>
                <ProductGridCard
                  product={product}
                  hideProductLabel
                  hideMetaCamelInfo
                  hideLegitStatusLabel
                  wishAtt={{
                    name: attrProperty.name.MAIN,
                    title: attrProperty.title.STYLERECOMM,
                    id: product.id,
                    index: i + 1,
                    brand: product.brand.name,
                    category: product.category.name,
                    parentId: product.category.parentId,
                    site: product.site.name,
                    price: product.price,
                    cluster: product.cluster,
                    source: attrProperty.source.MAIN_STYLE
                  }}
                  productAtt={{
                    name: attrProperty.name.MAIN,
                    title: attrProperty.title.STYLERECOMM,
                    id: product.id,
                    index: i + 1,
                    brand: product.brand.name,
                    category: product.category.name,
                    parentId: product.category.parentId,
                    site: product.site.name,
                    price: product.price,
                    cluster: product.cluster,
                    source: attrProperty.source.MAIN_STYLE
                  }}
                  source={attrProperty.source.MAIN_STYLE}
                  compact
                  isRound
                />
              </Grid>
            ))}
        </ABTestGroup>
      </Grid>
    </Box>
  );
}

export default HomeStyleRecommendProductList;
