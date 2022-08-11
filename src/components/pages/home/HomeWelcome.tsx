import { useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import { SearchBar } from '@components/UI/molecules';
import Skeleton from '@components/UI/atoms/Skeleton';

import { logEvent } from '@library/amplitude';

import { fetchProductDealInfos } from '@api/nextJs';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { commaNumber } from '@utils/common';

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
  titleViewType: number;
}

function HomeWelcome({ isViewSearchHelperOnboarding, titleViewType }: HomeWelcomeProps) {
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
  const { isLoading, data: productDealInfos = [] } = useQuery(
    queryKeys.nextJs.productDealInfos(),
    fetchProductDealInfos
  );
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName as keyof typeof filterGenders].id;

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
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{ backgroundColor: '#0D0D0D' }}
    >
      <Flexbox
        direction="horizontal"
        justifyContent="space-between"
        alignment="center"
        customStyle={{ padding: '16px 20px' }}
      >
        <Icon name="LogoText_96_20" color={palette.common.white} width={76} height={16} />
        <Icon
          name="AlarmOutlined"
          color={palette.common.white}
          onClick={handleClickAlarm}
          width={23}
          height={23}
        />
      </Flexbox>
      <Box customStyle={{ padding: '20px 20px 0' }}>
        <Title variant="h2" weight="bold">
          {titleViewType === 0 ? '대한민국 모든 중고명품' : '카멜이 다 모아오니까'}
        </Title>
        <Title variant="h2" weight="bold">
          {titleViewType === 0 ? (
            <>
              카멜에서&nbsp;<span>한방에 검색</span>하세요
            </>
          ) : (
            <>
              {accessUser?.userName || '회원'}님은&nbsp;<span>검색만</span>&nbsp;하세요!
            </>
          )}
        </Title>
      </Box>
      <SearchBar
        ref={searchBarRef}
        fullWidth
        startIcon={<Icon name="SearchOutlined" color="black" size="medium" />}
        placeholder="오늘은 어떤 명품을 득템해볼까요?"
        isFixed={triggered}
        readOnly
        brandColor="black"
        isBorder={false}
        customStyle={{ padding: triggered ? '12px 20px' : '0 20px' }}
        onClick={handleClickSearchBar}
      />
      {triggered && <Box customStyle={{ height: 48, visibility: 'hidden' }} />}
      <Box component="section" customStyle={{ padding: '0 20px 40px' }}>
        {isLoading ? (
          <Flexbox alignment="center" gap={8}>
            <Skeleton
              width="16px"
              height="16px"
              disableAspectRatio
              customStyle={{ borderRadius: 5 }}
            />
            <Flexbox alignment="center" justifyContent="space-between" customStyle={{ flex: 1 }}>
              <Skeleton
                width="215px"
                height="18px"
                disableAspectRatio
                customStyle={{ borderRadius: 4 }}
              />
              <Skeleton
                width="54px"
                height="18px"
                disableAspectRatio
                customStyle={{ borderRadius: 4 }}
              />
            </Flexbox>
          </Flexbox>
        ) : (
          <Swiper
            slidesPerView={1}
            loop
            direction="vertical"
            effect="flip"
            preventClicks
            allowTouchMove={false}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            speed={700}
            modules={[Autoplay]}
            style={{ height: 18 }}
          >
            {productDealInfos.map(
              ({
                userId,
                platform: { filename, name: platformName },
                product: { state, name, price },
                time,
                timeUnit
              }) => (
                <SwiperSlide key={`product-deal-${userId}`}>
                  <Flexbox gap={8} alignment="center">
                    <Avatar
                      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${filename}`}
                      alt={`${platformName}`}
                      customStyle={{ width: 15, height: 15 }}
                    />
                    <Flexbox
                      alignment="center"
                      justifyContent="space-between"
                      gap={8}
                      customStyle={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}
                    >
                      <Typography
                        variant="body2"
                        customStyle={{ color: palette.common.grey['80'] }}
                      >
                        {`${userId}님 ${state} ${name} ${commaNumber(price)}만원`}
                      </Typography>
                      <Typography
                        variant="small2"
                        customStyle={{ color: palette.common.grey['60'] }}
                      >
                        {`${time}${timeUnit} 득템`}
                      </Typography>
                    </Flexbox>
                  </Flexbox>
                </SwiperSlide>
              )
            )}
          </Swiper>
        )}
      </Box>
    </Flexbox>
  );
}

const Title = styled(Typography)`
  display: flex;
  color: ${({ theme: { palette } }) => palette.common.white};
  white-space: nowrap;

  > span {
    :after {
      content: '';
      display: block;
      height: 12px;
      width: 100%;
      background: ${({ theme: { palette } }) => palette.primary.main};
      margin-top: -13px;
    }
  }
`;

export default HomeWelcome;
