import { useRecoilValue } from 'recoil';
import { Box, Grid, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import { fetchRecommendProducts } from '@api/personal';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { hasHomeTabChangeState } from '@recoil/home';
import { ABTestGroup } from '@provider/ABTestProvider';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function HomeStyleRecommendProductList() {
  const params = {
    size: 200,
    useStyle: true
  };

  const { userNickName } = useQueryMyUserInfo();
  const hasHomeTab = useRecoilValue(hasHomeTabChangeState);

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
        padding: '32px 16px 20px',
        overflowX: 'hidden'
      }}
    >
      <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
        {userNickName}님을 위한 추천
      </Typography>
      <Grid container rowGap={20} columnGap={12}>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="A">
          {isFetching &&
            Array.from({ length: 4 }, (_, index) => (
              <Grid key={`home-style-recommend-product-skeleton-${index}`} item xs={2}>
                <NewProductGridCardSkeleton />
              </Grid>
            ))}
          {!isFetching &&
            data?.products?.content.map((product, index) => (
              <Grid key={`home-style-recommend-product-${product.id}`} item xs={2}>
                <NewProductGridCard
                  product={product}
                  variant="gridB"
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
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="B">
          {isFetching &&
            Array.from({ length: 4 }, (_, index) => (
              <Grid key={`home-style-recommend-product-skeleton-${index}`} item xs={2}>
                <NewProductGridCardSkeleton />
              </Grid>
            ))}
          {!isFetching &&
            data?.products?.content.map((product, index) => (
              <Grid key={`home-style-recommend-product-${product.id}`} item xs={2}>
                <NewProductGridCard
                  product={product}
                  hideSize={false}
                  variant="gridB"
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
      </Grid>
    </Box>
  );
}

export default HomeStyleRecommendProductList;
