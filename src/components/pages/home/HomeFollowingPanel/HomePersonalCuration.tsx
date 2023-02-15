import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Grid, Skeleton, Typography } from 'mrcamel-ui';
import { debounce, findIndex } from 'lodash-es';
import { useInfiniteQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchPersonalProducts } from '@api/personal';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { defaultBanners, femaleBanners, maleBanners } from '@constants/home';
import { BOTTOM_NAVIGATION_HEIGHT, MOBILE_WEB_FOOTER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';
import abTestTaskNameKeys from '@constants/abTestTaskNameKeys';

import { checkAgent } from '@utils/common';

import type { HomeSeasonBannerData } from '@typings/common';
import { homePersonalCurationBannersState } from '@recoil/home';
import { eventContentProductsParamsState } from '@recoil/eventFilter';
import { ABTestGroup } from '@provider/ABTestProvider';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMoveCamelSeller from '@hooks/useMoveCamelSeller';

import HomeBannerCard from './HomeBannerCard';

function HomePersonalCuration() {
  const router = useRouter();

  const { userNickName } = useQueryMyUserInfo();
  const { data: accessUser } = useQueryAccessUser();

  const [banners, setHomePersonalCurationBannersState] = useRecoilState(
    homePersonalCurationBannersState
  );
  const resetEventContentProductsParamsState = useResetRecoilState(eventContentProductsParamsState);

  const [bannerGroup, setBannerGroup] = useState<HomeSeasonBannerData[]>([]);
  const prevIndexRef = useRef<number>();

  const handleClick = useMoveCamelSeller({
    attributes: {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.FOLLOWING,
      source: 'MAIN'
    }
  });

  const {
    data: { pages = [] } = {},
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    queryKeys.personals.personalProducts({
      page: 0,
      size: 20
    }),
    ({ pageParam = 0 }) =>
      fetchPersonalProducts({
        page: pageParam,
        size: 20
      }),
    {
      getNextPageParam: ({ number }, allPages) => (allPages.length < 10 ? number + 1 : undefined),
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000
    }
  );

  const products = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);

  const handleClickBanner = (pathname: string) => () => {
    if (pathname === '/camelSeller/registerConfirm') {
      handleClick();
      return;
    }

    const getClickBannerTitle = () => {
      if (pathname.indexOf('/products') > -1) {
        return attrProperty.title.PRODUCT_LIST;
      }
      if (pathname.indexOf('/events/interfereInKing') > -1) {
        return '2302_CAMEL_OPINION';
      }
      if (pathname.indexOf('/events') > -1) {
        return attrProperty.title.CRAZYWEEK;
      }
      if (pathname.indexOf('/myPortfolio') > -1) {
        return attrProperty.title.MYPORTFOLIO;
      }
      return undefined;
    };
    const getClickBannerAtt = () => {
      if (pathname.indexOf('/events/interfereInKing') > -1) {
        return 'YES';
      }
      return 'MIDDLE';
    };

    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: getClickBannerTitle(),
      att: getClickBannerAtt()
    });

    if (pathname.indexOf('/products') > -1) {
      logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        att: 'MIDDLE'
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        type: attrProperty.type.GUIDED
      });
    }

    if (pathname.indexOf('/events/interfereInKing') === -1 && pathname.indexOf('/events') > -1) {
      resetEventContentProductsParamsState();
      logEvent(attrKeys.home.CLICK_CRAZYWEEK, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        att: 'MIDDLE'
      });
    }

    if (pathname.indexOf('/myPortfolio') > -1) {
      logEvent(attrKeys.home.CLICK_MYPORTFOLIO, {
        name: attrProperty.name.MAIN,
        title: attrProperty.title.BANNER,
        att: 'MIDDLE'
      });
    }

    router.push(pathname);
  };

  useEffect(() => {
    const handleScroll = debounce(async () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

      const isFloor =
        Math.ceil(scrollTop + clientHeight) >=
        scrollHeight -
          (!checkAgent.isIOSApp() || !checkAgent.isAndroidApp()
            ? MOBILE_WEB_FOOTER_HEIGHT + BOTTOM_NAVIGATION_HEIGHT
            : 0);

      if (hasNextPage && !isFetchingNextPage && isFloor) {
        await fetchNextPage();
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (products.length) {
      products.forEach((_, index) => {
        const randomBanner = bannerGroup[Math.floor(Math.random() * bannerGroup.length)];
        setHomePersonalCurationBannersState((prevState) => {
          const newBanners = [...prevState];

          if ((index + 1) % 16 === 0 && !prevState[index]) {
            // 참견왕 이벤트 제일 우선 순위 렌더링
            if (index + 1 === 16) {
              newBanners[index] =
                (Math.random() < 0.5
                  ? defaultBanners.find(({ pathname }) => pathname === '/events/interfereInKing')
                  : defaultBanners.find(
                      ({ pathname }) => pathname === '/camelSeller/registerConfirm'
                    )) || randomBanner;
            } else if (prevIndexRef.current === findIndex(bannerGroup, randomBanner)) {
              newBanners[index] = bannerGroup[Math.abs(prevIndexRef.current - 2)];
            } else {
              newBanners[index] = randomBanner;
            }
            prevIndexRef.current = findIndex(bannerGroup, randomBanner);
          }

          return newBanners;
        });
      });
    }
  }, [setHomePersonalCurationBannersState, products, bannerGroup]);

  useEffect(() => {
    setBannerGroup(
      accessUser?.gender === 'F'
        ? [...defaultBanners, ...femaleBanners]
        : [...defaultBanners, ...maleBanners]
    );
  }, [accessUser?.gender]);

  return (
    <Box customStyle={{ padding: '32px 0', overflowX: 'hidden' }}>
      <Typography variant="h3" weight="bold" customStyle={{ margin: '0 16px 20px' }}>
        {!accessUser
          ? '많은 사람들이 보고 있어요'
          : `${userNickName}님이 찾고 있는 매물을 모았어요`}
      </Typography>
      <Grid container columnGap={12} rowGap={20} customStyle={{ padding: '0 16px' }}>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="A">
          {isLoading &&
            Array.from({ length: 24 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`home-personal-curation-product-skeleton-${index}`}>
                <Grid item xs={2}>
                  <NewProductGridCardSkeleton variant="gridB" />
                </Grid>
                {(index + 1) % 8 === 0 && (
                  <Grid item xs={1}>
                    <Box
                      customStyle={{
                        margin: '0 -20px'
                      }}
                    >
                      <Skeleton height={104} disableAspectRatio />
                    </Box>
                  </Grid>
                )}
              </Fragment>
            ))}
          {!isLoading &&
            products.map((product, index) => {
              return (
                <Fragment key={`home-personal-curation-product-${product.id}`}>
                  <Grid item xs={2}>
                    <NewProductGridCard
                      variant="gridB"
                      product={product}
                      attributes={{
                        name: attrProperty.name.MAIN,
                        title: attrProperty.title.PERSONAL,
                        source: attrProperty.source.MAIN_PERSONAL
                      }}
                    />
                  </Grid>
                  {(index + 1) % 16 === 0 && (
                    <Grid item xs={1}>
                      <HomeBannerCard
                        src={banners[index]?.src}
                        pathname={banners[index]?.pathname}
                        backgroundColor={banners[index]?.backgroundColor}
                        onClick={handleClickBanner(banners[index]?.pathname)}
                      />
                    </Grid>
                  )}
                </Fragment>
              );
            })}
        </ABTestGroup>
        <ABTestGroup name={abTestTaskNameKeys.BETTER_CARD_2302} belong="B">
          {isLoading &&
            Array.from({ length: 24 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={`home-personal-curation-product-skeleton-${index}`}>
                <Grid item xs={2}>
                  <NewProductGridCardSkeleton variant="gridB" />
                </Grid>
                {(index + 1) % 8 === 0 && (
                  <Grid item xs={1}>
                    <Box
                      customStyle={{
                        margin: '0 -20px'
                      }}
                    >
                      <Skeleton height={104} disableAspectRatio />
                    </Box>
                  </Grid>
                )}
              </Fragment>
            ))}
          {!isLoading &&
            products.map((product, index) => {
              return (
                <Fragment key={`home-personal-curation-product-${product.id}`}>
                  <Grid item xs={2}>
                    <NewProductGridCard
                      variant="gridB"
                      product={product}
                      platformLabelType="B"
                      hideSize={false}
                      attributes={{
                        name: attrProperty.name.MAIN,
                        title: attrProperty.title.PERSONAL,
                        source: attrProperty.source.MAIN_PERSONAL
                      }}
                    />
                  </Grid>
                  {(index + 1) % 16 === 0 && (
                    <Grid item xs={1}>
                      <HomeBannerCard
                        src={banners[index]?.src}
                        pathname={banners[index]?.pathname}
                        backgroundColor={banners[index]?.backgroundColor}
                        onClick={handleClickBanner(banners[index]?.pathname)}
                      />
                    </Grid>
                  )}
                </Fragment>
              );
            })}
        </ABTestGroup>
      </Grid>
    </Box>
  );
}

export default HomePersonalCuration;
