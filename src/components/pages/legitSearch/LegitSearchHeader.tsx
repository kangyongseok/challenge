import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, Chip, Flexbox, Icon, Input, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { fetchProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import {
  legitSearchActiveFilterParamsState,
  legitSearchFilterParamsState
} from '@recoil/legitSearchFilter';
import { showAppDownloadBannerState } from '@recoil/common';
import useDebounce from '@hooks/useDebounce';

function LegitSearchHeader() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [{ legitParentIds = [] }, setLegitSearchFilterParamsState] = useRecoilState(
    legitSearchFilterParamsState
  );
  const activeParams = useRecoilValue(legitSearchActiveFilterParamsState);

  const [init, setInit] = useState(false);
  const [value, setValue] = useState('');

  const debouncedValue = useDebounce(value, 300);

  const headerRef = useRef<HTMLDivElement>(null);

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

  const handleClick = (id: number, name: string) => () => {
    logEvent(attrKeys.legitSearch.CLICK_LEGIT_FILTER, {
      name: attrProperty.name.LEGIT_HISTORY,
      title: attrProperty.title.CATEGORY,
      att: name
    });

    const newLegitParentIds = legitParentIds.includes(id)
      ? legitParentIds.filter((legitParentId) => legitParentId !== id)
      : [id];

    setLegitSearchFilterParamsState((prevState) => ({
      ...prevState,
      legitParentIds: newLegitParentIds
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const { offsetTop } = headerRef.current;

      if (showAppDownloadBanner && offsetTop <= APP_DOWNLOAD_BANNER_HEIGHT) {
        setInit(true);
      } else {
        setInit(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAppDownloadBanner]);

  useEffect(() => {
    setLegitSearchFilterParamsState((prevState) => ({
      ...prevState,
      keyword: debouncedValue
    }));
  }, [setLegitSearchFilterParamsState, debouncedValue]);

  return (
    <StyledLegitSearchHeader
      ref={headerRef}
      showAppDownloadBanner={showAppDownloadBanner && window && !!window.scrollY}
      init={init}
    >
      <Flexbox gap={12} alignment="center" customStyle={{ padding: '0 16px' }}>
        <Box onClick={() => router.back()}>
          <Icon name="Arrow1BackOutlined" />
        </Box>
        <Input
          fullWidth
          startAdornment={<Icon name="SearchOutlined" />}
          endAdornment={
            <Icon name="DeleteCircleFilled" color={common.ui80} onClick={() => setValue('')} />
          }
          size="large"
          placeholder="감정결과 내 키워드 검색"
          onClick={() =>
            logEvent(attrKeys.legitSearch.CLICK_LEGIT_SEARCH, {
              name: attrProperty.name.LEGIT_HISTORY
            })
          }
          onChange={(e) => setValue(e.currentTarget.value)}
          value={value}
          spellCheck={false}
          customStyle={{ border: 'none', background: common.ui95 }}
        />
      </Flexbox>
      <List>
        <Chip
          variant={legitParentIds.includes(481) ? 'solid' : 'ghost'}
          size="large"
          brandColor="black"
          onClick={handleClick(481, '신발')}
          disabled={isLoading}
        >
          신발
        </Chip>
        <Chip
          variant={legitParentIds.includes(479) ? 'solid' : 'ghost'}
          size="large"
          brandColor="black"
          onClick={handleClick(479, '가방')}
          disabled={isLoading}
        >
          가방
        </Chip>
        <Chip
          variant={legitParentIds.includes(480) ? 'solid' : 'ghost'}
          size="large"
          brandColor="black"
          onClick={handleClick(480, '지갑')}
          disabled={isLoading}
        >
          지갑
        </Chip>
        <Chip
          variant={legitParentIds.includes(482) ? 'solid' : 'ghost'}
          size="large"
          brandColor="black"
          onClick={handleClick(482, '의류')}
          disabled={isLoading}
        >
          의류
        </Chip>
        <Chip
          variant={legitParentIds.includes(483) ? 'solid' : 'ghost'}
          size="large"
          brandColor="black"
          onClick={handleClick(483, '기타')}
          disabled={isLoading}
        >
          기타
        </Chip>
      </List>
    </StyledLegitSearchHeader>
  );
}

const StyledLegitSearchHeader = styled.header<{
  showAppDownloadBanner: boolean;
  init: boolean;
}>`
  position: sticky;
  top: 0;
  padding-top: ${isExtendedLayoutIOSVersion() ? `calc(${IOS_SAFE_AREA_TOP} + 6px)` : '6px'};
  background: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  transition: transform 0.5s;
  transform: translateY(
    ${({ showAppDownloadBanner, init }) => {
      let translateY = 0;
      if (showAppDownloadBanner) {
        translateY += APP_DOWNLOAD_BANNER_HEIGHT;
      }
      if (init) {
        translateY = 0;
      }
      return `${translateY}px`;
    }}
  );
`;

const List = styled.section`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 6px;
  margin: 14px 0 12px;
  padding: 0 20px;
  overflow-x: auto;
`;

export default LegitSearchHeader;
