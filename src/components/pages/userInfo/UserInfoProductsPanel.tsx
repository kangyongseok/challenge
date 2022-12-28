/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useCallback, useEffect, useMemo } from 'react';

import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Index,
  InfiniteLoader,
  List,
  ListRowProps,
  WindowScroller
} from 'react-virtualized';
import { useInfiniteQuery } from 'react-query';
import { Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductListCard, ProductListCardSkeleton } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { fetchProductsByUserId } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

const cache = new CellMeasurerCache({
  fixedWidth: true
});

interface UserInfoProductsPanelProps {
  userId: number;
}

function UserInfoProductsPanel({ userId }: UserInfoProductsPanelProps) {
  const {
    theme: { palette }
  } = useTheme();

  const params = useMemo(() => ({ userId, size: 20 }), [userId]);
  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.users.productsByUserId(params),
    async ({ pageParam = 0 }) => fetchProductsByUserId({ ...params, page: pageParam }),
    {
      enabled: !!params.userId,
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData || {};

        if (number > 0) {
          logEvent(attrKeys.sellerInfo.LOAD_MOREAUTO, {
            title: attrProperty.title.SELLER_PRODUCT,
            name: attrProperty.name.SELLER_PRODUCT,
            page: number,
            userId
          });
        }

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const userProducts = useMemo(() => pages.flatMap(({ content }) => content), [pages]);

  const loadMoreRows = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleResize = useCallback(() => {
    cache.clearAll();
  }, []);

  const rowRenderer = useCallback(
    ({ key, index, parent, style }: ListRowProps) => {
      const product = userProducts[index];

      return product ? (
        // @ts-ignore
        <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
          <div style={{ ...style, paddingBottom: 20 }}>
            <ProductListCard
              product={product}
              productAtt={{
                // name: attrKeys.products.SELLER_PRODUCT,
                ...product
              }}
              isRound
              // source={attrProperty.productSource.SELLER_PRODUCT}
              hideMetaSocialInfo={false}
              hideProductLabel={false}
            />
          </div>
        </CellMeasurer>
      ) : null;
    },
    [userProducts]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return !isLoading && userProducts.length === 0 ? (
    <Typography
      weight="bold"
      variant="h3"
      customStyle={{ textAlign: 'center', margin: '84px 20px 0', color: palette.common.ui60 }}
    >
      판매중인 매물이 없어요
    </Typography>
  ) : (
    <>
      {!isLoading && (
        <Banner>
          <Typography variant="body2" customStyle={{ color: palette.common.ui60 }}>
            카멜이 다루는 명품 브랜드만 보여드려요 (최근 6개월)
          </Typography>
        </Banner>
      )}
      <Flexbox
        component="section"
        direction="vertical"
        gap={isLoading ? 20 : 0}
        customStyle={{ padding: 20 }}
      >
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <ProductListCardSkeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`profile-user-product-skeleton-${index}`}
              isRound
            />
          ))
        ) : (
          // @ts-ignore
          <InfiniteLoader
            isRowLoaded={({ index }: Index) => !!userProducts[index]}
            loadMoreRows={loadMoreRows}
            rowCount={hasNextPage ? userProducts.length + 1 : userProducts.length}
          >
            {({ registerChild, onRowsRendered }) => (
              // @ts-ignore
              <WindowScroller>
                {({ height, isScrolling, scrollTop, scrollLeft }) => (
                  // @ts-ignore
                  <AutoSizer disableHeight onResize={handleResize}>
                    {({ width }) => (
                      // @ts-ignore
                      <List
                        ref={registerChild}
                        onRowsRendered={onRowsRendered}
                        width={width}
                        autoHeight
                        height={height}
                        rowCount={userProducts.length}
                        rowHeight={cache.rowHeight}
                        rowRenderer={rowRenderer}
                        scrollTop={scrollTop}
                        scrollLeft={scrollLeft}
                        isScrolling={isScrolling}
                        deferredMeasurementCache={cache}
                      />
                    )}
                  </AutoSizer>
                )}
              </WindowScroller>
            )}
          </InfiniteLoader>
        )}
      </Flexbox>
    </>
  );
}

const Banner = styled.section`
  background-color: ${({ theme: { palette } }) => palette.common.bg02};
  padding: 12px 20px;
  text-align: center;
`;

export default UserInfoProductsPanel;
