import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Grid, Image, Skeleton, Typography } from 'mrcamel-ui';
import { debounce, findIndex } from 'lodash-es';

import ProductGridCardSkeleton from '@components/UI/molecules/Skeletons/ProductGridCardSkeleton';
import ProductGridCard from '@components/UI/molecules/ProductGridCard';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchPersonalProducts } from '@api/personal';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { defaultBanners, femaleBanners, maleBanners } from '@constants/home';
import { BOTTOM_NAVIGATION_HEIGHT, MOBILE_WEB_FOOTER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import type { HomeSeasonBannerData } from '@typings/common';
import { homePersonalCurationBannersState } from '@recoil/home';
import { eventContentProductsParamsState } from '@recoil/eventFilter';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomePersonalCuration() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();

  const [banners, setHomePersonalCurationBannersState] = useRecoilState(
    homePersonalCurationBannersState
  );
  const resetEventContentProductsParamsState = useResetRecoilState(eventContentProductsParamsState);

  const [bannerGroup, setBannerGroup] = useState<HomeSeasonBannerData[]>([]);
  const prevIndexRef = useRef<number>();

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
    const getClickBannerTitle = () => {
      if (pathname.indexOf('/products') > -1) {
        return attrProperty.title.PRODUCT_LIST;
      }
      if (pathname.indexOf('/events') > -1) {
        return attrProperty.title.CRAZYWEEK;
      }
      if (pathname.indexOf('/myPortfolio') > -1) {
        return attrProperty.title.MYPORTFOLIO;
      }
      return undefined;
    };

    logEvent(attrKeys.home.CLICK_BANNER, {
      name: attrProperty.name.MAIN,
      title: getClickBannerTitle(),
      att: 'MIDDLE'
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

    if (pathname.indexOf('/events') > -1) {
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
        scrollTop + clientHeight >=
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
            if (prevIndexRef.current === findIndex(bannerGroup, randomBanner)) {
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
      <Typography variant="h3" weight="bold" customStyle={{ margin: '0 20px 20px' }}>
        {!accessUser
          ? '많은 사람들이 보고 있어요'
          : `${(accessUser || {}).userName || '회원'}님이 찾고 있는 매물을 모았어요`}
      </Typography>
      <Grid container columnGap={16} rowGap={32} customStyle={{ padding: '0 20px' }}>
        {isLoading &&
          Array.from({ length: 24 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={`home-personal-curation-product-skeleton-${index}`}>
              <Grid item xs={2}>
                <ProductGridCardSkeleton isRound compact />
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
                  <ProductGridCard
                    product={product}
                    productAtt={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.PERSONAL,
                      id: product.id,
                      index: index + 1,
                      brand: product.brand.name,
                      category: product.category.name,
                      parentId: product.category.parentId,
                      site: product.site.name,
                      price: product.price,
                      cluster: product.cluster,
                      source: attrProperty.source.MAIN_PERSONAL
                    }}
                    wishAtt={{
                      name: attrProperty.name.MAIN,
                      title: attrProperty.title.PERSONAL,
                      id: product.id,
                      index: index + 1,
                      brand: product.brand.name,
                      category: product.category.name,
                      parentId: product.category.parentId,
                      site: product.site.name,
                      price: product.price,
                      cluster: product.cluster,
                      source: attrProperty.source.MAIN_PERSONAL
                    }}
                    source={attrProperty.source.MAIN_PERSONAL}
                    isRound
                    hideProductLabel
                    compact
                  />
                </Grid>
                {(index + 1) % 16 === 0 && (
                  <Grid item xs={1} onClick={handleClickBanner(banners[index]?.pathname)}>
                    <Box
                      customStyle={{
                        margin: '0 -20px',
                        textAlign: 'center',
                        backgroundColor: banners[index]?.backgroundColor
                      }}
                    >
                      {banners[index]?.src && (
                        <Image
                          height={104}
                          src={banners[index]?.src}
                          alt="Banner Img"
                          disableAspectRatio
                        />
                      )}
                    </Box>
                  </Grid>
                )}
              </Fragment>
            );
          })}
      </Grid>
      {}
    </Box>
  );
}

export default HomePersonalCuration;
