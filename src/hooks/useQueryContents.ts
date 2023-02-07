import { useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from '@tanstack/react-query';

import { Content } from '@dto/common';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';

import { eventContentProductsParamsState } from '@recoil/eventFilter';

function useQueryContents(onSuccess?: (successData: Content) => void) {
  const eventContentProductsParams = useRecoilValue(eventContentProductsParamsState);

  const { data, ...useQueryResult } = useQuery(
    queryKeys.commons.content(eventContentProductsParams.id),
    () => fetchContent(eventContentProductsParams.id),
    {
      enabled: !!eventContentProductsParams.id,
      onSuccess
    }
  );

  const realPriceAverage = useMemo(
    () =>
      Number(
        data?.models.find(({ keyword }) => keyword === eventContentProductsParams.keyword)
          ?.priceAvg || 0
      ),
    [eventContentProductsParams.keyword, data?.models]
  );

  return { ...useQueryResult, data: { ...data, realPriceAverage } };
}

export default useQueryContents;
