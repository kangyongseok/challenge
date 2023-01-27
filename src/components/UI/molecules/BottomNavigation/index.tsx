import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { IconName } from 'mrcamel-ui';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { AppDownloadDialog, MyShopAppDownloadDialog } from '@components/UI/organisms';
import { Badge } from '@components/UI/atoms';

import FormattedText from '@library/FormattedText';
import { logEvent } from '@library/amplitude';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserName } from '@utils/user';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, needUpdateChatIOSVersion } from '@utils/common';
import { getUnreadMessagesCount } from '@utils/channel';

import { legitRequestParamsState } from '@recoil/legitRequest';
import { legitFilterGridParamsState, legitFiltersState } from '@recoil/legit';
import {
  homeLegitResultTooltipCloseState,
  homePersonalCurationBannersState,
  homeSelectedTabStateFamily
} from '@recoil/home';
import { dialogState } from '@recoil/common';
import { sendbirdState } from '@recoil/channel';
import categoryState from '@recoil/category';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryUserInfo from '@hooks/useQueryUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useInitializeSendbird from '@hooks/useInitializeSendbird';

import {
  LegitResultTooltip,
  List,
  ListItem,
  StyledBottomNavigation
} from './BottomNavigation.styles';

const data: {
  title: string;
  defaultIcon: IconName;
  activeIcon: IconName;
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
  {
    title: 'navigation.category',
    defaultIcon: 'NewCategoryOutlined',
    activeIcon: 'NewCategoryFilled',
    href: '/category',
    logName: 'CATEGORY'
  },
  {
    title: 'navigation.channel',
    defaultIcon: 'BnChatOutlined',
    activeIcon: 'BnChatFilled',
    href: '/channels',
    logName: 'CHANNEL'
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
}

function BottomNavigation({ display, disableHideOnScroll = true }: BottomNavigationProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();

  const { initialized, unreadMessagesCount } = useRecoilValue(sendbirdState);

  const setDialogState = useSetRecoilState(dialogState);

  const resetCategory = useResetRecoilState(categoryState);
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));
  const resetRecentSearch = useResetRecoilState(homeSelectedTabStateFamily('recentSearch'));
  const resetLegitFilterGridParamsState = useResetRecoilState(legitFilterGridParamsState);
  const resetLegitFiltersState = useResetRecoilState(legitFiltersState);
  const resetLegitRequestParamsState = useResetRecoilState(legitRequestParamsState);
  const resetHomePersonalCurationBannersState = useResetRecoilState(
    homePersonalCurationBannersState
  );
  const setLegitResultTooltipCloseState = useSetRecoilState(homeLegitResultTooltipCloseState);
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
  const initializeSendbird = useInitializeSendbird();

  const triggered = useReverseScrollTrigger(!disableHideOnScroll);

  const [isAppDownModal, setIsAppDownModal] = useState(false);
  const [logAtt] = useState('');
  const [openTooltip, setOpenTooltip] = useState(false);
  const [openLegitNotProcessedTooltip, setOpenLegitNotProcessedTooltip] = useState(false);
  const [triangleLeft, setTriangleLeft] = useState(0);

  const legitNavRef = useRef<HTMLLIElement | null>(null);

  const confirmPriceNotiProducts = useMemo(() => {
    return priceNotiProducts.filter(({ priceBefore, price }) => {
      if (priceBefore) {
        return getTenThousandUnitPrice(priceBefore - price) >= 1;
      }
      return false;
    });
  }, [priceNotiProducts]);

  const handleClickInterceptor =
    (title: string, logName: string, href: string) => async (e: MouseEvent<HTMLAnchorElement>) => {
      logEvent(`${attrKeys.login.CLICK_TAB}_${logName}`, {
        title:
          !isLoading && notViewedLegitCount && logName === 'LEGIT'
            ? attrProperty.legitTitle.LEGITRESULT_TOOLTIP
            : undefined
      });

      if (title === 'navigation.channel') {
        if (!accessUser) {
          e.preventDefault();
          router.push({ pathname: '/login' });
          return;
        }

        if (needUpdateChatIOSVersion()) {
          e.preventDefault();
          setDialogState({
            type: 'requiredAppUpdateForChat',
            customStyleTitle: { minWidth: 270 },
            disabledOnClose: true,
            secondButtonAction: () => {
              window.webkit?.messageHandlers?.callExecuteApp?.postMessage?.(
                'itms-apps://itunes.apple.com/app/id1541101835'
              );
            }
          });
          return;
        }

        if (!initialized) {
          await initializeSendbird(
            accessUser.userId.toString(),
            getUserName(accessUser.userName, accessUser.userId),
            accessUser.image
          );
          return;
        }

        queryClient.invalidateQueries(queryKeys.channels.channels({ type: 0, size: 20 }));
      }

      if (title === 'navigation.home') {
        // homeTabChange();
        resetProductKeyword();
        resetRecentSearch();
      }

      if (title === 'navigation.category' && router.pathname !== '/category') {
        resetCategory();
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

            return (
              <ListItem
                key={`bottom-navigation-${title}`}
                ref={href === '/legit' ? legitNavRef : undefined}
              >
                <Link
                  href={{ pathname: getPathName(href), query: getQuery(href) }}
                  as={{ pathname: getPathName(href), query: getQuery(href) }}
                  passHref
                >
                  <a onClick={handleClickInterceptor(title, logName, href)} aria-hidden="true">
                    <Box customStyle={{ position: 'relative' }}>
                      <Icon
                        name={isActive ? activeIcon : defaultIcon}
                        color={isActive ? common.ui20 : common.ui80}
                      />
                      <CustomBadge
                        open={
                          (href === '/legit' && !isLoading && !!notViewedLegitCount) ||
                          href === '/channels'
                        }
                        type="alone"
                        width={16}
                        height={16}
                        show={unreadMessagesCount > 0}
                      >
                        {getUnreadMessagesCount(unreadMessagesCount)}
                      </CustomBadge>
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

const CustomBadge = styled(Badge)<{ show: boolean }>`
  position: absolute;
  top: -2px;
  right: -4px;
  background-color: ${({ theme: { palette } }) => palette.secondary.red.main};
  font-weight: 500;
  opacity: ${({ show }) => Number(show)};
  transition: all 0.3s;
`;

export default BottomNavigation;
