import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Tab, TabGroup } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { fetchKeywordsSuggest } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';

import { searchValueState } from '@recoil/search';
import { showAppDownloadBannerState } from '@recoil/common';

interface NewSearchTabGroupProps {
  headerRef: RefObject<HTMLDivElement>;
}

function SearchTabGroup({ headerRef }: NewSearchTabGroupProps) {
  const router = useRouter();
  const { tab = 'keyword' } = router.query;

  const [init, setInit] = useState(true);

  const value = useRecoilValue(searchValueState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const { data = [] } = useQuery(
    queryKeys.products.keywordsSuggest(value),
    () => fetchKeywordsSuggest(value),
    {
      enabled: !!value
    }
  );

  const handleChange = (newValue: string | number) =>
    router.replace({
      pathname: '/search',
      query: {
        tab: newValue
      }
    });

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      const { clientHeight } = headerRef.current;

      if (!window.scrollY) {
        setInit(true);
        return;
      }

      if (showAppDownloadBanner && window.scrollY > clientHeight + APP_DOWNLOAD_BANNER_HEIGHT) {
        setInit(false);
      } else if (!showAppDownloadBanner && window.scrollY) {
        setInit(false);
      } else {
        setInit(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerRef, showAppDownloadBanner]);

  if (value && data && data.length) return null;

  return (
    <StyledNewSearchTabGroup showAppDownloadBanner={showAppDownloadBanner} init={init}>
      <TabGroup fullWidth onChange={handleChange} value={String(tab)}>
        <Tab text="브랜드" value="brand" />
        <Tab text="검색어" value="keyword" />
        <Tab text="카테고리" value="category" />
      </TabGroup>
    </StyledNewSearchTabGroup>
  );
}

const StyledNewSearchTabGroup = styled.div<{ showAppDownloadBanner: boolean; init: boolean }>`
  position: sticky;
  top: ${HEADER_HEIGHT}px;
  transform: translateY(
    ${({ showAppDownloadBanner, init }) => {
      let translateY = 0;
      if (showAppDownloadBanner) {
        translateY = APP_DOWNLOAD_BANNER_HEIGHT;
      }
      if (init) {
        translateY = 0;
      }
      return translateY;
    }}px
  );
  transition: transform 0.5s;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

export default SearchTabGroup;
