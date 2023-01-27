import { useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';

import { logEvent } from '@library/amplitude';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  eventContentDogHoneyFilterState,
  eventContentProductsParamsState
} from '@recoil/eventFilter';

function useQueryContents() {
  const eventContentProductsParams = useRecoilValue(eventContentProductsParamsState);
  const eventContentDogHoneyFilter = useRecoilValue(eventContentDogHoneyFilterState);

  const { data, ...useQueryResult } = useQuery(
    queryKeys.commons.content(eventContentProductsParams.id),
    () => fetchContent(eventContentProductsParams.id),
    {
      enabled: !!eventContentProductsParams.id,
      onSuccess(successData) {
        if (successData) {
          logEvent(attrKeys.events.LOAD_EVENT_DETAIL, {
            name: attrProperty.name.EVENT_DETAIL,
            title: '2301_DOG_HONEY',
            data: successData,
            sort: eventContentDogHoneyFilter.selectedIndex + 1
          });
        }
      }
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
