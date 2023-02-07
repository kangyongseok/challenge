import { useEffect, useMemo } from 'react';

import { useRecoilState } from 'recoil';
import { Grid } from 'mrcamel-ui';
import { useInfiniteQuery } from '@tanstack/react-query';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import { fetchContentProducts } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

import { eventContentProductsParamsState } from '@recoil/eventFilter/atom';

function EventProductList() {
  const [params, setEventContentProductsParamsState] = useRecoilState(
    eventContentProductsParamsState
  );

  const {
    data: { pages = [] } = {},
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.commons.contentProducts(params),
    ({ pageParam = 0 }) => fetchContentProducts({ ...params, page: pageParam }),
    {
      getNextPageParam: ({ number, totalPages }, allPages) =>
        allPages.length <= 10 && totalPages > allPages.length ? number + 1 : undefined,
      enabled: !!params.id
    }
  );
  const products = useMemo(() => pages.flatMap(({ content = [] }) => content), [pages]);

  useEffect(() => {
    setEventContentProductsParamsState((prevState) => ({
      ...prevState,
      id: 15
    }));
  }, [setEventContentProductsParamsState]);

  useEffect(() => {
    const handleScroll = async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor = scrollTop + clientHeight >= scrollHeight;

      if (hasNextPage && !isFetchingNextPage && isFloor) await fetchNextPage();
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Grid component="section" container columnGap={16} rowGap={48} customStyle={{ marginTop: -2 }}>
      {isLoading &&
        Array.from({ length: 8 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid key={`event-product-skeleton-${index}`} item xs={2}>
            <ProductGridCardSkeleton isRound />
          </Grid>
        ))}
      {!isLoading &&
        products.map((product, index) => {
          let hidePriceDownCountLabel = true;
          let hideUpdatedCountLabel = true;

          let att = 'GENERAL';
          if (product.priceDownCount > 0) {
            hidePriceDownCountLabel = false;
            att = 'PRICE_LOW';
          } else if (product.updatedCount > 0) {
            hideUpdatedCountLabel = false;
            att = 'UPDATE';
          }
          return (
            <Grid key={`event-product-${product.id}`} item xs={2}>
              <ProductGridCard
                product={product}
                productAtt={{
                  name: attrProperty.name.CRAZY_WEEK,
                  title: attrProperty.title.GENERAL_SELLER,
                  att,
                  id: product.id,
                  index: index + 1,
                  brand: product.brand.name,
                  category: product.category.name,
                  parentId: product.category.parentId,
                  site: product.site.name,
                  price: product.price,
                  cluster: product.cluster
                }}
                wishAtt={{
                  name: attrProperty.name.CRAZY_WEEK,
                  title: attrProperty.title.GENERAL_SELLER,
                  att,
                  id: product.id,
                  index: index + 1,
                  brand: product.brand.name,
                  category: product.category.name,
                  parentId: product.category.parentId,
                  site: product.site.name,
                  price: product.price,
                  cluster: product.cluster
                }}
                hideProductLabel
                hidePriceDownCountLabel={hidePriceDownCountLabel}
                hideUpdatedCountLabel={hideUpdatedCountLabel}
                isRound
                compact
              />
            </Grid>
          );
        })}
    </Grid>
  );
}

export default EventProductList;
