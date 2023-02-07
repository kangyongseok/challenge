import { isEmpty, omit } from 'lodash-es';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { RecentSearchParams } from '@dto/product';

import { fetchSearchHistory } from '@api/product';

import queryKeys from '@constants/queryKeys';

import type { SearchHistoryHookType } from '@typings/camelSeller';

function useQuerySearchHistory({
  fetchData,
  type
}: {
  fetchData: RecentSearchParams;
  type: SearchHistoryHookType;
}) {
  const {
    data: { pages = [] } = {},
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    status
  } = useInfiniteQuery(
    queryKeys.products.searchHistory(fetchData, type),
    ({ pageParam = 0 }) => fetchSearchHistory({ ...fetchData, page: pageParam }),
    {
      enabled:
        !isEmpty(fetchData.brandIds) && !isEmpty(fetchData.categoryIds) && type === 'infinit',
      getNextPageParam: (nextData) => {
        const { number = 0, totalPages = 0 } = nextData.page || {};
        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const { data: sizeQuery } = useQuery(
    queryKeys.products.searchHistory(omit(fetchData, 'categorySizeIds')),
    () => fetchSearchHistory({ ...omit(fetchData, 'categorySizeIds') }),
    {
      enabled: !isEmpty(fetchData.brandIds) && !isEmpty(fetchData.categoryIds) && type === 'size'
    }
  );

  const { data: conditionQuery } = useQuery(
    queryKeys.products.searchHistory(omit(fetchData, 'conditionIds')),
    () => fetchSearchHistory({ ...omit(fetchData, 'conditionIds') }),
    {
      enabled:
        !isEmpty(fetchData.brandIds) && !isEmpty(fetchData.categoryIds) && type === 'condition'
    }
  );

  const { data: keywordQuery, isFetched } = useQuery(
    queryKeys.products.searchHistory({ ...fetchData }),
    () => fetchSearchHistory({ ...fetchData }),
    {
      enabled:
        !isEmpty(fetchData.brandIds) &&
        !isEmpty(fetchData.categoryIds) &&
        type === 'keyword' &&
        !!fetchData.keyword
    }
  );

  return {
    infinitQuery: {
      pages,
      isLoading,
      fetchNextPage,
      isFetchingNextPage,
      hasNextPage,
      status
    },
    filterQuery: {
      baseSearchOptions:
        type === 'size' ? sizeQuery?.baseSearchOptions : conditionQuery?.baseSearchOptions,
      searchOptions: type === 'size' ? sizeQuery?.searchOptions : conditionQuery?.searchOptions
    },
    keywordQuery: {
      content: keywordQuery?.page?.content || [],
      avgPrice: keywordQuery?.searchOptions?.avgPrice || 0,
      isLine: keywordQuery?.baseSearchOptions?.searchKeyword || '',
      isFetched
    }
  };
}

export default useQuerySearchHistory;
