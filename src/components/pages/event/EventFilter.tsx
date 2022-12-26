import { useRecoilState, useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Chip } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { Skeleton } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { eventContentProductsParamsState } from '@recoil/eventFilter/atom';
import { showAppDownloadBannerState } from '@recoil/common';

function EventFilter() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const eventId = Number(splitIds[splitIds.length - 1] || 0);

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [{ brandIds = [] }, setEventContentProductsParamsState] = useRecoilState(
    eventContentProductsParamsState
  );

  const { data: { brands = [] } = {}, isLoading } = useQuery(
    queryKeys.commons.content(Number(eventId)),
    () => fetchContent(Number(eventId)),
    {
      enabled: !!id,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  );

  const handleClick = (newBrandId: number, name: string) => () => {
    const getTitle = () => {
      if (String(id).split('-').includes('13')) {
        return 'QUICK';
      }
      if (String(id).split('-').includes('14')) {
        return 'LOWPRICE';
      }
      if (String(id).split('-').includes('15')) {
        return 'GENERAL_SELLER';
      }
      if (String(id).split('-').includes('16')) {
        return 'TOP_DEALS_PRODUCT';
      }
      return 'NUMBER_NULL';
    };

    logEvent(attrKeys.events.CLICK_TAG, {
      name: attrProperty.name.CRAZY_WEEK,
      title: getTitle(),
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
            width="56px"
            height="36px"
            disableAspectRatio
            customStyle={{ borderRadius: 18 }}
          />
        ))}
      {!isLoading && (
        <>
          <Chip
            variant={!brandIds.length ? 'contained' : 'ghost'}
            brandColor={!brandIds.length ? 'primary' : 'black'}
            size="large"
            onClick={handleClickAll}
          >
            전체
          </Chip>
          {brands.map(({ id: brandId, name }) => (
            <Chip
              key={`event-filter-${brandId}`}
              variant={brandIds.includes(brandId) ? 'contained' : 'ghost'}
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
  padding: 12px 20px;
  overflow-x: auto;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  transition: top 0.5s;
`;

export default EventFilter;
