import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce, isEmpty } from 'lodash-es';
import styled from '@emotion/styled';

import { CustomSearchBar } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';
import { CamelSellerProductSearchItem } from '@components/pages/camelSeller';

import { Models } from '@dto/model';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchModelSuggest } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { CAMEL_SELLER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { CamelSellerLocalStorage } from '@typings/camelSeller';
import {
  camelSellerBooleanStateFamily,
  camelSellerDialogStateFamily,
  camelSellerSubmitState
} from '@recoil/camelSeller';

function CamelSellerProductSearch() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const setFocusState = useSetRecoilState(camelSellerBooleanStateFamily('focus'));
  const setSubmitData = useSetRecoilState(camelSellerSubmitState);
  const initDialogState = useRecoilValue(camelSellerDialogStateFamily('initDialog'));
  const {
    data: models,
    refetch,
    isLoading
  } = useQuery(
    queryKeys.models.suggest({ keyword: searchValue }),
    () => fetchModelSuggest({ keyword: searchValue }),
    {
      enabled: false,
      onSuccess(data) {
        logEvent(attrKeys.camelSeller.LOAD_KEYWORD_AUTO, {
          name: attrProperty.name.PRODUCT_MODEL,
          title: attrProperty.title.MODEL,
          att: searchValue,
          count: data.length
        });
      }
    }
  );

  const windowClickEvent = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.dataset.noneModelName) {
      setFocusState(({ type }) => ({ type, isState: false }));
    }
    if (target.dataset.modelSearch) {
      setFocusState(({ type }) => ({ type, isState: true }));
    }
  };

  useEffect(() => {
    const camelSellerLocalData = LocalStorage.get(CAMEL_SELLER) as CamelSellerLocalStorage;
    const isPrevSearchValue = camelSellerLocalData?.keyword && !searchValue && inputRef.current;
    if (isPrevSearchValue) {
      (inputRef.current.querySelector('input') as HTMLInputElement).value =
        camelSellerLocalData.keyword || '';
      setSearchValue(camelSellerLocalData.keyword || '');
    }
    window.addEventListener('click', windowClickEvent);
    return () => window.removeEventListener('click', windowClickEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initDialogState.open) {
      if (inputRef.current?.querySelector('input')) {
        inputRef.current.querySelector('input')?.focus();
      }
    }
  }, [initDialogState]);

  useEffect(() => {
    if (!isEmpty(searchValue)) {
      refetch();
    }
  }, [searchValue, refetch]);

  const handleChange = debounce((e: FormEvent<HTMLInputElement>) => {
    const { value } = e.target as HTMLInputElement;
    setSearchValue(value);
  }, 500);

  const handleFocus = () => {
    setFocusState(({ type }) => ({ type, isState: true }));
  };

  const handleBlur = () => {
    // setFocusState(({ type }) => ({ type, isState: false }));
    setIsFocus(false);
  };

  const handleClickModelEmpty = () => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      title: attrProperty.title.NO_MODEL,
      att: searchValue
    });
    LocalStorage.set(CAMEL_SELLER, {
      title: searchValue,
      keyword: searchValue,
      search: false
    });
    router.push('/camelSeller/selectCategory');
  };

  const handleClickModel = (data: Models) => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      title: attrProperty.title.MODEL,
      att: data.name
    });
    LocalStorage.set(CAMEL_SELLER, {
      title: data.name,
      keyword: data.name,
      search: true,
      category: { id: data.tmpCategories[0]?.id, name: data.tmpCategories[0]?.name },
      subCategoryName: data.subParentCategoryName,
      brand: { id: data.tmpBrands[0].id, name: data.tmpBrands[0].name },
      description: ''
    });
    setSubmitData({
      title: data.name,
      quoteTitle: data.name,
      categoryIds: [data.tmpCategories[0].id],
      brandIds: [data.tmpBrands[0].id],
      price: 0,
      conditionId: 0,
      colorIds: [],
      categorySizeIds: [],
      photoGuideImages: [],
      description: ''
    });
    router.push('/camelSeller/registerConfirm');
  };

  return (
    <>
      <Box>
        <Box
          customStyle={{
            padding: '5px 0',
            borderBottom: searchValue ? `2px solid ${primary.main}` : `1px solid ${common.ui90}`
          }}
        >
          <Search
            fullWidth
            isBorder={false}
            placeholder="모델명 입력"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={inputRef}
            customStyle={{ padding: 0, caretColor: primary.main }}
            maxLength={40}
            data-model-search="true"
          />
        </Box>
        <SearchResultArea isFocus={isFocus}>
          {isLoading &&
            Array.from({ length: 3 }, (_, i) => i + 1).map((value) => (
              <Flexbox alignment="center" gap={12} key={`skeleton-${value}`}>
                <Skeleton
                  width="50px"
                  height="50px"
                  disableAspectRatio
                  customStyle={{ borderRadius: 8 }}
                />
                <Flexbox direction="vertical" gap={4}>
                  <Skeleton height="24px" width="200px" disableAspectRatio />
                  <Skeleton height="18px" width="150px" disableAspectRatio />
                </Flexbox>
              </Flexbox>
            ))}
          {models &&
            models.length > 0 &&
            models.map((result) => (
              <CamelSellerProductSearchItem
                key={`camel-seller-product-${result.name}`}
                data={result}
                onClick={() => handleClickModel(result)}
              />
            ))}
        </SearchResultArea>
      </Box>
      <Box customStyle={{ margin: '24px 0 80px', display: searchValue ? 'block' : 'none' }}>
        <Typography weight="medium" variant="h4" customStyle={{ color: common.ui60 }}>
          검색결과에 내 모델이 없나요?
        </Typography>
        <Flexbox
          customStyle={{ marginTop: 4 }}
          gap={4}
          alignment="center"
          onClick={handleClickModelEmpty}
        >
          <Typography
            brandColor="primary"
            weight="medium"
            variant="body1"
            customStyle={{ maxWidth: 230, wordBreak: 'break-all' }}
          >
            [{searchValue}]
          </Typography>
          <Typography weight="medium" variant="body1">
            등록하기
          </Typography>
          <Icon name="ArrowRightOutlined" size="small" />
        </Flexbox>
      </Box>
    </>
  );
}

const Search = styled(CustomSearchBar)`
  font-size: ${({ theme: { typography } }) => typography.h2.size};
  font-weight: ${({ theme: { typography } }) => typography.h2.weight.bold};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  padding: 0;
`;

const SearchResultArea = styled.ul<{ isFocus: boolean }>`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: auto;
  max-height: 214px;
`;

export default CamelSellerProductSearch;
