import { UIEvent, useCallback, useEffect, useRef } from 'react';

import { useRecoilState } from 'recoil';
import throttle from 'lodash-es/throttle';
import { useQueryClient } from '@tanstack/react-query';
import { Box, Flexbox, Skeleton, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Model } from '@dto/common';

import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import { EVENT_NEW_YEAR_FILTER_INFO_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import {
  eventContentDogHoneyFilterOffsetTopState,
  eventContentDogHoneyFilterState,
  eventContentProductsParamsState
} from '@recoil/eventFilter';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryContents from '@hooks/useQueryContents';

interface EventDogHoneyFilterProps {
  onMoveFixedInfo: () => void;
}

function EventDogHoneyFilter({ onMoveFixedInfo }: EventDogHoneyFilterProps) {
  const queryClient = useQueryClient();

  const [eventContentDogHoneyFilterOffsetTop, setEventContentDogHoneyFilterOffsetTopState] =
    useRecoilState(eventContentDogHoneyFilterOffsetTopState);
  const [{ selectedIndex, prevScroll }, setEventContentDogHoneyFilterState] = useRecoilState(
    eventContentDogHoneyFilterState
  );
  const [eventContentProductsParams, setEventContentProductsParamsState] = useRecoilState(
    eventContentProductsParamsState
  );

  const { isLoading, data: { models = [] } = {} } = useQueryContents();

  const fixedFilterRef = useRef<HTMLDivElement | null>(null);
  const filterListRef = useRef<HTMLDivElement | null>(null);
  const throttleScrollModelFilter = useRef(
    throttle((e: UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget?.scrollLeft;

      if (scrollLeft) {
        setEventContentDogHoneyFilterState((currVal) => ({
          ...currVal,
          prevScroll: scrollLeft
        }));
      }
    }, 200)
  );

  const isFixed = useScrollTrigger({ ref: fixedFilterRef, delay: 0 });

  const handleFilterScroll = (e: UIEvent<HTMLDivElement>) => {
    throttleScrollModelFilter.current(e);
  };

  const handleClickFilter = useCallback(
    ({
        keyword,
        priceAvg,
        priceCnt,
        index
      }: Model & {
        index: number;
      }) =>
      () => {
        logEvent(attrKeys.events.CLICK_TAG, {
          name: attrProperty.name.EVENT_DETAIL,
          title: '2301_DOG_HONEY',
          att: {
            keyword: keyword !== 'recomm' ? keyword : '추천',
            priceAvg,
            priceCnt,
            sort: index + 1
          }
        });

        setEventContentDogHoneyFilterState((currVal) => ({
          ...currVal,
          selectedIndex: index,
          totalElements: 0
        }));
        setEventContentProductsParamsState((currVal) => ({
          ...currVal,
          keyword
        }));
        onMoveFixedInfo();
        queryClient.removeQueries(queryKeys.commons.contentProducts(eventContentProductsParams));
      },
    [
      eventContentProductsParams,
      onMoveFixedInfo,
      queryClient,
      setEventContentDogHoneyFilterState,
      setEventContentProductsParamsState
    ]
  );

  useEffect(() => {
    if (eventContentDogHoneyFilterOffsetTop === 0) {
      setEventContentDogHoneyFilterOffsetTopState(
        (fixedFilterRef?.current?.getBoundingClientRect().top || 0) +
          (fixedFilterRef?.current?.clientHeight || 0)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filterListRef.current && prevScroll) {
      filterListRef.current.scrollTo(prevScroll, 0);
    }
  }, [prevScroll]);

  return (
    <>
      {isFixed && <Box customStyle={{ height: EVENT_NEW_YEAR_FILTER_INFO_HEIGHT }} />}
      <FixedFilter ref={fixedFilterRef} isFixed={isFixed} onScroll={handleFilterScroll}>
        <FilterList ref={filterListRef} onScroll={handleFilterScroll}>
          <Flexbox
            gap={30}
            alignment="center"
            customStyle={{ width: 'fit-content', padding: '20px' }}
          >
            {isLoading ? (
              Array.from({ length: 8 }, (_, index) => (
                <Flexbox key={`event-filter-skeleton-${index}`} direction="vertical" gap={20}>
                  <Skeleton
                    disableAspectRatio
                    round={8}
                    width={index === 0 ? 60 : 140}
                    height={40}
                  />
                </Flexbox>
              ))
            ) : (
              <>
                <FilterItemAll
                  variant="h3"
                  weight="bold"
                  isSelected={selectedIndex === 0}
                  onClick={handleClickFilter({
                    keyword: 'recomm',
                    priceAvg: 0,
                    priceCnt: 0,
                    index: 0
                  })}
                >
                  추천
                </FilterItemAll>
                {models.map((model, index) => (
                  <FilterItem
                    key={`event-filter-${model.keyword}`}
                    variant="h4"
                    weight="bold"
                    isSelected={index + 1 === selectedIndex}
                    onClick={handleClickFilter({ ...model, index: index + 1 })}
                  >
                    {model.keyword.split(' ')[0]}
                    <br />
                    {model.keyword.substring(model.keyword.indexOf(' ') + 1)}
                  </FilterItem>
                ))}
              </>
            )}
          </Flexbox>
        </FilterList>
      </FixedFilter>
    </>
  );
}

const FixedFilter = styled.section<{ isFixed: boolean }>`
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  ${({ isFixed }) =>
    isFixed && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: `${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : 0}`
    }};
`;

const FilterList = styled.div`
  overflow-x: auto;
  transition: all 0.5s;
  border-bottom: 1px solid ${({ theme: { palette } }) => palette.common.line01};
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
`;

const FilterItemBase = styled(Typography)<{ isSelected: boolean }>`
  height: 40px;
  color: ${({ isSelected, theme: { palette } }) =>
    isSelected ? palette.common.uiBlack : palette.common.ui90};
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
`;

const FilterItemAll = styled(FilterItemBase)`
  width: 60px;
`;

const FilterItem = styled(FilterItemBase)`
  max-width: max-content;
  width: 140px;
`;

export default EventDogHoneyFilter;
