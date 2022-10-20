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
import { homeLegitResultTooltipCloseState, homeSelectedTabStateFamily } from '@recoil/home';
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
    title: '홈',
    defaultIcon: 'NewHomeOutlined',
    activeIcon: 'NewHomeFilled',
    href: '/',
    logName: 'HOME'
  },
  {
    title: '사진감정',
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
    title: '카테고리',
    defaultIcon: 'NewCategoryOutlined',
    activeIcon: 'NewCategoryFilled',
    href: '/category',
    logName: 'CATEGORY'
  },
  {
    title: '찜/최근',
    defaultIcon: 'NewHeartFavoriteOutlined',
    activeIcon: 'NewHeartFavoriteFilled',
    href: '/wishes',
    logName: 'WISH'
  },
  {
    title: '마이',
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
  const { dialog } = useRecoilValue(productsKeywordInduceTriggerState);
  const setLegitResultTooltipCloseState = useSetRecoilState(homeLegitResultTooltipCloseState);
  const setProductsKeywordDialogState = useSetRecoilState(productsKeywordDialogState);
  const productsKeywordAutoSaveTrigger = useRecoilValue(productsKeywordAutoSaveTriggerState);
  const {
    data: {
      roles = [],
      priceNotiProducts = [],
      notViewedLegitCount = 0,
      notProcessedLegitCount = 0
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

  const handleClickInterceptor =
    (title: string, logName: string, href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      logEvent(`${attrKeys.login.CLICK_TAB}_${logName}`, {
        title:
          !isLoading && notViewedLegitCount && logName === 'LEGIT'
            ? attrProperty.legitTitle.LEGITRESULT_TOOLTIP
            : undefined
      });

      if (title === '홈') {
        resetProductKeyword();
        resetRecentSearch();
      }

      if (title === '카테고리' && router.pathname !== '/category') {
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
            if (queryKey.includes('legitProducts') && queryKey.length >= 3) {
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
          {data.map((navData) => {
            const name = navData.href.replace(/\//g, '');
            let isActive = router.pathname.includes(name);

            if (router.pathname !== '/' && !name && isActive) {
              isActive = false;
            }

            if (navData.activeIcon) {
              return (
                <ListItem
                  key={`bottom-navigation-${navData.title}`}
                  ref={navData.href === '/legit' ? legitNavRef : undefined}
                >
                  {navData.href === '/legit' && !isLoading && !notViewedLegitCount && (
                    <NewLabel variant="contained" text="NEW" size="xsmall" />
                  )}
                  <Link
                    href={{
                      pathname: getPathName(navData.href),
                      query: getQuery(navData.href)
                    }}
                    as={{
                      pathname: getPathName(navData.href),
                      query: getQuery(navData.href)
                    }}
                    passHref
                  >
                    <a
                      onClick={handleClickInterceptor(navData.title, navData.logName, navData.href)}
                      aria-hidden="true"
                    >
                      <Box customStyle={{ position: 'relative' }}>
                        <Icon
                          name={isActive ? navData.activeIcon : navData.defaultIcon}
                          color={isActive ? common.ui20 : common.ui80}
                        />
                        <Badge
                          variant="two-tone"
                          brandColor="red"
                          type="alone"
                          open={navData.href === '/legit' && !isLoading && !!notViewedLegitCount}
                          width={10}
                          height={10}
                          customStyle={{ position: 'absolute', top: -2, right: -5 }}
                        />
                      </Box>
                      <Typography
                        variant="small2"
                        weight={isActive ? 'bold' : 'regular'}
                        customStyle={{
                          position: 'relative',
                          marginTop: 4,
                          color: isActive ? common.ui20 : common.ui80
                        }}
                      >
                        {navData.title}
                      </Typography>
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
