import { MouseEvent, PropsWithChildren } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Typography } from 'mrcamel-ui';

import { TouchIcon } from '@components/UI/atoms';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  productsKeywordDialogState,
  productsKeywordInduceTriggerState
} from '@recoil/productsKeyword';
import { showAppDownloadBannerState } from '@recoil/common';

import { StyledHeader, VirtualIcon, Wrapper } from './Header.styles';

interface HeaderProps {
  type?: 'isBack' | 'isSearch' | 'onlyBack' | 'isCrm';
  isFixed?: boolean;
  closeIcon?: 'CloseOutlined';
  onClickCrm?: () => void;
  onClickBack?: () => void;
  disableProductsKeywordClickInterceptor?: boolean;
  disableAppDownloadBannerVariableTop?: boolean;
}

function Header({
  children,
  type,
  isFixed,
  closeIcon,
  onClickCrm,
  onClickBack,
  disableProductsKeywordClickInterceptor = true,
  disableAppDownloadBannerVariableTop = false
}: PropsWithChildren<HeaderProps>) {
  const router = useRouter();
  const { dialog } = useRecoilValue(productsKeywordInduceTriggerState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const setProductsKeywordDialogState = useSetRecoilState(productsKeywordDialogState);

  const parserEventParameterName = () => {
    switch (router.pathname) {
      case '/mypage':
        return 'MY';
      case '/brands':
        return 'BRANDS';
      case '/products/[id]':
        return 'PRODUCT_DETAIL';
      case '/announces/[id]':
        return 'ANNOUNCE_DETAIL';
      case '/wishes':
        return 'WISH_LIST';
      case '/notices':
        return 'NOTICES';
      case '/category':
        return 'CATEGORY';
      case '/products':
        return attrProperty.productName.PRODUCT_LIST;
      case '/products/crm':
        return attrProperty.productName.PRODUCT_LIST;
      case '/products/search/[keyword]':
        return attrProperty.productName.PRODUCT_LIST;
      case '/products/categories/[keyword]':
        return attrProperty.productName.PRODUCT_LIST;
      case '/products/brands/[keyword]':
        return attrProperty.productName.PRODUCT_LIST;
      case '/products/camel':
        return attrProperty.productName.PRODUCT_LIST;
      default:
        return '';
    }
  };

  const handleClickLogo = () => {
    logEvent(attrKeys.header.CLICK_LOGO, {
      name: parserEventParameterName()
    });

    router.push('/');
  };

  const handleClickBack = (e: MouseEvent) => {
    const splitPathNames = router.pathname.split('/');
    const lastPathName = splitPathNames[splitPathNames.length - 1] || '';
    if (lastPathName === 'personalInput') {
      logEvent(attrKeys.header.CLICK_CLOSE, {
        name: attrProperty.productName.INFO
      });
      router.back();
      return;
    }
    if (lastPathName === 'budgetInput') {
      logEvent(attrKeys.header.CLICK_CLOSE, {
        name: attrProperty.productName.BUDGET
      });
      router.back();
      return;
    }
    if (lastPathName === 'addressInput') {
      logEvent(attrKeys.header.CLICK_CLOSE, {
        name: attrProperty.productName.ADDRESS
      });
      router.back();
      return;
    }

    if (router.pathname.split('/')[1] === 'products') {
      logEvent(attrKeys.header.CLICK_BACK, {
        name:
          router.pathname === '/products/[id]'
            ? attrProperty.productName.PRODUCT_DETAIL
            : attrProperty.productName.PRODUCT_LIST
      });
      router.back();
      return;
    }

    if (dialog && !disableProductsKeywordClickInterceptor) {
      e.preventDefault();
      setProductsKeywordDialogState({ open: true, pathname: '' });
    } else {
      logEvent(attrKeys.header.CLICK_BACK, {
        name: parserEventParameterName()
      });

      router.back();
    }
  };

  const handleSearch = (e: MouseEvent) => {
    if (dialog && !disableProductsKeywordClickInterceptor) {
      e.preventDefault();
      setProductsKeywordDialogState({ open: true, pathname: '/search' });
    } else {
      if (closeIcon && router.pathname.split('/')[1] === 'announces') {
        logEvent(attrKeys.header.CLICK_CLOSE, {
          name: attrProperty.productName.ANNOUNCE_DETAIL
        });
        router.back();
        return;
      }
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
        logEvent(attrKeys.header.CLICK_SCOPE, {
          name: parserEventParameterName()
        });
      }

      router.push('/search');
    }
  };

  return (
    <StyledHeader>
      <Wrapper
        isFixed={isFixed}
        showAppDownloadBanner={showAppDownloadBanner && !disableAppDownloadBannerVariableTop}
      >
        {type === 'isCrm' ? (
          <Typography variant="small2" weight="medium" onClick={onClickCrm}>
            ◀︎ 모델 전체보기
          </Typography>
        ) : (
          <TouchIcon
            onClick={(e) => (onClickBack ? onClickBack() : handleClickBack(e))}
            name="ArrowLeftOutlined"
            wrapCustomStyle={{ display: type === 'isSearch' ? 'none' : 'flex', cursor: 'pointer' }}
            size="medium"
            direction="left"
          />
        )}
        <VirtualIcon isType={type === 'isSearch'} />
        {type !== 'onlyBack' && (
          <>
            {children || (
              <TouchIcon
                name="LogoText_96_20"
                customStyle={{ margin: '0 auto' }}
                onClick={handleClickLogo}
                wrapCustomStyle={{ width: '100%', height: '100%' }}
              />
            )}
            <TouchIcon
              onClick={handleSearch}
              name={closeIcon || 'SearchOutlined'}
              wrapCustomStyle={type === 'isBack' ? { display: 'none' } : { display: 'flex' }}
              size="medium"
              direction="right"
            />
            <VirtualIcon isType={type === 'isBack'} />
          </>
        )}
      </Wrapper>
    </StyledHeader>
  );
}

export default Header;
