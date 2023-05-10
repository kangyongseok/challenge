import { useCallback, useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';

import { Header, SearchBar } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { IOS_SAFE_AREA_TOP, SEARCH_BAR_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParamsByQuery } from '@utils/products';
import { isExtendedLayoutIOSVersion } from '@utils/common';

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
  const { keyword, title }: { keyword?: string; title?: string } = router.query;
  const { parentIds = [] } = convertSearchParamsByQuery(router.query);
  const atomParam = router.asPath.split('?')[0];
  const {
    searchOptions: { parentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));
  const { triggered: productsStatusTriggered } = useRecoilValue(
    productsStatusTriggeredStateFamily(atomParam)
  );

  const [newTitle, setNewTitle] = useState('');

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
          } + ${SEARCH_BAR_HEIGHT}px)`,
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
              color="ui80"
              customStyle={{ minWidth: 20 }}
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
          {variant === 'camel' && !title && <Icon name="ShieldFilled" width={20} height={20} />}
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
