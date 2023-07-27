import { useEffect, useState } from 'react';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Input, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { IOS_SAFE_AREA_TOP, SEARCH_BAR_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParamsByQuery } from '@utils/products';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import type { ProductsVariant } from '@typings/products';
import { searchAutoFocusState, searchValueState } from '@recoil/search';
import { searchOptionsStateFamily } from '@recoil/productsFilter';

interface ProductsHeaderProps {
  variant: ProductsVariant;
}

function ProductsHeader({ variant }: ProductsHeaderProps) {
  const router = useRouter();

  const {
    theme: {
      typography: { h3 },
      palette: { common },
      zIndex
    }
  } = useTheme();

  const { keyword, title, notice }: { keyword?: string; title?: string; notice?: string } =
    router.query;
  const { parentIds = [] } = convertSearchParamsByQuery(router.query);
  const atomParam = router.asPath.split('?')[0];

  const {
    searchOptions: { parentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));

  const resetSearchValueState = useResetRecoilState(searchValueState);
  const resetSearchAutoFocusState = useResetRecoilState(searchAutoFocusState);

  const [newTitle, setNewTitle] = useState('');

  const handleClick = () => {
    resetSearchAutoFocusState();

    router.push('/search');
  };

  const handleClickBack = () => {
    logEvent(attrKeys.products.clickBack, {
      name: attrProperty.name.productList
    });
    resetSearchValueState();
    router.back();
  };

  const handleClickSearchIcon = () => {
    logEvent(attrKeys.products.CLICK_SEARCHMODAL, {
      name: attrProperty.productName.PRODUCT_LIST,
      att: 'HEADER'
    });
    resetSearchValueState();
    router.push('/search');
  };

  useEffect(() => {
    const newKeyword = (keyword || '').split('-').join(' X ');

    if (variant === 'categories') {
      setNewTitle(newKeyword.replace(/\(P\)/g, ''));
    } else if (variant === 'brands') {
      const parentCategory = parentCategories.find(({ id }) =>
        parentIds.map((parentId) => Number(parentId)).includes(id)
      );

      if (parentCategory) {
        setNewTitle(`${newKeyword} | ${parentCategory.name.replace(/\(P\)/g, '')}`);
      } else {
        setNewTitle(newKeyword);
      }
    } else if (variant === 'camel') {
      const parentCategory = parentCategories.find(({ id }) =>
        parentIds.map((parentId) => Number(parentId)).includes(id)
      );

      if (parentCategory) {
        setNewTitle(`카멜인증 | ${parentCategory.name.replace(/\(P\)/g, '')}`);
      } else {
        setNewTitle('카멜인증');
      }
    }
  }, [variant, keyword, parentIds, parentCategories]);

  if (variant === 'search') {
    return (
      <Box
        customStyle={{
          minHeight: `calc(${
            isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'
          } + ${SEARCH_BAR_HEIGHT}px)`
        }}
      >
        <Flexbox
          alignment="center"
          gap={12}
          customStyle={{
            position: 'fixed',
            left: 0,
            right: 0,
            padding: '6px 16px',
            backgroundColor: common.uiWhite,
            zIndex: zIndex.header
          }}
        >
          <Icon name="ArrowLeftOutlined" onClick={handleClickBack} />
          <Input
            type="search"
            variant="solid"
            size="large"
            fullWidth
            placeholder="검색어를 입력해 주세요."
            readOnly
            value={(keyword || '').replace(/-/g, ' ')}
            onClick={handleClick}
            endAdornment={
              (keyword || '').replace(/-/g, ' ') ? (
                <Icon
                  name="DeleteCircleFilled"
                  width={20}
                  height={20}
                  color="ui80"
                  onClick={handleClickSearchIcon}
                />
              ) : undefined
            }
            customStyle={{
              gap: 8,
              borderColor: 'transparent',
              '& input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button, input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration':
                {
                  display: 'none'
                },
              '& input': {
                fontSize: h3.size,
                letterSpacing: h3.letterSpacing,
                lineHeight: h3.lineHeight,
                fontWeight: h3.weight.medium
              },
              '& input::placeholder': {
                fontWeight: h3.weight.regular,
                color: common.ui60
              }
            }}
          />
        </Flexbox>
      </Box>
    );
  }

  if (variant === 'camel') {
    return (
      <Box
        customStyle={{
          minHeight: SEARCH_BAR_HEIGHT,
          position: 'relative'
        }}
      >
        <Header isFixed>
          <Flexbox gap={6} alignment="center">
            {!notice && <Icon name="ShieldFilled" width={20} height={20} />}
            <Typography
              component="h1"
              variant="h3"
              weight="bold"
              textAlign="center"
              customStyle={{ whiteSpace: 'nowrap' }}
            >
              {notice || newTitle}
            </Typography>
          </Flexbox>
        </Header>
      </Box>
    );
  }

  return (
    <Box
      customStyle={{
        minHeight: SEARCH_BAR_HEIGHT,
        position: 'relative'
      }}
    >
      <Header isFixed>
        <Flexbox gap={6} alignment="center">
          <Typography
            component="h1"
            variant="h3"
            weight="bold"
            textAlign="center"
            customStyle={{ whiteSpace: 'nowrap' }}
          >
            {title || newTitle}
          </Typography>
        </Flexbox>
      </Header>
    </Box>
  );
}

export default ProductsHeader;
