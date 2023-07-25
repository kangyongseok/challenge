import type { MouseEvent, PropsWithChildren, ReactElement } from 'react';
import { useCallback } from 'react';

import { useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { searchAutoFocusState } from '@recoil/search';

import { IconBox, StyledHeader, Title, Wrapper } from './Header.styles';

interface HeaderProps {
  isFixed?: boolean;
  isTransparent?: boolean;
  isDark?: boolean;
  showLeft?: boolean;
  hideTitle?: boolean;
  showRight?: boolean;
  hideHeart?: boolean;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  onClickLeft?: (e?: MouseEvent<HTMLDivElement>) => void;
  onClickTitle?: (e?: MouseEvent) => void;
  onClickRight?: (e?: MouseEvent<HTMLDivElement>) => void;
  customHeader?: JSX.Element;
  leftIconCustomStyle?: CustomStyle;
  titleCustomStyle?: CustomStyle;
  rightIconCustomStyle?: CustomStyle;
  hideLine?: boolean;
  customStyle?: CustomStyle;
  wrapperCustomStyle?: CustomStyle;
  customHeight?: number;
}

function Header({
  children,
  isFixed = true,
  isTransparent = false,
  showLeft = true,
  hideTitle = false,
  showRight = true,
  hideHeart = false,
  leftIcon,
  rightIcon,
  onClickLeft,
  onClickTitle,
  onClickRight,
  leftIconCustomStyle,
  titleCustomStyle,
  rightIconCustomStyle,
  hideLine = true,
  customStyle,
  wrapperCustomStyle,
  customHeight,
  customHeader
}: PropsWithChildren<HeaderProps>) {
  const router = useRouter();
  const { isCrm } = router.query;
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const resetSearchAutoFocusState = useResetRecoilState(searchAutoFocusState);

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
    router.push('/');
  };

  const handleClickBack = () => {
    const splitPathNames = router.pathname.split('/');
    const lastPathName = splitPathNames[splitPathNames.length - 1] || '';

    const callBack = () => {
      const lastPageUrl = SessionStorage.get(sessionStorageKeys.lastPageUrl);

      if (lastPageUrl) {
        router.back();
      } else {
        router.push('/');
      }
    };

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

    handleLogEvent(attrKeys.header.CLICK_BACK);
    callBack();
  };

  const handleClickSearch = () => {
    resetSearchAutoFocusState();

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
  };

  return (
    <StyledHeader
      minHeight={customHeight || HEADER_HEIGHT}
      isTransparent={isTransparent}
      isFixed={isFixed}
      css={{
        backgroundColor: (customStyle || {}).backgroundColor,
        ...customStyle
      }}
    >
      {customHeader || (
        <Wrapper isFixed={isFixed} css={wrapperCustomStyle}>
          <Flexbox
            alignment="center"
            gap={8}
            customStyle={{
              width: '100%',
              minHeight: customHeight || HEADER_HEIGHT,
              backgroundColor: 'inherit',
              borderBottom: !hideLine ? `1px solid ${common.line01}` : undefined
            }}
          >
            <Flexbox customStyle={showLeft ? undefined : { paddingLeft: 8 }}>
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
              <IconBox show={false} css={{ minWidth: showLeft ? 32 : 40 }} />
            </Flexbox>
            <Title show={!hideTitle} customHeight={customHeight} css={titleCustomStyle}>
              {children ||
                (!hideTitle && (
                  <Icon
                    name="LogoText_96_20"
                    onClick={onClickTitle || handleClickLogo}
                    customStyle={{ height: 16, cursor: 'pointer' }}
                  />
                ))}
            </Title>
            <Flexbox alignment="center" customStyle={{ paddingRight: 8 }}>
              {!rightIcon && (
                <IconBox
                  show={showRight}
                  onClick={() => router.push('/wishes')}
                  css={{ padding: showRight ? '16px 8px' : 0 }}
                >
                  {showRight && (
                    <Icon
                      name="HeartOutlined"
                      customStyle={{
                        visibility: hideHeart ? 'hidden' : 'visible',
                        opacity: Number(!hideHeart)
                      }}
                    />
                  )}
                </IconBox>
              )}
              {rightIcon || (
                <IconBox
                  show={showRight}
                  css={{ padding: showRight ? '16px 8px' : 0, ...rightIconCustomStyle }}
                  onClick={onClickRight || handleClickSearch}
                >
                  {showRight && <Icon name="SearchOutlined" />}
                </IconBox>
              )}
            </Flexbox>
          </Flexbox>
        </Wrapper>
      )}
    </StyledHeader>
  );
}

export default Header;
