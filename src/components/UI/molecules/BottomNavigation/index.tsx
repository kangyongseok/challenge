import { useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type * as SvgIcons from 'mrcamel-ui/dist/assets/icons';
import { Box, Icon, Typography, useTheme } from 'mrcamel-ui';

import { AppDownloadDialog } from '@components/UI/organisms';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { getTenThousandUnitPrice } from '@utils/formats';

import {
  productsKeywordAutoSaveTriggerState,
  productsKeywordDialogState,
  productsKeywordInduceTriggerState
} from '@recoil/productsKeyword';
import { legitCompleteGridParamsState } from '@recoil/legitCompleteGrid';
import { homeSelectedTabStateFamily } from '@recoil/home';
import categoryState from '@recoil/category';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

import {
  List,
  ListItem,
  NewBadge,
  NewLabel,
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
  const resetLegitCompleteGridParamsState = useResetRecoilState(legitCompleteGridParamsState);
  const { dialog } = useRecoilValue(productsKeywordInduceTriggerState);
  const setProductsKeywordDialogState = useSetRecoilState(productsKeywordDialogState);
  const productsKeywordAutoSaveTrigger = useRecoilValue(productsKeywordAutoSaveTriggerState);

  const { data: { priceNotiProducts = [] } = {} } = useQueryUserInfo();

  const triggered = useReverseScrollTrigger(!disableHideOnScroll);

  const [isAppDownModal, setIsAppDownModal] = useState(false);
  const [logAtt] = useState('');
  const wishNavRef = useRef<HTMLLIElement | null>(null);

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
        resetLegitCompleteGridParamsState();

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
                {navData.href === '/legit' && (
                  <NewLabel variant="contained" text="NEW" size="xsmall" />
                )}
                <Link
                  href={{
                    pathname: navData.href,
                    query:
                      navData.href === '/wishes' && confirmPriceNotiProducts.length
                        ? { scrollToProductId: confirmPriceNotiProducts[0].id }
                        : undefined
                  }}
                  as={{
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
                    <Box customStyle={{ position: 'relative' }}>
                      <Icon
                        name={isActive ? navData.activeIcon : navData.defaultIcon}
                        color={isActive ? common.grey['20'] : common.grey['80']}
                      />
                      <NewBadge
                        brandColor="red"
                        position="absolute"
                        open={false}
                        width={10}
                        height={10}
                      />
                    </Box>
                    <Typography
                      variant="small2"
                      weight={isActive ? 'bold' : 'regular'}
                      customStyle={{
                        position: 'relative',
                        marginTop: 4,
                        color: isActive ? common.grey['20'] : common.grey['80']
                      }}
                    >
                      {navData.title}
                    </Typography>
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
    </>
  );
}

export default BottomNavigation;
