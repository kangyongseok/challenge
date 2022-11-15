import { useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Avatar, Box, Flexbox, Icon, useTheme } from 'mrcamel-ui';
import omitBy from 'lodash-es/omitBy';
import isEmpty from 'lodash-es/isEmpty';
import styled from '@emotion/styled';

import { SearchBar } from '@components/UI/molecules';
import { Badge, Skeleton } from '@components/UI/atoms';

import FormattedText from '@library/FormattedText';
import { logEvent } from '@library/amplitude';

import { fetchProductDealInfos } from '@api/nextJs';

import queryKeys from '@constants/queryKeys';
import { filterGenders } from '@constants/productsFilter';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
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
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setSearchHelperPopup = useSetRecoilState(searchHelperPopupStateFamily('continue'));
  const setSearchParams = useSetRecoilState(searchParamsState);
  const [selectedSearchOptions, setSelectedSearchOptions] = useRecoilState(
    selectedSearchOptionsState
  );

  const { data: accessUser } = useQueryAccessUser();
  const { data: { notViewedHistoryCount = 0, info: { value: { gender = '' } = {} } = {} } = {} } =
    useQueryUserInfo();
  const { isLoading, data: productDealInfos = [] } = useQuery(
    queryKeys.nextJs.productDealInfos(),
    fetchProductDealInfos
  );
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const genderName = gender === 'F' ? 'female' : 'male';
  const genderId = filterGenders[genderName].id;

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
      title: notViewedHistoryCount > 0 ? attrProperty.title.NEW : attrProperty.title.GENERAL
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
      customStyle={{ backgroundColor: common.cmn80 }}
    >
      <Flexbox
        direction="horizontal"
        justifyContent="space-between"
        alignment="center"
        customStyle={{ padding: '16px 20px' }}
      >
        <Icon name="LogoText_96_20" color={common.cmnW} width={76} height={16} />
        <Flexbox gap={24} alignment="center">
          <Badge
            open={!!notViewedHistoryCount}
            variant="two-tone"
            brandColor="red"
            text={notViewedHistoryCount > 99 ? '99+' : notViewedHistoryCount}
            width={20}
            height={20}
            customStyle={{ top: -8, right: -8, width: 'fit-content', minWidth: 20 }}
          >
            <Icon
              name="AlarmOutlined"
              color={common.uiWhite}
              onClick={handleClickAlarm}
              width={23}
              height={23}
            />
          </Badge>
        </Flexbox>
      </Flexbox>
      <Box customStyle={{ padding: '20px 20px 0' }}>
        <Title
          id={titleViewType === 0 ? 'home.welcome.titleSearch.t1' : 'home.welcome.titleUser.t1'}
          variant="h2"
          weight="bold"
        />
        <Title
          id={titleViewType === 0 ? 'home.welcome.titleSearch.t2' : 'home.welcome.titleUser.t2'}
          params={{ userName: accessUser?.userName || '회원' }}
          isHtml
          variant="h2"
          weight="bold"
        />
      </Box>
      <SearchBar
        ref={searchBarRef}
        readOnly
        fullWidth
        isFixed={triggered}
        variant={triggered ? 'outlined' : 'standard'}
        placeholder={t('home.welcome.searchPlaceholder')}
        onClick={handleClickSearchBar}
        startAdornment={<Icon name="SearchOutlined" color="black" size="medium" />}
      />
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
                      <FormattedText
                        id="home.welcome.deal.info"
                        params={{ userId, state, productName: name, price: commaNumber(price) }}
                        variant="body2"
                        customStyle={{ color: common.cmn20 }}
                      />
                      <FormattedText
                        id="home.welcome.deal.time"
                        params={{ time, timeUnit }}
                        variant="small2"
                        customStyle={{ color: common.ui60 }}
                      />
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

const Title = styled(FormattedText)`
  display: flex;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.cmnW};
  white-space: nowrap;

  > span {
    :after {
      content: '';
      display: block;
      height: 12px;
      width: 100%;
      background: ${({
        theme: {
          palette: { primary }
        }
      }) => primary.main};
      margin-top: -13px;
    }
  }
`;

export default HomeWelcome;
