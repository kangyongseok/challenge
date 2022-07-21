import { useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';

import { Header, SearchBar } from '@components/UI/molecules';

import { logEvent } from '@library/amplitude';

import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParamsByQuery } from '@utils/products';

import type { ProductsVariant } from '@typings/products';
import { productsKeywordAutoSaveTriggerState } from '@recoil/productsKeyword';
import { searchOptionsStateFamily } from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';

interface ProductsHeaderProps {
  variant: ProductsVariant;
}

function ProductsHeader({ variant }: ProductsHeaderProps) {
  const router = useRouter();
  const { keyword }: { keyword?: string } = router.query;
  const { parentIds = [] } = convertSearchParamsByQuery(router.query);
  const atomParam = router.asPath.split('?')[0];
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const productsKeywordAutoSaveTrigger = useRecoilValue(productsKeywordAutoSaveTriggerState);

  const {
    theme: { zIndex }
  } = useTheme();

  const {
    searchOptions: { parentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));

  const [title, setTitle] = useState('');

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
      <Box customStyle={{ height: 58 }}>
        <SearchBar
          fullWidth
          variant="standard"
          startIcon={
            <Icon
              name="ArrowLeftOutlined"
              onClick={() => {
                logEvent(attrKeys.products.CLICK_BACK, {
                  name: attrProperty.productName.PRODUCT_LIST
                });
                router.back();
              }}
              customStyle={{ cursor: 'pointer' }}
            />
          }
          endIcon={
            <Icon
              name="SearchOutlined"
              onClick={() => {
                logEvent(attrKeys.products.CLICK_SEARCHMODAL, {
                  name: attrProperty.productName.PRODUCT_LIST,
                  att: 'HEADER'
                });
                router.push({
                  pathname: '/search',
                  query: {
                    keyword
                  }
                });
              }}
              customStyle={{ cursor: 'pointer' }}
            />
          }
          onClick={() =>
            router.push({
              pathname: '/search',
              query: {
                keyword
              }
            })
          }
          readOnly
          value={keyword || ''}
          placeholder="검색어를 입력해 주세요."
          customStyle={{
            position: 'fixed',
            top: showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0,
            width: '100%',
            padding: 0,
            zIndex: zIndex.header,
            cursor: 'pointer'
          }}
        />
      </Box>
    );
  }

  return (
    <Header
      isFixed
      // 검색한 목록 자동으로 저장한 경우 검색 목록 저장 유도 팝업 노출하지 않음
      disableProductsKeywordClickInterceptor={
        !(
          ['brands', 'categories', 'search'].includes(variant) && !productsKeywordAutoSaveTrigger
        ) || false
      }
    >
      <Flexbox gap={6} justifyContent="center">
        {variant === 'camel' && (
          <Icon name="SafeFilled" color="primary" customStyle={{ minWidth: 'fit-content' }} />
        )}
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{ textAlign: 'center', whiteSpace: 'nowrap' }}
        >
          {title}
        </Typography>
      </Flexbox>
    </Header>
  );
}

export default ProductsHeader;
