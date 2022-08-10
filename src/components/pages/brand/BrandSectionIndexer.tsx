import type { MutableRefObject } from 'react';
import { memo, useCallback } from 'react';

import { useRecoilValue } from 'recoil';
import { Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT, SEARCH_BAR_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';

interface BrandSectionIndexerProps {
  brandsIndexList: string[];
  brandNavRef: MutableRefObject<HTMLDivElement[]>;
}

function BrandSectionIndexer({ brandsIndexList, brandNavRef }: BrandSectionIndexerProps) {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const handleClick = useCallback(
    (brandsIndex: string, index: number) => () => {
      logEvent(attrKeys.brand.CLICK_NAVIGATION_LETTER, { att: brandsIndex });

      if (index === brandsIndexList.length - 1) {
        window.scrollTo(0, document.body.scrollHeight);
        return;
      }

      brandNavRef.current[index].scrollIntoView(true);
      window.scrollBy(
        0,
        -HEADER_HEIGHT -
          SEARCH_BAR_HEIGHT -
          (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
      );
    },
    [brandNavRef, brandsIndexList.length, showAppDownloadBanner]
  );

  return (
    <Wrapper showAppDownloadBanner={showAppDownloadBanner}>
      {brandsIndexList.map((brandsIndex, index) => (
        <IndexItem
          key={`brands-index-${brandsIndex}`}
          variant="body2"
          onClick={handleClick(brandsIndex, index)}
        >
          {brandsIndex}
        </IndexItem>
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.section<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    112 + (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)}px;
  padding-top: 32px;
  right: 0;
  user-select: none;
  overflow: scroll;
  height: calc(
    100% -
      ${({ showAppDownloadBanner }) =>
        175 + (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)}px
  );
  display: flex;
  flex-direction: column;
`;

const IndexItem = styled(Typography)`
  width: 40px;
  padding: 8px 0;
  text-align: center;
  color: ${({ theme }) => theme.palette.common.grey['60']};
  line-height: 16px;
  cursor: pointer;
`;

export default memo(BrandSectionIndexer);
