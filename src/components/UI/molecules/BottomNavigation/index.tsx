import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type * as SvgIcons from 'mrcamel-ui/dist/assets/icons';
import { Flexbox, Icon, Tooltip, Typography, useTheme } from 'mrcamel-ui';

import { AppDownloadDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';
import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';
import commaNumber from '@utils/commaNumber';

import {
  productsKeywordAutoSaveTriggerState,
  productsKeywordDialogState,
  productsKeywordInduceTriggerState
} from '@recoil/productsKeyword';
import categoryState from '@recoil/category';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import {
  List,
  ListItem,
  PriceDownTooltipTitle,
  StyledBottomNavigation
} from './BottomNavigation.styles';

const data: {
  title: string;
  defaultIcon: keyof typeof SvgIcons;
  activeIcon: keyof typeof SvgIcons;
  href: string;
  logName: string;
}[] = [
  {
    title: '홈',
    defaultIcon: 'HomeOutlined',
    activeIcon: 'HomeFilled',
    href: '/',
    logName: 'HOME'
  },
  {
    title: '카테고리',
    defaultIcon: 'MenuOutlined',
    activeIcon: 'MenuOutlined',
    href: '/category',
    logName: 'CATEGORY'
  },
  {
    title: '찜/최근',
    defaultIcon: 'HeartFavoriteOutlined',
    activeIcon: 'HeartFavoriteFilled',
    href: '/wishes',
    logName: 'WISH'
  },
  {
    title: '마이',
    defaultIcon: 'UserLargeOutlined',
    activeIcon: 'UserLargeFilled',
    href: '/mypage',
    logName: 'MY'
  }
];

function getPriceNotiProductTitle(title = '') {
  if (title.length >= 9) {
    return `${title.slice(0, 8)}${title.length >= 9 ? '...' : ''}`;
  }
  return title;
}

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
  const resetCategory = useResetRecoilState(categoryState);
  const { dialog } = useRecoilValue(productsKeywordInduceTriggerState);
  const setProductsKeywordDialogState = useSetRecoilState(productsKeywordDialogState);
  const productsKeywordAutoSaveTrigger = useRecoilValue(productsKeywordAutoSaveTriggerState);
  const [isAppDownModal, setIsAppDownModal] = useState(false);
  const [logAtt] = useState('');
  const [customStyle, setCustomStyle] = useState({
    position: 'fixed',
    width: 'calc(100% - 40px)',
    height: 'fit-content',
    top: 'auto',
    bottom: -30,
    textAlign: 'center',
    visibility: 'hidden'
  });

  const triggered = useReverseScrollTrigger(!disableHideOnScroll);

  const queryClient = useQueryClient();
  const { data: accessUser } = useQueryAccessUser();
  const { data: { priceNotiProducts = [] } = {} } = useQuery(
    queryKeys.users.userInfo(),
    fetchUserInfo
  );
  const { mutate } = useMutation(postManage, {
    onSuccess: () => queryClient.invalidateQueries(queryKeys.users.userInfo())
  });

  const [openTooltip, setOpenTooltip] = useState(false);
  const [triangleLeft, setTriangleLeft] = useState(0);

  const wishNavRef = useRef<HTMLLIElement | null>(null);
  const openTooltipTimerRef = useRef<ReturnType<typeof setTimeout>>();

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
      logEvent(`${attrKeys.login.CLICK_TAB}_${logName}`);
      if (title === '카테고리') {
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
    };

  const handleResize = useCallback(() => {
    if (wishNavRef.current && openTooltip) {
      setTriangleLeft(wishNavRef.current.offsetLeft + wishNavRef.current.clientWidth / 2 - 32);
    }
  }, [openTooltip]);

  const handleClose = () => {
    if (!accessUser) return;

    mutate({
      event: 'CLICK_CLOSE',
      userId: accessUser.userId,
      title: 'WISHPRICE_TOOLTIP',
      name: 'MAIN'
    });
    setOpenTooltip(false);
  };

  useEffect(() => {
    const isHome = router.pathname === '/';
    if (isHome && confirmPriceNotiProducts.length) {
      setOpenTooltip(true);
      logEvent(attrKeys.home.VIEW_WISHPRICE_TOOLTIP, {
        name: 'MAIN',
        att: confirmPriceNotiProducts.length > 1 ? 'MANY' : 'ONE'
      });
    }
  }, [router.pathname, confirmPriceNotiProducts]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (wishNavRef.current && openTooltip) {
      setTriangleLeft(
        wishNavRef.current.offsetLeft + Math.floor(wishNavRef.current.clientWidth / 2) - 32
      );
    }
  }, [openTooltip]);

  useEffect(() => {
    if (openTooltip) {
      if (openTooltipTimerRef.current) {
        clearTimeout(openTooltipTimerRef.current);
      }

      openTooltipTimerRef.current = setTimeout(() => {
        setCustomStyle((prevState) => ({
          ...prevState,
          visibility: 'visible'
        }));
      }, 100);
    }

    return () => {
      if (openTooltipTimerRef.current) {
        clearTimeout(openTooltipTimerRef.current);
      }
    };
  }, [openTooltip]);

  return (
    <>
      <StyledBottomNavigation display={display}>
        <List triggered={triggered}>
          {data.map((navData) => {
            const isActive = router.pathname === navData.href;

            return (
              <ListItem
                key={`bottom-navigation-${navData.title}`}
                ref={navData.href === '/wishes' ? wishNavRef : undefined}
              >
                <Link
                  href={{
                    pathname: navData.href,
                    query:
                      navData.href === '/wishes' && confirmPriceNotiProducts.length
                        ? { scrollToProductId: confirmPriceNotiProducts[0].id }
                        : undefined
                  }}
                  passHref
                >
                  <a
                    onClick={handleClickInterceptor(navData.title, navData.logName, navData.href)}
                    aria-hidden="true"
                  >
                    <Icon
                      name={isActive ? navData.activeIcon : navData.defaultIcon}
                      width={24}
                      height={22}
                      color={isActive ? common.grey['20'] : common.grey['90']}
                    />
                    <Typography variant="small2" customStyle={{ marginTop: 6 }}>
                      {navData.title}
                    </Typography>
                  </a>
                </Link>
              </ListItem>
            );
          })}
        </List>
      </StyledBottomNavigation>
      <Tooltip
        open={openTooltip}
        round="8"
        message={
          <Flexbox direction="vertical" gap={11}>
            <PriceDownTooltipTitle>
              <div />
              <Typography
                variant="small1"
                weight="bold"
                customStyle={{
                  textAlign: 'center',
                  color: common.grey['60']
                }}
              >
                🔔 가격 내림
              </Typography>
              <Flexbox customStyle={{ justifyContent: 'flex-end' }}>
                <Icon name="CloseOutlined" onClick={handleClose} color={common.grey['60']} />
              </Flexbox>
            </PriceDownTooltipTitle>
            {confirmPriceNotiProducts.length > 1 && (
              <Typography
                weight="bold"
                variant="body1"
                customStyle={{
                  display: 'box',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: common.white
                }}
              >
                찜한 매물 가격이 내려갔어요. 바로 확인해보세요!
              </Typography>
            )}
            {confirmPriceNotiProducts.length === 1 && (
              <Typography
                weight="bold"
                variant="body1"
                customStyle={{
                  display: 'box',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: common.white
                }}
              >
                {`찜한 "${getPriceNotiProductTitle(
                  confirmPriceNotiProducts[0].title
                )}" 가격이 ${commaNumber(
                  getTenThousandUnitPrice(
                    (confirmPriceNotiProducts[0].priceBefore as number) -
                      confirmPriceNotiProducts[0].price
                  )
                )}만원 내려갔어요!`}
              </Typography>
            )}
          </Flexbox>
        }
        triangleLeft={triangleLeft}
        customStyle={customStyle}
      />
      <AppDownloadDialog
        open={isAppDownModal}
        onClose={() => setIsAppDownModal(false)}
        att={logAtt}
        name="FOOTER"
      />
    </>
  );
}

export default BottomNavigation;
