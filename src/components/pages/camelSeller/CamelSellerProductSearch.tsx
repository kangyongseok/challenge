import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import { debounce, isEmpty } from 'lodash-es';
import styled from '@emotion/styled';

import { CustomSearchBar } from '@components/UI/molecules';
import { CamelSellerProductSearchItem } from '@components/pages/camelSeller';

import { Models } from '@dto/model';

import { logEvent } from '@library/amplitude';

import { fetchModelSuggest } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { camelSellerBooleanStateFamily, camelSellerTempSaveDataState } from '@recoil/camelSeller';

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
  const [tempData, setTempData] = useRecoilState(camelSellerTempSaveDataState);
  const resetTempData = useResetRecoilState(camelSellerTempSaveDataState);
  const {
    data: models,
    refetch,
    isLoading
  } = useQuery(
    queryKeys.models.suggest({ keyword: searchValue }),
    () => fetchModelSuggest({ keyword: searchValue }),
    {
      enabled: !!searchValue,
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

  const windowClickEvent = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.dataset.noneModelName) {
        setFocusState(({ type }) => ({ type, isState: false }));
      }

      if (target.dataset.modelSearch) {
        setFocusState(({ type }) => ({ type, isState: true }));
      }
    },
    [setFocusState]
  );

  useEffect(() => {
    resetTempData();
  }, [resetTempData]);

  useEffect(() => {
    window.addEventListener('click', windowClickEvent);
    return () => window.removeEventListener('click', windowClickEvent);
  }, [refetch, searchValue, windowClickEvent]);

  useEffect(() => {
    if (inputRef.current?.querySelector('input')) {
      inputRef.current.querySelector('input')?.focus();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(searchValue)) {
      refetch();
    }
  }, [searchValue, refetch]);

  const handleChange = debounce(
    (e: FormEvent<HTMLInputElement>) => {
      const { value } = e.target as HTMLInputElement;
      setSearchValue(value);
    },
    searchValue ? 500 : 0
  );

  const handleFocus = () => {
    setFocusState(({ type }) => ({ type, isState: true }));
  };

  const handleBlur = () => {
    setIsFocus(false);
    setFocusState(({ type }) => ({ type, isState: false }));
  };

  const handleClickModelEmpty = () => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      title: attrProperty.title.NO_MODEL,
      att: searchValue
    });

    setTempData({
      ...tempData,
      title: searchValue
    });

    router.push({
      pathname: '/camelSeller/selectCategory',
      query: {
        title: searchValue
      }
    });
  };

  const handleClickModel = (data: Models) => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      title: attrProperty.title.MODEL,
      att: data.name
    });

    const commonData = {
      title: data.name,
      categoryIds: [data.tmpCategories[0]?.id],
      brandIds: data.tmpBrands.map((brands) => brands.id)
    };

    setTempData({
      ...tempData,
      title: data.name,
      quoteTitle: data.name
    });

    router.replace({
      pathname: '/camelSeller/registerConfirm',
      query: {
        ...commonData,
        brandName: data.tmpBrands[0].name,
        categoryName: data.tmpCategories[0].name,
        subParentCategoryName: data.subParentCategoryName
      }
    });
  };

  const handleClickUnknownName = () => {
    logEvent(attrKeys.camelSeller.CLICK_MODEL, {
      name: attrProperty.name.PRODUCT_MODEL,
      title: attrProperty.title.DONTKNOW_MODEL
    });

    router.push('/camelSeller/selectCategory');
  };

  return (
    <>
      <Box>
        <SearchWrap isSearchValue={!!searchValue}>
          <Typography
            variant="h3"
            weight="medium"
            customStyle={{ color: common.ui60, marginTop: 32 }}
          >
            판매하고자 하는 모델을 선택해주세요.
          </Typography>
          <Search
            fullWidth
            isBorder={false}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={inputRef}
            customStyle={{ padding: 0, caretColor: primary.main }}
            maxLength={40}
            data-model-search="true"
          />
          {!searchValue && (
            <Flexbox
              alignment="flex-end"
              customStyle={{
                position: 'absolute',
                top: 65,
                left: 0,
                zIndex: 0,
                paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0
              }}
            >
              <Typography
                weight="bold"
                variant="h2"
                customStyle={{ color: common.ui90, marginRight: 10 }}
              >
                모델명 입력
              </Typography>
              <Typography weight="medium" variant="h4" customStyle={{ color: common.ui90 }}>
                (e.g. 구찌 오피디아 버킷백)
              </Typography>
            </Flexbox>
          )}
        </SearchWrap>
        <SearchResultArea isFocus={isFocus}>
          {isLoading &&
            Array.from({ length: 3 }, (_, i) => i + 1).map((value) => (
              <Flexbox alignment="center" gap={12} key={`skeleton-${value}`}>
                <Skeleton width={50} height={50} round={8} disableAspectRatio />
                <Flexbox direction="vertical" gap={4}>
                  <Skeleton height={24} width={200} disableAspectRatio />
                  <Skeleton height={18} width={150} disableAspectRatio />
                </Flexbox>
              </Flexbox>
            ))}
          {/* {
            models &&
            models.length > 0 && 
            isExtendedLayoutIOSVersion() && <Box customStyle={{ height: APP_TOP_STATUS_HEIGHT }} />
          } */}
          {models &&
            models.length > 0 &&
            models.map((result) => (
              <CamelSellerProductSearchItem
                key={`camel-seller-product-${result.name}`}
                data={result}
                onClick={() => handleClickModel(result)}
              />
            ))}
          {!models && (
            <Typography
              brandColor="primary"
              weight="medium"
              customStyle={{ borderBottom: `1px solid ${primary.main}`, width: 'fit-content' }}
              onClick={handleClickUnknownName}
            >
              모델명을 잘 모르겠어요.
            </Typography>
          )}
        </SearchResultArea>
      </Box>
      <Box customStyle={{ margin: '24px 0 30px', display: searchValue ? 'block' : 'none' }}>
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
  background: transparent;
  position: relative;
  z-index: 1;
`;

const SearchResultArea = styled.ul<{ isFocus: boolean }>`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 100px;
`;

const SearchWrap = styled.div<{ isSearchValue: boolean }>`
  position: fixed;
  top: 56px;
  left: 20px;
  width: calc(100% - 40px);
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  background: ${({ theme: { palette } }) => palette.common.uiWhite};
  padding-top: ${isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0}px;
  border-bottom: ${({
    isSearchValue,
    theme: {
      palette: { primary, common }
    }
  }) => (isSearchValue ? `2px solid ${primary.main}` : `1px solid ${common.ui90}`)};
`;

export default CamelSellerProductSearch;
