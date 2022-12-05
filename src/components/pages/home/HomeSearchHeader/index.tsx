import { memo, useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Input, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';

import { filterGenders } from '@constants/productsFilter';
import { APP_DOWNLOAD_BANNER_HEIGHT, APP_TOP_STATUS_HEIGHT } from '@constants/common';
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
import useScrollTrigger from '@hooks/useScrollTrigger';
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

  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const menuOpenTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );

  const triggered = useScrollTrigger({
    ref: headerRef,
    additionalOffsetTop: showAppDownloadBanner ? 48 : 0,
    delay: 0
  });

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
    if (triggered) {
      if (menuOpenTimerRef.current) {
        clearTimeout(menuOpenTimerRef.current);
      }

      menuOpenTimerRef.current = setTimeout(() => {
        setOpen(true);
      }, 200);
    }
  }, [triggered, open]);

  useEffect(() => {
    if (!triggered && open) {
      setOpen(false);
    }
  }, [triggered, open]);

  useEffect(() => {
    return () => {
      if (menuOpenTimerRef.current) {
        clearTimeout(menuOpenTimerRef.current);
      }
    };
  }, []);

  return (
    <Wrap ref={headerRef}>
      <StyledHomeSearchHeader
        gap={16}
        alignment="center"
        triggered={triggered}
        showAppDownloadBanner={showAppDownloadBanner}
        isAppLayout={!!isExtendedLayoutIOSVersion()}
      >
        <Box
          onClick={handleClick}
          customStyle={{
            transition: 'max-width 0.2s',
            flexGrow: 1,
            maxWidth: triggered ? 'calc(100% - 80px)' : '100%'
          }}
        >
          <Input
            variant="contained"
            size="large"
            fullWidth
            startAdornment={<Icon name="SearchOutlined" size="medium" />}
            placeholder="어떤 명품을 득템해 볼까요?"
            disabled
            customStyle={{
              overflow: 'hidden',
              '& input::placeholder': {
                color: common.ui60
              }
            }}
          />
        </Box>
        {open && <Menu />}
      </StyledHomeSearchHeader>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  margin-top: 6px;
  height: 64px;
  min-height: 64px;
`;

const StyledHomeSearchHeader = styled(Flexbox)<{
  triggered: boolean;
  showAppDownloadBanner: boolean;
  isAppLayout: boolean;
}>`
  position: ${({ triggered }) => (triggered ? 'fixed' : 'static')};
  top: ${({ showAppDownloadBanner }) => {
    if (showAppDownloadBanner) {
      return `${APP_DOWNLOAD_BANNER_HEIGHT}px`;
    }

    return 0;
  }};
  width: 100%;
  padding: ${({ isAppLayout, triggered }) =>
      isAppLayout && triggered ? APP_TOP_STATUS_HEIGHT : 10}px
    20px 10px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  transition: top 0.2s;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
`;

export default memo(HomeSearchHeader);
