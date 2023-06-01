import { useEffect, useRef, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Input, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchAutoFocusState, searchCategoryState, searchValueState } from '@recoil/search';
import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';

import Menu from './Menu';

function HomeSearchHeader() {
  const router = useRouter();

  const {
    theme: {
      typography: { h3 },
      palette: { common }
    }
  } = useTheme();

  const [init, setInit] = useState(false);
  const [openMenu, setOpneMenu] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputHeaderRef = useRef<HTMLDivElement>(null);
  const openMenuTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggered = useScrollTrigger({ ref: headerRef });

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const resetSearchValueState = useResetRecoilState(searchValueState);
  const resetSearchCategoryState = useResetRecoilState(searchCategoryState);
  const resetSearchAutoFocusState = useResetRecoilState(searchAutoFocusState);

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_SEARCHMODAL, {
      name: attrProperty.name.MAIN
    });

    resetSearchValueState();
    resetSearchCategoryState();
    resetSearchAutoFocusState();

    router.push('/search');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current || !searchInputHeaderRef.current) return;

      const { offsetTop } = headerRef.current;
      const { clientHeight } = searchInputHeaderRef.current;

      if (!window.scrollY) {
        setInit(true);
        return;
      }

      if (offsetTop + clientHeight >= window.scrollY) {
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
    if (openMenuTimerRef.current) {
      clearTimeout(openMenuTimerRef.current);
    }

    if (triggered) {
      openMenuTimerRef.current = setTimeout(() => {
        setOpneMenu(true);
      }, 200);
    } else {
      setOpneMenu(false);
    }
  }, [triggered]);

  return (
    <>
      <Flexbox
        ref={headerRef}
        alignment="center"
        justifyContent="space-between"
        customStyle={{
          padding: '16px 16px 12px'
        }}
      >
        <Icon
          name="LogoText_96_20"
          width={93.48}
          height={20}
          customStyle={{
            marginLeft: 4
          }}
        />
        {!openMenu && <Menu reverseAnimation />}
      </Flexbox>
      <SearchHeader
        ref={searchInputHeaderRef}
        gap={16}
        alignment="center"
        showAppDownloadBanner={showAppDownloadBanner}
        init={init || (typeof window !== 'undefined' && !window.scrollY)}
      >
        <Box
          onClick={handleClick}
          customStyle={{
            flexGrow: 1,
            transition: 'max-width 0.2s',
            maxWidth: triggered ? 'calc(100% - 80px)' : '100%'
          }}
        >
          <Input
            variant="outline-ghost"
            size="large"
            fullWidth
            startAdornment={<Icon name="SearchOutlined" size="medium" color="ui20" />}
            placeholder="어떤 명품을 득템해 볼까요?"
            disabled
            customStyle={{
              gap: 8,
              pointerEvents: 'none',
              overflow: 'hidden',
              '& input::placeholder': {
                fontSize: h3.size,
                letterSpacing: h3.letterSpacing,
                lineHeight: h3.lineHeight,
                color: common.ui60
              }
            }}
          />
        </Box>
        {openMenu && <Menu />}
      </SearchHeader>
    </>
  );
}

const SearchHeader = styled(Flexbox)<{ showAppDownloadBanner: boolean; init: boolean }>`
  position: sticky;
  top: 0;
  left: 0;
  padding: 6px 16px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};

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
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

export default HomeSearchHeader;
