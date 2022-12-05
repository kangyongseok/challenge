import { useQuery } from 'react-query';
import { Box, Grid, Typography, useTheme } from 'mrcamel-ui';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import { fetchRecommendProducts } from '@api/personal';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeStyleRecommendProductList() {
  const params = {
    size: 200,
    useStyle: true
  };
  const { data: accessUser } = useQueryAccessUser();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data, isLoading } = useQuery(queryKeys.personals.recommendProducts(params), () =>
    fetchRecommendProducts(params)
  );

  // const {
  //   data: { pages = [] } = {},
  //   isLoading,
  //   isFetchingNextPage,
  //   hasNextPage,
  //   fetchNextPage
  // } = useInfiniteQuery(
  //   queryKeys.personals.recommendProducts(params),
  //   ({ pageParam = 0 }) => fetchRecommendProducts({ ...params, page: pageParam }),
  //   {
  //     keepPreviousData: true,
  //     getNextPageParam: ({ products: { number = 0 } = {} }, allPages) =>
  //       allPages.length <= 5 ? number + 1 : undefined
  //   }
  // );

  // const styleRecommendProducts = useMemo(
  //   () => pages.flatMap(({ products: { content = [] } = {} }) => content),
  //   [pages]
  // );

  // useEffect(() => {
  //   const handleScroll = debounce(async () => {
  //     const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

  //     const isFloor =
  //       scrollTop + clientHeight >=
  //       scrollHeight -
  //         (!checkAgent.isIOSApp() || !checkAgent.isAndroidApp()
  //           ? MOBILE_WEB_FOOTER_HEIGHT + BOTTOM_NAVIGATION_HEIGHT
  //           : 0);

  //     if (hasNextPage && !isFetchingNextPage && isFloor) {
  //       await fetchNextPage();
  //     }
  //   }, 100);

  //   window.addEventListener('scroll', handleScroll);

  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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
      <Grid container rowGap={32} columnGap={12}>
        {isLoading &&
          Array.from({ length: 8 }, (_, index) => (
            <Grid key={`home-style-recommend-product-skeleton-${index}`} item xs={2}>
              <ProductGridCardSkeleton isRound />
            </Grid>
          ))}
        {!isLoading &&
          data?.products.content.map((product, i) => (
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
      </Grid>
    </Box>
  );
}

export default HomeStyleRecommendProductList;
