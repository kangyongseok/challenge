import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import { useMutation } from '@tanstack/react-query';
import { Box, Flexbox, Icon, Input, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';

import { filterGenders } from '@constants/productsFilter';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryUserHistoryManages from '@hooks/useQueryUserHistoryManages';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import Menu from './Menu';

function HomeSearchHeader() {
  const router = useRouter();

  const {
    theme: {
      typography: { h3 },
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [init, setInit] = useState(false);
  const [openMenu, setOpneMenu] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const searchInputHeaderRef = useRef<HTMLDivElement>(null);
  const openMenuTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggered = useScrollTrigger({ ref: headerRef });

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );

  const { data: userHistoryManage, refetch } = useQueryUserHistoryManages();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();

  const { mutate: mutatePostManage } = useMutation(postManage, {
    onSettled() {
      refetch().finally(() => router.push('/searchHelper/onboarding'));
    }
  });

  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName].id;

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_SEARCHMODAL, {
      name: attrProperty.name.MAIN
    });

    if (accessUser && userHistoryManage?.VIEW_SEARCH_HELPER) {
      mutatePostManage({ event: 'VIEW_SEARCH_HELPER', userId: accessUser.userId });

      setSelectedSearchOptions({
        ...selectedSearchOptionsDefault,
        pathname: router.pathname,
        gender: gender ? { id: genderId, name: genderName } : selectedSearchOptionsDefault.gender
      });
      setSearchParams(
        omitBy({ genderIds: genderId ? [genderId, filterGenders.common.id] : [] }, isEmpty)
      );
      return;
    }

    if (selectedSearchOptions.brand.id > 0 || selectedSearchOptions.parentCategory.id > 0) {
      setSearchHelperPopup(true);
      return;
    }

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
        <Icon name="LogoText_96_20" width={93.48} height={20} />
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
