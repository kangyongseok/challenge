import { useMemo } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Chip, CtaButton, Flexbox, Grid, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductLegitCard, ProductLegitCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchLegitProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { legitCompleteGridParamsState } from '@recoil/legitCompleteGrid';

function LegitCompleteGrid() {
  const router = useRouter();
  const [{ page, size, results = [], isOnlyResult }, setLegitCompleteGridParamsState] =
    useRecoilState(legitCompleteGridParamsState);

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.products.legitProducts({ page, size, results, isOnlyResult }),
    ({ pageParam = 0 }) =>
      fetchLegitProducts({
        page: pageParam,
        size,
        results,
        isOnlyResult
      }),
    {
      staleTime: 5 * 60 * 1000,
      getNextPageParam: (data) => {
        const { number = 0, totalPages = 0 } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const legitProducts = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);
  const isLastPage = useMemo(() => {
    const lastPage = pages[pages.length - 1] || {};
    return legitProducts.length >= 80 || lastPage.last;
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

  const handleClickChip = (e: MouseEvent<HTMLButtonElement>) => {
    const dataResult = Number(e.currentTarget.getAttribute('data-result') || 0);

    let att = dataResult === 1 ? '정품의견' : '가품의심';
    if (dataResult === 3 || !dataResult) att = '감정불가';

    logEvent(attrKeys.legit.CLICK_LEGIT_FILTER, {
      name: attrProperty.legitName.LEGIT_MAIN,
      title: attrProperty.legitTitle.LEGIT_CASE_FILTER,
      att
    });

    setLegitCompleteGridParamsState((prevState) => {
      const { results: prevResults = [] } = prevState;
      let newResults = prevResults.includes(dataResult)
        ? prevResults.filter((result) => result !== dataResult)
        : results.filter((result) => result).concat([dataResult]);

      if (!newResults.length) newResults = newResults.concat([]);

      return {
        ...prevState,
        results: newResults
      };
    });
  };

  return (
    <Flexbox component="section" direction="vertical" customStyle={{ marginTop: 20 }}>
      <Typography variant="h3" weight="bold">
        감정완료 사례
      </Typography>
      <Flexbox gap={4} customStyle={{ marginTop: 12 }}>
        <Chip
          variant={results.includes(1) ? 'contained' : 'outlined'}
          brandColor={results.includes(1) ? 'black' : 'grey'}
          data-result={1}
          onClick={handleClickChip}
        >
          정품의견
        </Chip>
        <Chip
          variant={results.includes(2) ? 'contained' : 'outlined'}
          brandColor={results.includes(2) ? 'black' : 'grey'}
          data-result={2}
          onClick={handleClickChip}
        >
          가품의심
        </Chip>
        <Chip
          variant={results.includes(3) ? 'contained' : 'outlined'}
          brandColor={results.includes(3) ? 'black' : 'grey'}
          data-result={3}
          onClick={handleClickChip}
        >
          감정불가
        </Chip>
      </Flexbox>
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
  margin-top: 17px;
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
