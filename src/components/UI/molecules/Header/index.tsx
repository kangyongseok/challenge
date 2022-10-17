import type { MouseEvent, PropsWithChildren, ReactElement } from 'react';
import { useCallback } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  productsKeywordDialogState,
  productsKeywordInduceTriggerState
} from '@recoil/productsKeyword';
import { homeSelectedTabStateFamily } from '@recoil/home';
import { showAppDownloadBannerState } from '@recoil/common';

import { IconBox, StyledHeader, Title, Wrapper } from './Header.styles';

interface HeaderProps {
  isFixed?: boolean;
  isTransparent?: boolean;
  isDark?: boolean;
  showLeft?: boolean;
  hideTitle?: boolean;
  showRight?: boolean;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  onClickLeft?: (e?: MouseEvent<HTMLDivElement>) => void;
  onClickTitle?: (e?: MouseEvent) => void;
  onClickRight?: (e?: MouseEvent<HTMLDivElement>) => void;
  disableProductsKeywordClickInterceptor?: boolean;
  customHeader?: JSX.Element;
  disableAppDownloadBannerVariableTop?: boolean;
  leftIconCustomStyle?: CustomStyle;
  titleCustomStyle?: CustomStyle;
  rightIconCustomStyle?: CustomStyle;
  customStyle?: CustomStyle;
  customHeight?: number;
}

function Header({
  children,
  isFixed = true,
  isTransparent = false,
  showLeft = true,
  hideTitle = false,
  showRight = true,
  leftIcon,
  rightIcon,
  onClickLeft,
  onClickTitle,
  onClickRight,
  disableProductsKeywordClickInterceptor = true,
  disableAppDownloadBannerVariableTop = false,
  leftIconCustomStyle,
  titleCustomStyle,
  rightIconCustomStyle,
  customStyle,
  customHeight,
  customHeader
}: PropsWithChildren<HeaderProps>) {
  const router = useRouter();
  const { isCrm } = router.query;
  const { dialog } = useRecoilValue(productsKeywordInduceTriggerState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setProductsKeywordDialogState = useSetRecoilState(productsKeywordDialogState);
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));
  const resetRecentSearch = useResetRecoilState(homeSelectedTabStateFamily('recentSearch'));

  const handleLogEvent = useCallback(
    (eventName: string) => {
      let name: string;

      switch (router.pathname) {
        case '/mypage': {
          name = attrProperty.productName.MY;
          break;
        }
        case '/brand': {
          name = attrProperty.productName.BRAND;
          break;
        }
        case '/products/[id]': {
          name = attrProperty.productName.PRODUCT_DETAIL;
          break;
        }
        case '/announces/[id]': {
          name = attrProperty.productName.ANNOUNCE_DETAIL;
          break;
        }
        case '/wishes': {
          name = attrProperty.productName.WISH_LIST;
          break;
        }
        case '/notices': {
          name = attrProperty.productName.NOTICES;
          break;
        }
        case '/category': {
          name = attrProperty.productName.CATEGORY;
          break;
        }
        case '/products': {
          name = attrProperty.productName.PRODUCT_LIST;
          break;
        }
        case '/products/crm': {
          name = attrProperty.productName.PRODUCT_LIST;
          break;
        }
        case '/products/search/[keyword]': {
          name = attrProperty.productName.PRODUCT_LIST;
          break;
        }
        case '/products/categories/[keyword]': {
          name = attrProperty.productName.PRODUCT_LIST;
          break;
        }
        case '/products/brands/[keyword]': {
          name = attrProperty.productName.PRODUCT_LIST;
          break;
        }
        case '/products/camel': {
          name = attrProperty.productName.PRODUCT_LIST;
          break;
        }
        default:
          name = '';
      }

      logEvent(eventName, { name });
    },
    [router.pathname]
  );

  const handleClickLogo = () => {
    handleLogEvent(attrKeys.header.CLICK_LOGO);
    resetProductKeyword();
    resetRecentSearch();
    router.push('/');
  };

  const handleClickBack = (e: MouseEvent<HTMLDivElement>) => {
    const splitPathNames = router.pathname.split('/');
    const lastPathName = splitPathNames[splitPathNames.length - 1] || '';

    const callBack = () => (window.history.length > 2 ? router.back() : router.push('/'));

    if (router.query.success) {
      router.replace('/user/shop');
      return;
    }
    if (lastPathName === 'personalInput') {
      logEvent(attrKeys.header.CLICK_CLOSE, {
        name: attrProperty.productName.INFO
      });
      callBack();
      return;
    }
    if (lastPathName === 'budgetInput') {
      logEvent(attrKeys.header.CLICK_CLOSE, {
        name: attrProperty.productName.BUDGET
      });
      callBack();
      return;
    }
    if (lastPathName === 'addressInput') {
      logEvent(attrKeys.header.CLICK_CLOSE, {
        name: attrProperty.productName.ADDRESS
      });
      callBack();
      return;
    }

    if (router.pathname.split('/')[1] === 'products') {
      logEvent(attrKeys.header.CLICK_BACK, {
        name:
          router.pathname === '/products/[id]'
            ? attrProperty.productName.PRODUCT_DETAIL
            : attrProperty.productName.PRODUCT_LIST
      });
      callBack();
      return;
    }

    if (dialog && !disableProductsKeywordClickInterceptor) {
      e.preventDefault();
      setProductsKeywordDialogState({ open: true, pathname: '' });
    } else {
      handleLogEvent(attrKeys.header.CLICK_BACK);
      callBack();
    }
  };

  const handleClickSearch = (e: MouseEvent<HTMLDivElement>) => {
    if (dialog && !disableProductsKeywordClickInterceptor) {
      e.preventDefault();
      setProductsKeywordDialogState({ open: true, pathname: '/search' });
    } else {
      if (router.pathname.split('/')[1] === 'wishes') {
        logEvent(attrKeys.header.CLICK_SEARCHMODAL, {
          name: attrProperty.productName.WISH_LIST,
          att: 'HEADER'
        });
        router.push('/search');
        return;
      }
      if (router.pathname.split('/')[1] === 'notices') {
        logEvent(attrKeys.header.CLICK_SEARCHMODAL, {
          name: attrProperty.productName.NOTI_LIST,
          att: 'HEADER'
        });
        router.push('/search');
        return;
      }
      if (router.pathname.split('/')[1] === 'products') {
        logEvent(attrKeys.header.CLICK_SEARCHMODAL, {
          name:
            router.pathname === '/products/[id]'
              ? attrProperty.productName.PRODUCT_DETAIL
              : attrProperty.productName.PRODUCT_LIST,
          att: 'HEADER'
        });
      } else {
        handleLogEvent(attrKeys.header.CLICK_SCOPE);
      }

      router.push('/search');
    }
  };
  // const handleClickWish = () => {
  //   handleLogEvent(attrKeys.header.CLICK_TAB_WISH);
  //   router.push('/wishes');
  // };

  if (customHeader) {
    return (
      <StyledHeader minHeight={customHeight || HEADER_HEIGHT} isTransparent={isTransparent}>
        {customHeader}
      </StyledHeader>
    );
  }

  return (
    <StyledHeader
      minHeight={customHeight || HEADER_HEIGHT}
      isTransparent={isTransparent}
      css={{
        backgroundColor: (customStyle || {}).backgroundColor
      }}
    >
      {customHeader || (
        <Wrapper
          isFixed={isFixed}
          showAppDownloadBanner={showAppDownloadBanner && !disableAppDownloadBannerVariableTop}
          css={customStyle}
        >
          <Flexbox
            alignment="center"
            customStyle={{
              width: '100%',
              minHeight: customHeight || 56,
              backgroundColor: 'inherit'
            }}
          >
            {isCrm ? (
              <Typography variant="small2" weight="medium" onClick={onClickLeft}>
                ◀︎ 모델 전체보기
              </Typography>
            ) : (
              leftIcon || (
                <IconBox
                  show={showLeft}
                  css={leftIconCustomStyle}
                  onClick={onClickLeft || handleClickBack}
                >
                  {showLeft && <Icon name="ArrowLeftOutlined" />}
                </IconBox>
              )
            )}
            <Title show={!hideTitle} customHeight={customHeight} css={titleCustomStyle}>
              {children ||
                (!hideTitle && (
                  <Icon
                    name="LogoText_96_20"
                    onClick={onClickTitle || handleClickLogo}
                    customStyle={{ cursor: 'pointer' }}
                  />
                ))}
            </Title>
            {rightIcon || (
              <IconBox
                show={showRight}
                css={rightIconCustomStyle}
                onClick={onClickRight || handleClickSearch}
              >
                {showRight && <Icon name="SearchOutlined" />}
              </IconBox>
            )}
          </Flexbox>
        </Wrapper>
      )}
    </StyledHeader>
  );
}

export default Header;
