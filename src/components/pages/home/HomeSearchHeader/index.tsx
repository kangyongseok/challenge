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
import { APP_DOWNLOAD_BANNER_HEIGHT, IOS_SAFE_AREA_TOP } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import { showAppDownloadBannerState } from '@recoil/common';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryUserHistoryManages from '@hooks/useQueryUserHistoryManages';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import Menu from './Menu';

function HomeSearchHeader() {
  const router = useRouter();

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const [init, setInit] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

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

  return (
    <StyledHomeSearchHeader
      ref={headerRef}
      gap={16}
      alignment="center"
      showAppDownloadBanner={showAppDownloadBanner}
      init={init || (typeof window !== 'undefined' && !window.scrollY)}
    >
      <Box
        onClick={handleClick}
        customStyle={{
          flexGrow: 1
        }}
      >
        <Input
          variant="outline"
          size="large"
          fullWidth
          startAdornment={<Icon name="SearchOutlined" size="medium" color="ui20" />}
          placeholder="어떤 명품을 득템해 볼까요?"
          disabled
          customStyle={{
            maxHeight: 40,
            borderColor: common.ui20,
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            overflow: 'hidden',
            '& input::placeholder': {
              color: common.ui60
            }
          }}
        />
      </Box>
      <Menu />
    </StyledHomeSearchHeader>
  );
}

const StyledHomeSearchHeader = styled(Flexbox)<{ showAppDownloadBanner: boolean; init: boolean }>`
  position: sticky;
  top: 0;
  left: 0;
  padding: ${isExtendedLayoutIOSVersion() ? `calc(${IOS_SAFE_AREA_TOP} + 8px)` : '8px'} 16px 8px;
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
