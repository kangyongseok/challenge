import { useRecoilState, useRecoilValue } from 'recoil';
import { Chip, Skeleton } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { eventContentProductsParamsState } from '@recoil/eventFilter/atom';
import { showAppDownloadBannerState } from '@recoil/common';

function QuickFilter() {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [{ brandIds = [] }, setEventContentProductsParamsState] = useRecoilState(
    eventContentProductsParamsState
  );

  const { data: { brands = [] } = {}, isLoading } = useQuery(
    queryKeys.commons.content(15),
    () => fetchContent(15),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  );

  const handleClick = (newBrandId: number, name: string) => () => {
    logEvent(attrKeys.events.CLICK_TAG, {
      name: attrProperty.name.CRAZY_WEEK,
      title: attrProperty.title.GENERAL_SELLER,
      att: name,
      on: brandIds.includes(newBrandId) ? 'N' : 'Y'
    });

    setEventContentProductsParamsState((prevState) => ({
      ...prevState,
      brandIds: brandIds.includes(newBrandId)
        ? brandIds.filter((brandId) => brandId !== newBrandId)
        : brandIds.concat([newBrandId])
    }));
  };

  const handleClickAll = () =>
    setEventContentProductsParamsState((prevState) => ({
      ...prevState,
      brandIds: []
    }));

  const handleScroll = debounce(
    () =>
      logEvent(attrKeys.events.SWIPE_X_TAG, {
        name: attrProperty.name.CRAZY_WEEK
      }),
    300
  );

  return (
    <List showAppDownloadBanner={showAppDownloadBanner} onScroll={handleScroll}>
      {isLoading &&
        Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            // eslint-disable-next-line react/no-array-index-key
            key={`event-filter-skeleton-${index}`}
            width={56}
            height={36}
            round={18}
            disableAspectRatio
          />
        ))}
      {!isLoading && (
        <>
          <Chip
            variant={!brandIds.length ? 'solid' : 'ghost'}
            brandColor={!brandIds.length ? 'primary' : 'black'}
            size="large"
            onClick={handleClickAll}
          >
            전체
          </Chip>
          {brands.map(({ id: brandId, name }) => (
            <Chip
              key={`event-filter-${brandId}`}
              variant={brandIds.includes(brandId) ? 'solid' : 'ghost'}
              brandColor={brandIds.includes(brandId) ? 'primary' : 'black'}
              size="large"
              onClick={handleClick(brandId, name)}
            >
              {name}
            </Chip>
          ))}
        </>
      )}
    </List>
  );
}

const List = styled.section<{ showAppDownloadBanner: boolean }>`
  position: sticky;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + 56 : 56}px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  margin: 0 -20px;
  padding: 0 20px 12px;
  overflow-x: auto;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
`;

export default QuickFilter;
