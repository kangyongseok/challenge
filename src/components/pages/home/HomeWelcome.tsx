import { useRef } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import { SearchBar } from '@components/UI/molecules';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { RecentItems } from '@typings/search';
import {
  searchHelperPopupStateFamily,
  searchParamsState,
  selectedSearchOptionsDefault,
  selectedSearchOptionsState
} from '@recoil/searchHelper';
import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface HomeWelcomeProps {
  isViewSearchHelperOnboarding: () => boolean;
}

function HomeWelcome({ isViewSearchHelperOnboarding }: HomeWelcomeProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );

  const { data: accessUser } = useQueryAccessUser();
  const { data: { info: { value: { gender = '' } = {} } = {} } = {} } = useQueryUserInfo();
  const { data: keywords = [] } = useQuery(
    queryKeys.client.recentSearchList(),
    () => LocalStorage.get<RecentItems[]>(queryKeys.client.recentSearchList()[1]),
    {
      refetchOnMount: true
    }
  );
  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName as keyof typeof filterGenders].id;

  const searchBarRef = useRef<HTMLInputElement | null>(null);

  const triggered = useScrollTrigger({
    ref: searchBarRef,
    additionalOffsetTop: showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0,
    delay: 0
  });

  const handleClickSearchBar = () => {
    logEvent(attrKeys.home.CLICK_SEARCHMODAL, {
      name: 'MAIN',
      att: 'CONTENT'
    });

    if (isViewSearchHelperOnboarding()) {
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

  const handleClickAlarm = () => {
    logEvent(attrKeys.home.CLICK_BEHAVIOR_LIST, {
      name: 'MAIN'
    });

    if (!accessUser) {
      router.push('/login');
      return;
    }

    router.push('/notices');
  };

  return (
    <Box
      component="section"
      customStyle={{ margin: '0 -20px', padding: 20, backgroundColor: palette.primary.main }}
    >
      <Flexbox direction="horizontal" justifyContent="space-between">
        <Icon name="LogoText_96_20" color={palette.common.white} />
        <Icon
          name="AlarmOutlined"
          size="large"
          color={palette.common.white}
          onClick={handleClickAlarm}
        />
      </Flexbox>
      <Typography
        variant="h3"
        weight="regular"
        customStyle={{ marginTop: 34, color: palette.common.white }}
      >
        {accessUser?.userName ? `${accessUser.userName}님 👋` : '안녕하세요 🐪'}
      </Typography>
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{ marginBottom: 8, color: palette.common.white }}
      >
        대한민국 모든 중고명품 한방에 검색하세요
      </Typography>
      <SearchBar
        ref={searchBarRef}
        fullWidth
        startIcon={<Icon name="SearchOutlined" color="primary" />}
        placeholder="샤넬 클미, 나이키 범고래, 스톤 맨투맨"
        isFixed={triggered}
        readOnly
        onClick={handleClickSearchBar}
      />
      {triggered && <Box customStyle={{ height: 48, visibility: 'hidden' }} />}
      {keywords && keywords.length > 0 && (
        <>
          <Typography weight="medium" customStyle={{ marginTop: 16, color: palette.common.white }}>
            최근 검색어
          </Typography>
          <KeywordList>
            {keywords.map(({ keyword }, i) => (
              <KeywordChip
                key={`recent-search-keyword-${keyword}`}
                variant="body2"
                weight="medium"
                onClick={() => {
                  logEvent(attrKeys.home.CLICK_RECENT, {
                    name: 'MAIN',
                    title: 'RECENT',
                    index: i + 1,
                    keyword
                  });
                  router.push(`/products/search/${keyword}`);
                }}
              >
                {keyword}
              </KeywordChip>
            ))}
          </KeywordList>
        </>
      )}
    </Box>
  );
}

const KeywordList = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px -20px 0 -20px;
  padding: 0 20px;
  overflow-x: auto;
  flex-wrap: nowrap;
`;

const KeywordChip = styled(Typography)`
  display: inline-flex;
  align-items: center;
  min-width: fit-content;
  color: ${({ theme }) => theme.palette.common.white};
  border-radius: 16px;
  height: 30px;
  padding: 6px 10px;
  white-space: nowrap;
  background-color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
`;

export default HomeWelcome;
