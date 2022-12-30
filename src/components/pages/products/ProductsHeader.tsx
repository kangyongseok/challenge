import { useCallback, useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { Header, SearchBar } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { SEARCH_BAR_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParamsByQuery } from '@utils/products';

import type { ProductsVariant } from '@typings/products';
import {
  productsStatusTriggeredStateFamily,
  searchOptionsStateFamily
} from '@recoil/productsFilter';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

interface ProductsHeaderProps {
  variant: ProductsVariant;
}

function ProductsHeader({ variant }: ProductsHeaderProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const { keyword }: { keyword?: string } = router.query;
  const { parentIds = [] } = convertSearchParamsByQuery(router.query);
  const atomParam = router.asPath.split('?')[0];
  const {
    searchOptions: { parentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));
  const { triggered: productsStatusTriggered } = useRecoilValue(
    productsStatusTriggeredStateFamily(atomParam)
  );

  const [title, setTitle] = useState('');

  const triggered = useReverseScrollTrigger();

  const handleClickBack = useCallback(() => {
    logEvent(attrKeys.products.clickBack, {
      name: attrProperty.name.productList
    });
    router.back();
  }, [router]);

  const handleClickSearchIcon = useCallback(() => {
    logEvent(attrKeys.products.CLICK_SEARCHMODAL, {
      name: attrProperty.productName.PRODUCT_LIST,
      att: 'HEADER'
    });
    router.push({
      pathname: '/search',
      query: { keyword }
    });
  }, [keyword, router]);

  useEffect(() => {
    const newKeyword = (keyword || '').split('-').join(' X ');

    if (variant === 'categories') {
      setTitle(newKeyword.replace(/\(P\)/g, ''));
    } else if (variant === 'brands') {
      const parentCategory = parentCategories.find(({ id }) =>
        parentIds.map((parentId) => Number(parentId)).includes(id)
      );

      if (parentCategory) {
        setTitle(`${newKeyword} | ${parentCategory.name.replace(/\(P\)/g, '')}`);
      } else {
        setTitle(newKeyword);
      }
    } else if (variant === 'camel') {
      const parentCategory = parentCategories.find(({ id }) =>
        parentIds.map((parentId) => Number(parentId)).includes(id)
      );

      if (parentCategory) {
        setTitle(`카멜 인증 판매자 | ${parentCategory.name.replace(/\(P\)/g, '')}`);
      } else {
        setTitle('카멜 인증 판매자');
      }
    }
  }, [variant, keyword, parentIds, parentCategories]);

  if (variant === 'search') {
    return (
      <Box
        customStyle={{
          minHeight: SEARCH_BAR_HEIGHT,
          position: 'relative'
        }}
      >
        <SearchBar
          readOnly
          variant="innerOutlined"
          fullWidth
          isFixed
          placeholder="검색어를 입력해 주세요."
          value={(keyword || '').replace(/-/g, ' ')}
          startIcon={<Icon name="ArrowLeftOutlined" onClick={handleClickBack} />}
          endAdornment={
            <Icon
              name="DeleteCircleFilled"
              width={20}
              height={20}
              customStyle={{ color: common.ui80, minWidth: 20 }}
              onClick={handleClickSearchIcon}
            />
          }
          onClick={() => router.push({ pathname: '/search', query: { keyword } })}
          customStyle={{
            borderBottom:
              !triggered || (triggered && productsStatusTriggered)
                ? `1px solid ${common.line01}`
                : undefined
          }}
        />
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
      <Header isFixed hideLine={triggered || !productsStatusTriggered}>
        <Flexbox gap={6} alignment="center">
          {variant === 'camel' && <Icon name="SafeFilled" color="primary" />}
          <Typography
            component="h1"
            variant="h3"
            weight="bold"
            customStyle={{ textAlign: 'center', whiteSpace: 'nowrap' }}
          >
            {title}
          </Typography>
        </Flexbox>
      </Header>
    </Box>
  );
}

export default ProductsHeader;
