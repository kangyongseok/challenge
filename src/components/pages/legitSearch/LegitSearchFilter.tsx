import { useEffect } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Chip, Flexbox } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  legitSearchActiveFilterParamsState,
  legitSearchFilterParamsState
} from '@recoil/legitSearchFilter';

function LegitSearchFilter() {
  const [params, setLegitFilterParamsState] = useRecoilState(legitSearchFilterParamsState);
  const [activeParams, setLegitSearchActiveFilterParamsState] = useRecoilState(
    legitSearchActiveFilterParamsState
  );
  const resetActiveParams = useResetRecoilState(legitSearchActiveFilterParamsState);

  const { isLoading } = useInfiniteQuery(
    queryKeys.productLegits.searchLegits(activeParams),
    ({ pageParam = 0 }) =>
      fetchProductLegits({
        ...activeParams,
        page: pageParam
      }),
    {
      staleTime: 5 * 60 * 1000,
      getNextPageParam: (data) => {
        const { productLegits: { number = 0, totalPages = 0 } = {} } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const handleClick =
    ({ status, result, name }: { status: number; result: number; name: string }) =>
    () => {
      logEvent(attrKeys.legitSearch.CLICK_LEGIT_FILTER, {
        name: attrProperty.name.LEGIT_HISTORY,
        title: attrProperty.title.STATUS,
        att: name
      });

      setLegitFilterParamsState((prevState) => {
        const prevStatus = [...(prevState.status || [])];
        const prevResults = [...(prevState.results || [])];

        const hasAlreadyResult = prevResults.some((number) => number === result);

        if (hasAlreadyResult) prevStatus.splice(prevStatus.lastIndexOf(status), 1);

        return {
          ...prevState,
          status: hasAlreadyResult ? prevStatus : [...prevStatus, status],
          results: hasAlreadyResult
            ? prevResults.filter((number) => number !== result)
            : [...prevResults, result]
        };
      });
    };

  useEffect(() => {
    const { results = [], legitParentIds = [], keyword } = params;

    if (results.length || legitParentIds.length || keyword) {
      setLegitSearchActiveFilterParamsState({
        ...params,
        status: Array.from(new Set(params.status || []))
      });
    } else {
      resetActiveParams();
    }
  }, [setLegitSearchActiveFilterParamsState, resetActiveParams, params]);

  return (
    <Box component="section" customStyle={{ padding: '12px 20px 0' }}>
      <Flexbox gap={6}>
        <Chip
          variant={params.results?.includes(1) ? 'ghost' : 'ghost'}
          brandColor={params.results?.includes(1) ? 'blue' : 'black'}
          size="large"
          isRound={false}
          onClick={handleClick({ status: 30, result: 1, name: '정품의견' })}
          disabled={isLoading}
        >
          정품의견
        </Chip>
        <Chip
          variant={params.results?.includes(2) ? 'ghost' : 'ghost'}
          brandColor={params.results?.includes(2) ? 'blue' : 'black'}
          size="large"
          isRound={false}
          onClick={handleClick({ status: 30, result: 2, name: '가품의심' })}
          disabled={isLoading}
        >
          가품의심
        </Chip>
        <Chip
          variant={params.results?.includes(0) ? 'ghost' : 'ghost'}
          brandColor={params.results?.includes(0) ? 'blue' : 'black'}
          size="large"
          isRound={false}
          onClick={handleClick({ status: 20, result: 0, name: '감정중' })}
          disabled={isLoading}
        >
          감정중
        </Chip>
      </Flexbox>
    </Box>
  );
}

export default LegitSearchFilter;
