import { useEffect, useRef } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Chip, Flexbox, Icon, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import type { ProductKeywordSourceType } from '@dto/user';
import type { ProductKeyword } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { deleteProductKeyword, postProductKeyword, putProductKeyword } from '@api/user';
import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  filterCodeIds,
  filterGenders,
  orderFilterOptions,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import type {
  ProductsVariant,
  SelectedSearchOption,
  SelectedSearchOptionHistory
} from '@typings/products';
import { productsKeywordInduceTriggerState } from '@recoil/productsKeyword';
import {
  filterOperationInfoSelector,
  productsFilterProgressDoneState,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { homeSelectedTabStateFamily } from '@recoil/home';
import { toastState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductsFilterHistoryProps {
  variant: ProductsVariant;
  showProductKeywordSaveChip: boolean;
}

function ProductsFilterHistory({
  variant,
  showProductKeywordSaveChip
}: ProductsFilterHistoryProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const [{ searchParams }, setSearchParamsState] = useRecoilState(
    searchParamsStateFamily(`search-${atomParam}`)
  );
  const [{ searchParams: searchOptionsParams }, setSearchOptionsParamsState] = useRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setToastState = useSetRecoilState(toastState);
  const [{ tooltip }, setProductsKeywordInduceTriggerState] = useRecoilState(
    productsKeywordInduceTriggerState
  );
  const resetProductKeyword = useResetRecoilState(homeSelectedTabStateFamily('productKeyword'));

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: { userProductKeyword } = {},
    isLoading,
    isFetched
  } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  const { mutate: mutateProductKeyword, isLoading: isLoadingProductKeyword } = useMutation(
    postProductKeyword,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
        setToastState({ type: 'productsKeyword', status: 'saved' });
        resetProductKeyword();
        queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
        setProductsKeywordInduceTriggerState((prevState) => ({
          ...prevState,
          alert: false
        }));
        window.scrollTo(0, 0);
      },
      onError: () => {
        setToastState({ type: 'productsKeyword', status: 'limited' });
      }
    }
  );
  const { mutate: mutateDeleteProductKeyword, isLoading: isLoadingDeleteProductKeyword } =
    useMutation(deleteProductKeyword, {
      onMutate: (data: number) => {
        prevProductKeywordIdRef.current = data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
        setToastState({
          type: 'productsKeyword',
          status: 'deleted',
          hideDuration: 4000,
          action: () => {
            if (prevProductKeywordIdRef.current) {
              logEvent(attrKeys.products.clickUndo, {
                name: attrProperty.name.productList,
                title: attrProperty.title.myListDelete
              });
              mutateProductKeywordRestore(prevProductKeywordIdRef.current);
            }
          }
        });
        resetProductKeyword();
        queryClient.invalidateQueries(queryKeys.users.userProductKeywords());
      }
    });
  const { mutate: mutateProductKeywordRestore } = useMutation(putProductKeyword, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      setToastState({ type: 'productsKeyword', status: 'restored' });
    }
  });

  const prevProductKeywordIdRef = useRef(0);
  const productKeywordButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.swipeXFilterHistory, {
      name: attrProperty.name.productList
    });
  }, 300);

  const handleClickRemove =
    ({
      id: selectedId = 0,
      codeId: selectedCodeId = 0,
      parentId: selectedParentId = 0,
      genderId: selectedGenderId = 0,
      parentCategoryId: selectedParentCategoryId = 0,
      categorySizeId: selectedCategorySizeId = 0,
      groupingDepth: selectedGroupingDepth = 0,
      gender: selectedGender = '',
      index: selectedIndex,
      count: selectedCount,
      displayName: selectedDisplayName
    }: SelectedSearchOptionHistory) =>
    () => {
      logEvent(attrKeys.products.clickFilterDelete, {
        name: attrProperty.name.productList,
        title: productFilterEventPropertyTitle[selectedCodeId],
        att: 'DYNAMIC_FILTER',
        index: selectedIndex,
        count: selectedCount,
        value: selectedDisplayName
      });
      let newSelectedSearchOptions: SelectedSearchOption[];

      if (selectedCodeId === filterCodeIds.category && selectedGroupingDepth === 1) {
        newSelectedSearchOptions = selectedSearchOptions.filter(
          ({ codeId, genderIds = [] }) =>
            codeId !== selectedCodeId ||
            genderIds.find((genderId) => genderId !== filterGenders.common.id) !== selectedGenderId
        );
      } else if (selectedCodeId === filterCodeIds.category && selectedGroupingDepth === 2) {
        newSelectedSearchOptions = selectedSearchOptions.filter(
          ({ codeId, genderIds = [], parentId }) =>
            codeId !== selectedCodeId ||
            genderIds.find((genderId) => genderId !== filterGenders.common.id) !==
              selectedGenderId ||
            parentId !== selectedParentId
        );
      } else if (selectedCodeId === filterCodeIds.size && selectedGroupingDepth === 1) {
        newSelectedSearchOptions = selectedSearchOptions.filter(
          ({ codeId, parentCategoryId }) =>
            codeId !== selectedCodeId || parentCategoryId !== selectedParentCategoryId
        );
      } else if (
        [filterCodeIds.season, filterCodeIds.color, filterCodeIds.material].includes(
          selectedCodeId
        ) &&
        selectedGroupingDepth === 1
      ) {
        newSelectedSearchOptions = selectedSearchOptions.filter(
          ({ codeId }) => codeId !== selectedCodeId
        );
      } else {
        newSelectedSearchOptions = selectedSearchOptions.filter(
          ({
            id = 0,
            codeId,
            genderIds = [],
            parentId = 0,
            parentCategoryId = 0,
            categorySizeId = 0,
            gender = ''
          }) =>
            codeId !== selectedCodeId ||
            parentId !== selectedParentId ||
            parentCategoryId !== selectedParentCategoryId ||
            categorySizeId !== selectedCategorySizeId ||
            (genderIds.find((genderId) => genderId !== filterGenders.common.id) || 0) !==
              selectedGenderId ||
            id !== selectedId ||
            gender !== selectedGender
        );
      }

      if (!isEmpty(newSelectedSearchOptions)) {
        const newSearchParams = convertSearchParams(newSelectedSearchOptions, {
          baseSearchParams
        });

        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: newSelectedSearchOptions
        }));
        setSearchOptionsParamsState(({ type }) => ({
          type,
          searchParams: newSearchParams
        }));
        setSearchParamsState(({ type }) => ({
          type,
          searchParams: newSearchParams
        }));
      }
    };

  const handleClickDeleteProductsKeyword =
    ({ id }: ProductKeyword) =>
    () => {
      if (isLoadingDeleteProductKeyword) return;

      if (userProductKeyword) {
        const { keyword, keywordFilterJson } = userProductKeyword;
        logEvent(attrKeys.products.clickMyList, {
          name: attrProperty.name.productList,
          att: 'DELETE',
          keyword,
          filters: keywordFilterJson
        });
      }

      mutateDeleteProductKeyword(id);
    };

  const handleClickSaveProductsKeyword = () => {
    logEvent(attrKeys.products.clickMyList, {
      name: attrProperty.name.productList,
      att: 'SAVE'
    });

    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }

    if (isLoadingProductKeyword) return;

    let sourceType: ProductKeywordSourceType = 0;

    if (variant === 'brands') sourceType = 1;

    if (variant === 'categories') sourceType = 3;

    mutateProductKeyword({
      productSearch: { ...searchParams, order: orderFilterOptions[1].order },
      sourceType
    });
  };

  const handleClickReset = () => {
    if (isLoading || !isFetched) return;

    logEvent(attrKeys.products.clickResetAll, {
      name: attrProperty.name.productList
    });

    const newSelectedSearchOptions = selectedSearchOptions.filter(({ codeId }) =>
      [filterCodeIds.order].includes(codeId)
    );
    const newSearchParams = convertSearchParams(newSelectedSearchOptions, { baseSearchParams });

    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: newSelectedSearchOptions
    }));
    setSearchOptionsParamsState(({ type }) => ({
      type,
      searchParams: newSearchParams
    }));
    setSearchParamsState(({ type }) => ({
      type,
      searchParams: newSearchParams
    }));
  };

  useEffect(() => {
    if (showProductKeywordSaveChip) {
      logEvent(attrKeys.products.viewMyList, {
        name: attrProperty.name.productList,
        att: 'SAVE'
      });
    }
  }, [showProductKeywordSaveChip]);

  // TODO 추후 로직 개선
  useEffect(() => {
    const handleClickProductKeywordTooltip = () =>
      setProductsKeywordInduceTriggerState((prevState) => ({ ...prevState, tooltip: false }));

    if (tooltip && showProductKeywordSaveChip) {
      window.addEventListener('click', handleClickProductKeywordTooltip);
    } else {
      window.removeEventListener('click', handleClickProductKeywordTooltip);
    }

    return () => {
      window.removeEventListener('click', handleClickProductKeywordTooltip);
    };
  }, [tooltip, showProductKeywordSaveChip, setProductsKeywordInduceTriggerState]);

  return progressDone ? (
    <>
      <Wrapper show={selectedSearchOptionsHistory.length > 0}>
        <Box customStyle={{ overflowX: 'auto', width: '100%' }}>
          <Flexbox
            gap={6}
            alignment="center"
            customStyle={{ padding: '0 16px', width: 'fit-content' }}
            onScroll={handleScroll}
          >
            {selectedSearchOptionsHistory.map((selectedSearchOptionHistory) => (
              <FilterChip
                key={`selected-filter-options-history-${selectedSearchOptionHistory.index || 0}-${
                  selectedSearchOptionHistory.displayName
                }`}
                isRound={false}
                endIcon={<Icon name="CloseOutlined" />}
                onClick={handleClickRemove(selectedSearchOptionHistory)}
              >
                {selectedSearchOptionHistory.displayName}
              </FilterChip>
            ))}
          </Flexbox>
        </Box>
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          customStyle={{ padding: '0 16px' }}
        >
          <Button
            ref={productKeywordButtonRef}
            brandColor={userProductKeyword ? 'black' : 'primary'}
            variant={userProductKeyword ? 'ghost' : 'outlined'}
            size="medium"
            startIcon={
              (!isLoadingProductKeyword &&
                !isLoadingDeleteProductKeyword &&
                (userProductKeyword ? (
                  <Icon name="CloseOutlined" customStyle={{ color: `${common.ui60} !important` }} />
                ) : (
                  <Icon
                    name="BookmarkFilled"
                    customStyle={{ color: `${primary.light} !important` }}
                  />
                ))) ||
              undefined
            }
            onClick={
              userProductKeyword
                ? handleClickDeleteProductsKeyword(userProductKeyword)
                : handleClickSaveProductsKeyword
            }
            disabled={isLoadingProductKeyword || isLoadingDeleteProductKeyword}
            customStyle={{ gap: 2, minWidth: 120 }}
          >
            <Typography
              weight="medium"
              customStyle={{
                padding: '0 2px',
                color: userProductKeyword ? common.ui60 : primary.light,
                borderColor: userProductKeyword ? 'inherit' : primary.light
              }}
            >
              {!isLoadingProductKeyword &&
                !isLoadingDeleteProductKeyword &&
                (userProductKeyword ? '저장된 필터 삭제' : '필터 저장하기')}
              {(isLoadingProductKeyword || isLoadingDeleteProductKeyword) && (
                <Icon name="LoadingFilled" />
              )}
            </Typography>
          </Button>
          <Flexbox
            alignment="center"
            gap={4}
            customStyle={{ padding: '8px 0', marginLeft: 'auto' }}
            onClick={handleClickReset}
          >
            <Icon
              name="RotateOutlined"
              customStyle={{ color: !isLoading || isFetched ? common.ui60 : common.ui80 }}
              size="medium"
            />
            <Typography
              customStyle={{ color: !isLoading || isFetched ? common.ui60 : common.ui80 }}
            >
              초기화
            </Typography>
          </Flexbox>
        </Flexbox>
      </Wrapper>
      {showProductKeywordSaveChip && (
        <Tooltip
          open={tooltip}
          message={
            <Typography variant="body2" weight="medium" customStyle={{ color: common.uiWhite }}>
              나중에 같은 필터로 또 볼거죠? 그럼 저장하세요!
            </Typography>
          }
          placement="bottom"
          triangleLeft={16}
          customStyle={{
            top: 4,
            left: 16,
            transform: 'none',
            height: 'fit-content',
            zIndex: 1
          }}
        />
      )}
    </>
  ) : null;
}

const Wrapper = styled.section<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px 6px;
  border-top: ${({ theme: { palette }, show }) => show && `2px solid ${palette.common.ui95}`};
  background-color: #f5f6f7;
  opacity: ${({ show }) => Number(show)};
  padding: ${({ show }) => (show ? '12px 0' : 0)};
  max-height: ${({ show }) => !show && 0};
  transition-property: max-height, padding;
  transition-duration: 0.2s;
`;

const FilterChip = styled(Chip)`
  border-color: ${({ theme }) => theme.palette.common.ui90};
  gap: 2px;
  font-weight: ${({ theme }) => theme.typography.body1.weight.regular};
  white-space: nowrap;

  & > svg {
    width: 14px;
    height: 14px;
    color: ${({ theme: { palette } }) => palette.common.ui80};
  }
`;

export default ProductsFilterHistory;
