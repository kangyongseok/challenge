import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Chip, CtaButton, Icon } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterGenders,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import {
  activeTabCodeIdState,
  filterOperationInfoSelector,
  productsFilterStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function FilterBottomOperation() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const { selectedSearchOptionsHistory, selectedTotalCount } = useRecoilValue(
    filterOperationInfoSelector
  );
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const activeTabCodeId = useRecoilValue(activeTabCodeIdState);
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const setProductsFilterState = useSetRecoilState(
    productsFilterStateFamily(`general-${atomParam}`)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.swipeXFilterHistory, {
      name: attrProperty.name.filterModal
    });
  }, 300);

  const handleClick = () => {
    setProductsFilterState(({ type }) => ({
      type,
      open: false
    }));
    setSearchOptionsParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(selectedSearchOptions, {
        baseSearchParams
      })
    }));
    setSearchParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(selectedSearchOptions, {
        baseSearchParams
      })
    }));

    const eventProperties = {
      name: PRODUCT_NAME.PRODUCT_LIST,
      keyword: router.query.keyword
    };

    if (router.pathname !== '/products/search/[keyword]') {
      delete eventProperties.keyword;
    }

    logEvent(attrKeys.products.clickApplyFilter, eventProperties);
  };

  const handleClickRemove = (e: MouseEvent<HTMLButtonElement>) => {
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    const dataParentId = Number(e.currentTarget.getAttribute('data-parent-id') || 0);
    const dataGenderId = Number(e.currentTarget.getAttribute('data-gender-id') || 0);
    const dataGender = String(e.currentTarget.getAttribute('data-gender') || '');
    const dataParentCategoryId = Number(
      e.currentTarget.getAttribute('data-parent-category-id') || 0
    );
    const dataCategorySizeId = Number(e.currentTarget.getAttribute('data-category-size-id') || 0);
    const dataGrouping = String(e.currentTarget.getAttribute('data-grouping') || '');
    const dataGroupingDepth = Number(e.currentTarget.getAttribute('data-grouping-depth') || 0);
    const dataHistoryIndex = Number(e.currentTarget.getAttribute('data-history-index'));

    const selectedSearchOptionHistory = selectedSearchOptionsHistory[dataHistoryIndex];

    if (selectedSearchOptionHistory) {
      logEvent(attrKeys.products.clickFilterDelete, {
        name: attrProperty.name.productList,
        title: productFilterEventPropertyTitle[dataCodeId],
        att: 'FILTER',
        index: dataHistoryIndex,
        count: selectedSearchOptionHistory.count,
        value: selectedSearchOptionHistory.displayName
      });
    }

    if (dataGrouping && dataGroupingDepth) {
      if (dataCodeId === filterCodeIds.category && dataGroupingDepth === 1) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
            const [selectedGenderId] = genderIds.filter(
              (genderId) => genderId !== filterGenders.common.id
            );

            if (codeId !== dataCodeId) return true;
            return selectedGenderId !== dataGenderId;
          })
        }));
      } else if (dataCodeId === filterCodeIds.category && dataGroupingDepth === 2) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.filter(
            ({ codeId, genderIds = [], parentId }) => {
              const [selectedGenderId] = genderIds.filter(
                (genderId) => genderId !== filterGenders.common.id
              );

              if (codeId !== dataCodeId) return true;
              if (selectedGenderId !== dataGenderId) return true;
              return parentId !== dataParentId;
            }
          )
        }));
      } else if (dataCodeId === filterCodeIds.size && dataGroupingDepth === 1) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.filter(
            ({ codeId, parentCategoryId }) =>
              codeId !== dataCodeId || parentCategoryId !== dataParentCategoryId
          )
        }));
      } else if (
        [filterCodeIds.season, filterCodeIds.color, filterCodeIds.material].includes(dataCodeId) &&
        dataGroupingDepth === 1
      ) {
        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: selectedSearchOptions.filter(({ codeId }) => codeId !== dataCodeId)
        }));
      }
      return;
    }

    let selectedSearchOption = selectedSearchOptions.find(
      ({ id, codeId, parentId, parentCategoryId = 0, genderIds = [] }) => {
        if (codeId === filterCodeIds.category) {
          const [selectedGenderId] = genderIds.filter(
            (genderId) => genderId !== filterGenders.common.id
          );

          return (
            dataId === id &&
            dataCodeId === codeId &&
            dataParentId === parentId &&
            dataGenderId === selectedGenderId
          );
        }

        return id === dataId && codeId === dataCodeId && parentCategoryId === dataParentCategoryId;
      }
    );

    if (!selectedSearchOption) {
      selectedSearchOption = selectedSearchOptions.find(
        ({ codeId, minPrice, maxPrice }) => codeId === dataCodeId && minPrice && maxPrice
      );
    }

    if (selectedSearchOption) {
      const newSelectedSearchOptions = selectedSearchOptions.filter(
        ({
          id = 0,
          codeId,
          genderIds = [],
          parentId = 0,
          parentCategoryId = 0,
          categorySizeId = 0,
          gender = ''
        }) => {
          const [genderId] = genderIds.filter(
            (selectedGenderId) => selectedGenderId !== filterGenders.common.id
          );

          if (codeId !== dataCodeId) return true;
          if ((parentId || 0) !== dataParentId) return true;
          if (parentCategoryId !== dataParentCategoryId) return true;
          if (categorySizeId !== dataCategorySizeId) return true;
          if ((genderId || 0) !== dataGenderId) return true;
          if (gender !== dataGender) return true;

          return id !== dataId;
        }
      );

      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: newSelectedSearchOptions
      }));

      const currentActiveTabSelectedSearchOptions = newSelectedSearchOptions.filter(
        ({ codeId }) => codeId === activeTabCodeId
      );

      if (dataCodeId !== activeTabCodeId) {
        setSearchOptionsParamsState(({ type }) => ({
          type,
          searchParams: convertSearchParams(newSelectedSearchOptions, {
            baseSearchParams,
            excludeCodeId: activeTabCodeId
          })
        }));
      } else if (dataCodeId === activeTabCodeId && !currentActiveTabSelectedSearchOptions.length) {
        setSearchOptionsParamsState(({ type }) => ({
          type,
          searchParams: convertSearchParams(newSelectedSearchOptions, {
            baseSearchParams,
            excludeCodeId: activeTabCodeId
          })
        }));
      }
    }
  };

  const handleClickReset = () => {
    const newSelectedSearchOptions = selectedSearchOptions.filter(({ codeId }) =>
      [filterCodeIds.map, filterCodeIds.id, filterCodeIds.order].includes(codeId)
    );
    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: newSelectedSearchOptions
    }));
    setSearchOptionsParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(newSelectedSearchOptions, {
        baseSearchParams
      })
    }));

    logEvent(attrKeys.products.clickResetAll, {
      name: attrProperty.name.productList,
      att: 'LIST'
    });
  };

  return (
    <StyledFilterBottomOperation>
      {selectedSearchOptionsHistory.length > 0 && (
        <SelectedSearchOptionList onScroll={handleScroll}>
          {selectedSearchOptionsHistory.map(
            ({
              id,
              codeId,
              parentId,
              parentCategoryId,
              categorySizeId,
              genderId,
              gender,
              displayName,
              grouping,
              groupingDepth,
              index
            }) => (
              <Chip
                key={`selected-filter-options-history-${index || 0}-${displayName}`}
                variant="ghost"
                endIcon={<Icon name="CloseOutlined" size="small" />}
                brandColor="primary"
                size="small"
                data-history-index={index}
                data-id={id}
                data-code-id={codeId}
                data-parent-id={parentId}
                data-parent-category-id={parentCategoryId}
                data-category-size-id={categorySizeId}
                data-gender-id={genderId}
                data-gender={gender || ''}
                data-grouping={grouping || ''}
                data-grouping-depth={groupingDepth}
                onClick={handleClickRemove}
              >
                {displayName}
              </Chip>
            )
          )}
        </SelectedSearchOptionList>
      )}
      <FilterButtons>
        <CtaButton
          size="large"
          customStyle={{ minWidth: 112, whiteSpace: 'nowrap' }}
          onClick={handleClickReset}
        >
          전체 초기화
        </CtaButton>
        <CtaButton
          variant="contained"
          fullWidth
          size="large"
          brandColor="primary"
          onClick={handleClick}
        >
          필터 적용 ({selectedTotalCount.toLocaleString()}개)
        </CtaButton>
      </FilterButtons>
    </StyledFilterBottomOperation>
  );
}

const StyledFilterBottomOperation = styled.div`
  box-shadow: ${({ theme: { box } }) => box.shadow.modal};
  z-index: 1;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 16px 20px 24px 20px;
`;

const SelectedSearchOptionList = styled.div`
  width: 100%;
  padding: 16px 20px 0 20px;
  background-color: ${({ theme: { palette } }) => palette.common.white};
  white-space: nowrap;
  overflow-x: auto;

  & > button {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
`;

export default FilterBottomOperation;
