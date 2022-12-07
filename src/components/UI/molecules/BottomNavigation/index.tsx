import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { IconName } from 'mrcamel-ui';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { AppDownloadDialog, MyShopAppDownloadDialog } from '@components/UI/organisms';
import { Badge } from '@components/UI/atoms';

import FormattedText from '@library/FormattedText';
import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import {
  productsKeywordAutoSaveTriggerState,
  productsKeywordDialogState,
  productsKeywordInduceTriggerState
} from '@recoil/productsKeyword';
import { legitRequestParamsState } from '@recoil/legitRequest';
import { legitFilterGridParamsState, legitFiltersState } from '@recoil/legit';
import {
  homeLegitResultTooltipCloseState,
  homePersonalCurationBannersState,
  homeSelectedTabStateFamily
} from '@recoil/home';
import categoryState from '@recoil/category';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

import {
  LegitResultTooltip,
  List,
  ListItem,
  NewLabel,
  StyledBottomNavigation
} from './BottomNavigation.styles';

const data: {
  title: string;
  defaultIcon: IconName;
  activeIcon?: IconName;
  href: string;
  logName: string;
}[] = [
  {
    title: 'navigation.home',
    defaultIcon: 'NewHomeOutlined',
    activeIcon: 'NewHomeFilled',
    href: '/',
    logName: 'HOME'
  },
  {
    title: 'navigation.legit',
    defaultIcon: 'LegitOutlined',
    activeIcon: 'LegitFilled',
    href: '/legit',
    logName: 'LEGIT'
  },
  // {
  //   title: '',
  //   defaultIcon: 'PlusOutlined',
  //   href: '/camelSeller',
  //   logName: 'LISTING_TECH'
  // },
  {
    title: 'navigation.category',
    defaultIcon: 'NewCategoryOutlined',
    activeIcon: 'NewCategoryFilled',
    href: '/category',
    logName: 'CATEGORY'
  },
  {
    title: 'navigation.wishes',
    defaultIcon: 'NewHeartFavoriteOutlined',
    activeIcon: 'NewHeartFavoriteFilled',
    href: '/wishes',
    logName: 'WISH'
  },
  {
    title: 'navigation.myPage',
    defaultIcon: 'NewUserLargeOutlined',
    activeIcon: 'NewUserLargeFilled',
    href: '/mypage',
    logName: 'MY'
  }
];

interface BottomNavigationProps {
  display?: 'block' | 'none';
  disableHideOnScroll?: boolean;
  disableProductsKeywordClickInterceptor?: boolean;
}

function BottomNavigation({
  display,
  disableHideOnScroll = true,
  disableProductsKeywordClickInterceptor = true
}: BottomNavigationProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetCategory = useResetRecoilState(categoryState);
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));
  const resetRecentSearch = useResetRecoilState(homeSelectedTabStateFamily('recentSearch'));
  const resetLegitFilterGridParamsState = useResetRecoilState(legitFilterGridParamsState);
  const resetLegitFiltersState = useResetRecoilState(legitFiltersState);
  const resetLegitRequestParamsState = useResetRecoilState(legitRequestParamsState);
  const resetHomePersonalCurationBannersState = useResetRecoilState(
    homePersonalCurationBannersState
  );
  const { dialog } = useRecoilValue(productsKeywordInduceTriggerState);
  const setLegitResultTooltipCloseState = useSetRecoilState(homeLegitResultTooltipCloseState);
  const setProductsKeywordDialogState = useSetRecoilState(productsKeywordDialogState);
  const productsKeywordAutoSaveTrigger = useRecoilValue(productsKeywordAutoSaveTriggerState);
  const {
    data: {
      roles = [],
      priceNotiProducts = [],
      notViewedLegitCount = 0,
      notProcessedLegitCount = 0,
      isNewUser
    } = {},
    isLoading
  } = useQueryUserInfo();

  const triggered = useReverseScrollTrigger(!disableHideOnScroll);

  const [isAppDownModal, setIsAppDownModal] = useState(false);
  const [logAtt] = useState('');
  const legitNavRef = useRef<HTMLLIElement | null>(null);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [openLegitNotProcessedTooltip, setOpenLegitNotProcessedTooltip] = useState(false);
  const [triangleLeft, setTriangleLeft] = useState(0);

  const confirmPriceNotiProducts = useMemo(() => {
    return priceNotiProducts.filter(({ priceBefore, price }) => {
      if (priceBefore) {
        return getTenThousandUnitPrice(priceBefore - price) >= 1;
      }
      return false;
    });
  }, [priceNotiProducts]);

  // const currentTab = useMemo(() => {
  //   if (router.query.tab) return router.query.tab;
  //   if ((isNewUser || isNewUser === undefined) && !router.query.tab) {
  //     return 'recommend';
  //   }
  //   return 'following';
  // }, [router, isNewUser]);

  // const homeTabChange = () => {
  //   if (router.query.tab === 'following' || isNewUser) {
  //     router.push({
  //       pathname: '/',
  //       query: {
  //         tab: 'recommend'
  //       }
  //     });
  //   } else {
  //     router.push({
  //       pathname: '/',
  //       query: {
  //         tab: 'following'
  //       }
  //     });
  //   }
  // };

  const handleClickInterceptor =
    (title: string, logName: string, href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      logEvent(`${attrKeys.login.CLICK_TAB}_${logName}`, {
        title:
          !isLoading && notViewedLegitCount && logName === 'LEGIT'
            ? attrProperty.legitTitle.LEGITRESULT_TOOLTIP
            : undefined
      });

      if (title === 'navigation.home') {
        // homeTabChange();
        resetProductKeyword();
        resetRecentSearch();
      }

      if (title === 'navigation.category' && router.pathname !== '/category') {
        resetCategory();
      }

      if (
        dialog &&
        !disableProductsKeywordClickInterceptor &&
        // 검색한 목록 자동으로 저장한 경우 검색 목록 저장 유도 팝업 노출하지 않음
        !productsKeywordAutoSaveTrigger
      ) {
        e.preventDefault();
        setProductsKeywordDialogState({
          open: true,
          pathname: href
        });
      }

      if (href === '/') {
        resetHomePersonalCurationBannersState();
        queryClient
          .getQueryCache()
          .getAll()
          .forEach(({ queryKey }) => {
            if (queryKey.includes('personalProducts') || queryKey.includes('recommendProducts')) {
              queryClient.resetQueries(queryKey);
            }
          });
      }

      // TODO 관련 정책 정립 및 좀 더 좋은 방법 강구
      // 페이지 진입 시 fresh 한 데이터를 렌더링 해야하는 케이스, 앞으로도 계속 생길 수 있다고 판단 됨
      // https://www.figma.com/file/UOrCQ8651AXqQrtNeidfPk?node-id=1332:21420#238991618
      if (href === '/legit') {
        resetLegitFilterGridParamsState();
        resetLegitFiltersState();

        queryClient
          .getQueryCache()
          .getAll()
          .forEach(({ queryKey }) => {
            if (queryKey.includes('productLegits') && queryKey.length >= 3) {
              queryClient.resetQueries(queryKey);
            }
          });
      }
    };

  const handleResize = useCallback(() => {
    if (legitNavRef.current && !openTooltip) {
      setTriangleLeft(
        legitNavRef.current.offsetLeft + Math.floor(legitNavRef.current.clientWidth / 2) - 44
      );
    }
  }, [openTooltip]);

  const handleClickTooltip = () => {
    logEvent(attrKeys.home.CLICK_CLOSE, {
      title: attrProperty.legitTitle.LEGITRESULT_TOOLTIP
    });
    setOpenTooltip(false);
    setLegitResultTooltipCloseState(true);
    router.push({
      pathname: '/legit',
      query: {
        tab: 'my'
      }
    });
  };

  const handleClickLegitNotProcessedTooltip = () => {
    setOpenLegitNotProcessedTooltip(false);
    setLegitResultTooltipCloseState(true);
    resetLegitRequestParamsState();
    router.push({
      pathname: '/legit/admin',
      query: {
        tab: 'request'
      }
    });
  };

  const getQuery = (href: string) => {
    if (href === '/') {
      if (!router.query.tab) {
        if (isNewUser || isNewUser === undefined) {
          return { tab: 'recommend' };
        }
        return { tab: 'following' };
      }
      if (router.query.tab === 'recommend') {
        return { tab: 'following' };
      }
      return { tab: 'recommend' };
    }
    if (href === '/wishes' && confirmPriceNotiProducts.length) {
      return { scrollToProductId: confirmPriceNotiProducts[0].id };
    }
    if (href === '/legit' && notViewedLegitCount) {
      return { tab: 'my' };
    }
    return undefined;
  };

  const getPathName = (href: string) => {
    if (href === '/legit') {
      const hasLegitRole = (roles as string[]).some((role) => role.indexOf('PRODUCT_LEGIT') >= 0);
      return hasLegitRole ? '/legit/admin' : href;
    }
    return href;
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (legitNavRef.current && !openTooltip) {
      setTriangleLeft(
        legitNavRef.current.offsetLeft + Math.floor(legitNavRef.current.clientWidth / 2) - 44
      );
    }
  }, [openTooltip]);

  useEffect(() => {
    if (router.pathname === '/' && !isLoading && !notProcessedLegitCount && notViewedLegitCount) {
      logEvent(attrKeys.home.VIEW_LEGITRESULT_TOOLTIP, {
        name: attrProperty.productName.MAIN
      });
      setOpenTooltip(true);
    } else if (router.pathname === '/' && !isLoading && !notViewedLegitCount) {
      setOpenTooltip(false);
    }
  }, [router.pathname, isLoading, notViewedLegitCount, notProcessedLegitCount]);

  useEffect(() => {
    if (router.pathname === '/' && !isLoading && notProcessedLegitCount) {
      setOpenLegitNotProcessedTooltip(true);
    } else if (router.pathname === '/' && !isLoading && !notProcessedLegitCount) {
      setOpenLegitNotProcessedTooltip(false);
    }
  }, [router.pathname, isLoading, notProcessedLegitCount]);

  useEffect(() => {
    if (router.pathname === '/' && !isLoading && !notProcessedLegitCount && !notViewedLegitCount) {
      setLegitResultTooltipCloseState(true);
    }
  }, [
    isLoading,
    notProcessedLegitCount,
    notViewedLegitCount,
    router.pathname,
    setLegitResultTooltipCloseState
  ]);

  return (
    <>
      <StyledBottomNavigation display={display}>
        <List triggered={triggered}>
          {data.map(({ href, activeIcon, title, logName, defaultIcon }) => {
            const name = href.replace(/\//g, '');
            let isActive = router.pathname.includes(name);

            if (router.pathname !== '/' && !name && isActive) {
              isActive = false;
            }

            if (activeIcon) {
              return (
                <ListItem
                  key={`bottom-navigation-${title}`}
                  ref={href === '/legit' ? legitNavRef : undefined}
                >
                  {href === '/legit' && !isLoading && !notViewedLegitCount && (
                    <NewLabel variant="contained" text="NEW" size="xsmall" />
                  )}
                  <Link
                    href={{
                      pathname: getPathName(href),
                      query: getQuery(href)
                    }}
                    as={{
                      pathname: getPathName(href),
                      query: getQuery(href)
                    }}
                    passHref
                  >
                    <a onClick={handleClickInterceptor(title, logName, href)} aria-hidden="true">
                      <Box customStyle={{ position: 'relative' }}>
                        <Icon
                          name={isActive ? activeIcon : defaultIcon}
                          color={isActive ? common.ui20 : common.ui80}
                        />
                        <Badge
                          variant="two-tone"
                          brandColor="red"
                          type="alone"
                          open={href === '/legit' && !isLoading && !!notViewedLegitCount}
                          width={10}
                          height={10}
                          customStyle={{ position: 'absolute', top: -2, right: -5 }}
                        />
                      </Box>
                      <FormattedText
                        id={title}
                        variant="small2"
                        weight={isActive ? 'bold' : 'regular'}
                        customStyle={{
                          position: 'relative',
                          marginTop: 4,
                          color: isActive ? common.ui20 : common.ui80
                        }}
                      />
                    </a>
                  </Link>
                </ListItem>
              );
            }

            // if (accessUser && roles.includes(PRODUCT_SELLER as never)) {
            //   return (
            //     <ListItem
            //       key={`bottom-navigation-${navData.title}`}
            //       ref={navData.href === '/legit' ? legitNavRef : undefined}
            //     >
            //       <Link as={{ pathname: navData.href }} href={{ pathname: navData.href }} passHref>
            //         <a
            //           onClick={handleClickInterceptor(navData.title, navData.logName, navData.href)}
            //           aria-hidden="true"
            //         >
            //           <CenterIcon alignment="center" justifyContent="center">
            //             <Icon name={navData.defaultIcon} color={common.uiWhite} />
            //           </CenterIcon>
            //         </a>
            //       </Link>
            //     </ListItem>
            //   );
            // }
            return '';
          })}
        </List>
      </StyledBottomNavigation>
      <AppDownloadDialog
        open={isAppDownModal}
        onClose={() => setIsAppDownModal(false)}
        att={logAtt}
        name="FOOTER"
      />
      <LegitResultTooltip
        open={openLegitNotProcessedTooltip}
        message={
          <Flexbox justifyContent="space-between" gap={10}>
            <Typography variant="body2" weight="bold" customStyle={{ color: common.uiWhite }}>
              🔔 감정신청이 {commaNumber(notProcessedLegitCount)}건 있습니다!
            </Typography>
            <Typography variant="body2" weight="medium" customStyle={{ color: common.ui80 }}>
              바로가기
            </Typography>
          </Flexbox>
        }
        triangleLeft={triangleLeft}
        onClick={handleClickLegitNotProcessedTooltip}
      />
      <LegitResultTooltip
        open={openTooltip}
        message={
          <Flexbox justifyContent="space-between" gap={10}>
            <Typography variant="body2" weight="bold" customStyle={{ color: common.uiWhite }}>
              🔔 미확인 감정결과가 {commaNumber(notViewedLegitCount)}건 있습니다!
            </Typography>
            <Typography variant="body2" weight="medium" customStyle={{ color: common.ui80 }}>
              바로가기
            </Typography>
          </Flexbox>
        }
        triangleLeft={triangleLeft}
        onClick={handleClickTooltip}
      />
      <MyShopAppDownloadDialog />
    </>
  );
}

// const CenterIcon = styled(Flexbox)`
//   background: ${({ theme: { palette } }) => palette.primary.main};
//   width: 44px;
//   height: 44px;
//   border-radius: 50%;
//   margin: 8px auto;
//   box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
// `;

export default BottomNavigation;
