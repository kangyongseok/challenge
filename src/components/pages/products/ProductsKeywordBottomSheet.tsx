import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import {
  Alert,
  BottomSheet,
  Box,
  Button,
  Flexbox,
  Icon,
  Label,
  Typography,
  useTheme
} from 'mrcamel-ui';

import type { ProductKeywordSourceType } from '@dto/user';

import { logEvent } from '@library/amplitude';

import { postProductKeyword } from '@api/user';

import queryKeys from '@constants/queryKeys';
import {
  filterCodeIds,
  idFilterOptions,
  mapFilterOptions,
  orderFilterOptions
} from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParamsByQuery } from '@utils/products';

import type { ProductsVariant } from '@typings/products';
import { productsKeywordInduceTriggerState, productsKeywordState } from '@recoil/productsKeyword';
import {
  filterOperationInfoSelector,
  searchOptionsStateFamily,
  searchParamsStateFamily
} from '@recoil/productsFilter';
import { homeSelectedTabStateFamily } from '@recoil/home';
import { toastState } from '@recoil/common';

const { category, size, price, brand, platform, line, season, color, material } = filterCodeIds;

const filterCodeIdsByPriority = [
  category,
  size,
  price,
  brand,
  platform,
  line,
  season,
  color,
  material
];

interface ProductsKeywordBottomSheetProps {
  variant: ProductsVariant;
}

function ProductsKeywordBottomSheet({ variant }: ProductsKeywordBottomSheetProps) {
  const router = useRouter();
  const { keyword }: { keyword?: string } = router.query;
  const { parentIds = [], subParentIds = [] } = convertSearchParamsByQuery(router.query);
  const atomParam = router.asPath.split('?')[0];

  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [open, setProductsKeywordState] = useRecoilState(productsKeywordState);
  const {
    searchOptions: { parentCategories = [], subParentCategories = [] }
  } = useRecoilValue(searchOptionsStateFamily(`base-${atomParam}`));
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const setToastState = useSetRecoilState(toastState);
  const setProductsKeywordInduceTriggerState = useSetRecoilState(productsKeywordInduceTriggerState);
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const queryClient = useQueryClient();

  const { mutate } = useMutation(postProductKeyword, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      setProductsKeywordState(false);
      setToastState({ type: 'productsKeyword', status: 'saved' });
      setProductsKeywordInduceTriggerState((prevState) => ({
        ...prevState,
        alert: false
      }));
      window.scrollTo(0, 0);
      resetProductKeyword();
      queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
    },
    onError: () => {
      setToastState({ type: 'productsKeyword', status: 'limited' });
    }
  });

  const { idFilterIds = [], distance: selectedDistance } = searchParams;

  const [saveKeyword, setSaveKeyword] = useState('');
  const [sourceType, setSourceType] = useState<ProductKeywordSourceType>(0);

  const handleClick = () => {
    const productSearch = { ...searchParams, order: orderFilterOptions[1].order };

    logEvent(attrKeys.products.CLICK_MYLIST_MODAL, {
      name: PRODUCT_NAME.PRODUCT_LIST,
      att: 'SAVE'
    });
    logEvent(attrKeys.products.loadMyListSave, { name: attrProperty.productName.MANUAL });

    mutate({
      productSearch,
      sourceType
    });
  };

  const handleClose = () => {
    logEvent(attrKeys.products.CLICK_MYLIST_MODAL, {
      name: PRODUCT_NAME.PRODUCT_LIST,
      att: 'CLOSE'
    });
    setProductsKeywordState(false);
  };

  useEffect(() => {
    const newKeyword = (keyword || '').split('-').join(' X ');

    if (variant === 'brands') {
      const parentCategory = parentCategories.find(({ id }) => parentIds.includes(id));
      const subParentCategory = subParentCategories.find(
        ({ id, parentId }) => parentIds.includes(parentId) && subParentIds.includes(id)
      );

      if (subParentCategory) {
        setSaveKeyword(`${newKeyword}, ${subParentCategory.name.replace(/\(P\)/g, '')}`);
      } else if (parentCategory) {
        setSaveKeyword(`${newKeyword}, ${parentCategory.name.replace(/\(P\)/g, '')}`);
      } else {
        setSaveKeyword(`${newKeyword}, 전체`);
      }

      setSourceType(1);
    } else if (variant === 'categories') {
      const subParentCategory = subParentCategories.find(({ id }) => subParentIds.includes(id));

      if (subParentCategory) {
        setSaveKeyword(subParentCategory.name.replace(/\(P\)/g, ''));
      } else {
        setSaveKeyword(newKeyword);
      }

      setSourceType(3);
    } else {
      setSaveKeyword(newKeyword);
    }
  }, [variant, keyword, parentIds, subParentIds, parentCategories, subParentCategories]);

  return (
    <BottomSheet disableSwipeable open={open} onClose={handleClose}>
      <Box
        customStyle={{
          padding: '16px 20px 32px 20px'
        }}
      >
        <Flexbox alignment="center" justifyContent="space-between">
          <Typography variant="h3" weight="bold">
            이 검색 저장하기
          </Typography>
          <Icon name="CloseOutlined" onClick={handleClose} />
        </Flexbox>
        <Alert brandColor="primary-highlight" customStyle={{ marginTop: 20, padding: '12px 24px' }}>
          <Typography variant="body1" weight="bold">
            찾는 조건 그대로 저장하고, 홈에서 바로 확인!
          </Typography>
        </Alert>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 20 }}>
          <Typography variant="body2" weight="bold" customStyle={{ color: common.ui60 }}>
            키워드
          </Typography>
          <Flexbox gap={6} customStyle={{ flexWrap: 'wrap' }}>
            {saveKeyword.split(', ').map((text) => (
              <Label
                key={`saved-keyword-${text}`}
                text={text}
                brandColor="black"
                variant="contained"
                customStyle={{ width: 'fit-content' }}
              />
            ))}
          </Flexbox>
        </Flexbox>
        <Flexbox direction="vertical" gap={8} customStyle={{ marginTop: 20 }}>
          <Typography variant="body2" weight="bold" customStyle={{ color: common.ui60 }}>
            필터
          </Typography>
          <Flexbox customStyle={{ columnGap: 6, rowGap: 8, flexWrap: 'wrap' }}>
            {idFilterOptions
              .filter(({ id }) => idFilterIds.includes(id))
              .map(({ id, name }) => (
                <Label
                  key={`products-keyword-history-${id}-${name}`}
                  variant="ghost"
                  brandColor="primary"
                  text={name}
                />
              ))}
            {mapFilterOptions
              .filter(({ distance }) => distance === selectedDistance)
              .map(({ viewName }) => (
                <Label
                  key={`products-keyword-history-${selectedDistance}-${viewName}`}
                  variant="ghost"
                  brandColor="primary"
                  text={viewName}
                />
              ))}
            {filterCodeIdsByPriority
              .map((filterCodeId) =>
                selectedSearchOptionsHistory.filter(({ codeId }) => codeId === filterCodeId)
              )
              .flat()
              .map(({ displayName, index }) => (
                <Label
                  key={`products-keyword-history-${index || 0}-${displayName}`}
                  variant="ghost"
                  brandColor="primary"
                  text={displayName}
                />
              ))}
          </Flexbox>
        </Flexbox>
        <Flexbox gap={8} customStyle={{ marginTop: 52 }}>
          <Button
            size="large"
            customStyle={{ minWidth: 112, fontWeight: 500 }}
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            variant="contained"
            brandColor="primary"
            fullWidth
            size="large"
            onClick={handleClick}
          >
            저장하기
          </Button>
        </Flexbox>
      </Box>
    </BottomSheet>
  );
}

export default ProductsKeywordBottomSheet;
