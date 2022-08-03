import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { CtaButton, Flexbox, Grid, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductLegitCard, ProductLegitCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchLegitProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

function LegitCompleteGrid() {
  const router = useRouter();

  const [params] = useState({
    page: 0,
    size: 8,
    isOnlyResult: true
  });

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.products.legitProducts(params),
    ({ pageParam = 0 }) =>
      fetchLegitProducts({
        ...params,
        page: pageParam
      }),
    {
      getNextPageParam: (data) => {
        const { number = 0, totalPages = 0 } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const legitProducts = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);
  const isLastPage = useMemo(() => {
    const lastPage = pages[pages.length - 1] || {};
    return legitProducts.length >= 24 || lastPage.last;
  }, [pages, legitProducts]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataId = e.currentTarget.getAttribute('data-id');

    logEvent(attrKeys.legit.CLICK_LEGIT_RESULT, {
      name: attrProperty.legitName.LEGIT_MAIN
    });

    router.push(`/products/${dataId}/legit/result`);
  };

  const handleClickMoreButton = async () => {
    logEvent(attrKeys.legit.CLICK_LOADMORE, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.LEGIT_CASE
    });

    if (isLastPage) return;
    await fetchNextPage();
  };

  return (
    <Flexbox component="section" direction="vertical" gap={17} customStyle={{ marginTop: 20 }}>
      <Typography variant="h3" weight="bold">
        감정완료 사례
      </Typography>
      <ProductGrid container>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`product-legit-skeleton-${index}`} item xs={2}>
                <ProductLegitCardSkeleton />
              </Grid>
            ))
          : legitProducts.map((productLegit) => (
              <Grid key={`product-legit-${productLegit.productId}`} item xs={2}>
                <ProductLegitCard
                  productLegit={productLegit}
                  data-id={productLegit.productId}
                  onClick={handleClick}
                />
              </Grid>
            ))}
        {!isLastPage && (
          <Grid item xs={1}>
            <CtaButton
              fullWidth
              onClick={handleClickMoreButton}
              customStyle={{ borderColor: 'transparent', borderRadius: 0 }}
            >
              <Typography variant="body2" weight="bold">
                더보기
              </Typography>
            </CtaButton>
          </Grid>
        )}
      </ProductGrid>
    </Flexbox>
  );
}

const ProductGrid = styled(Grid)`
  border-radius: 16px;
  overflow: hidden;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.white};
  & > div {
    border-top: 1px solid;
    border-right: 1px solid;
    border-color: ${({
      theme: {
        palette: { common }
      }
    }) => common.grey['95']};
  }
`;

export default LegitCompleteGrid;
