import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Avatar, Button, Chip, Icon, useTheme } from 'mrcamel-ui';
import debounce from 'lodash-es/debounce';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColors,
  filterGenders,
  filterImageColorNames,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import type { ProductsVariant } from '@typings/products';
import {
  activeTabCodeIdState,
  filterOperationInfoSelector,
  productsFilterStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

interface FilterBottomOperationProps {
  variant: ProductsVariant;
}

function FilterBottomOperation({ variant }: FilterBottomOperationProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

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

  const handleClickRemove =
    ({
      newId = 0,
      newCodeId = 0,
      newParentId = 0,
      newGenderId = 0,
      newGender = '',
      newParentCategoryId = 0,
      newCategorySizeId = 0,
      newGrouping = false,
      newGroupingDepth = 0,
      newHistoryIndex = 0
    }: Partial<{
      newId: number;
      newCodeId: number;
      newParentId: number;
      newGenderId: number;
      newGender: string;
      newParentCategoryId: number;
      newCategorySizeId: number;
      newGrouping: boolean;
      newGroupingDepth: number;
      newHistoryIndex: number;
    }>) =>
    () => {
      const selectedSearchOptionHistory = selectedSearchOptionsHistory[newHistoryIndex];

      if (selectedSearchOptionHistory) {
        logEvent(attrKeys.products.clickFilterDelete, {
          name: attrProperty.name.productList,
          title: productFilterEventPropertyTitle[newCodeId],
          att: 'FILTER',
          index: newHistoryIndex,
          count: selectedSearchOptionHistory.count,
          value: selectedSearchOptionHistory.displayName.replace(/~/g, '-')
        });
      }

      if (newGrouping && newGroupingDepth) {
        if (newCodeId === filterCodeIds.category && newGroupingDepth === 1) {
          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: selectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
              const [selectedGenderId] = genderIds.filter(
                (genderId) => genderId !== filterGenders.common.id
              );

              if (codeId !== newCodeId) return true;
              return selectedGenderId !== newGenderId;
            })
          }));
        } else if (newCodeId === filterCodeIds.category && newGroupingDepth === 2) {
          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: selectedSearchOptions.filter(
              ({ codeId, genderIds = [], parentId }) => {
                const [selectedGenderId] = genderIds.filter(
                  (genderId) => genderId !== filterGenders.common.id
                );

                if (codeId !== newCodeId) return true;
                if (selectedGenderId !== newGenderId) return true;
                return parentId !== newParentId;
              }
            )
          }));
        } else if (newCodeId === filterCodeIds.size && newGroupingDepth === 1) {
          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: selectedSearchOptions.filter(
              ({ codeId, parentCategoryId }) =>
                codeId !== newCodeId || parentCategoryId !== newParentCategoryId
            )
          }));
        } else if (
          [filterCodeIds.season, filterCodeIds.color, filterCodeIds.material].includes(newCodeId) &&
          newGroupingDepth === 1
        ) {
          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: selectedSearchOptions.filter(
              ({ codeId }) => codeId !== newCodeId
            )
          }));
        }
        return;
      }

      let selectedSearchOption = selectedSearchOptions.find(
        ({ id, codeId, parentId, parentCategoryId = 0, genderIds = [], gender }) => {
          if (codeId === filterCodeIds.category) {
            const [selectedGenderId] = genderIds.filter(
              (genderId) => genderId !== filterGenders.common.id
            );

            return (
              newId === id &&
              newCodeId === codeId &&
              newParentId === parentId &&
              newGenderId === selectedGenderId
            );
          }
          if (codeId === filterCodeIds.gender) {
            return newGenderId === id || gender === newGender;
          }

          return id === newId && codeId === newCodeId && parentCategoryId === newParentCategoryId;
        }
      );

      if (!selectedSearchOption) {
        selectedSearchOption = selectedSearchOptions.find(
          ({ codeId, minPrice, maxPrice }) => codeId === newCodeId && minPrice && maxPrice
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
            let [genderId] = genderIds.filter(
              (selectedGenderId) => selectedGenderId !== filterGenders.common.id
            );

            if (!genderId) genderId = 0;

            if (codeId !== newCodeId) return true;
            if (parentId !== newParentId) return true;
            if (parentCategoryId !== newParentCategoryId) return true;
            if (categorySizeId !== newCategorySizeId) return true;
            if (genderId !== newGenderId) return true;
            if (gender !== newGender) return true;

            return id !== newId;
          }
        );

        setSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions: newSelectedSearchOptions
        }));

        const currentActiveTabSelectedSearchOptions = newSelectedSearchOptions.filter(
          ({ codeId }) => codeId === activeTabCodeId
        );

        if (newCodeId !== activeTabCodeId) {
          setSearchOptionsParamsState(({ type }) => ({
            type,
            searchParams: convertSearchParams(newSelectedSearchOptions, {
              baseSearchParams,
              excludeCodeId: activeTabCodeId
            })
          }));
        } else if (newCodeId === activeTabCodeId && !currentActiveTabSelectedSearchOptions.length) {
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
      [filterCodeIds.order].includes(codeId)
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
          {selectedSearchOptionsHistory
            .filter(
              ({ id, codeId }) => !(variant === 'camel' && codeId === filterCodeIds.id && id === 5)
            )
            .map(
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
                description,
                index
              }) => (
                <Chip
                  key={`selected-filter-options-history-${index || 0}-${displayName}`}
                  endIcon={<Icon name="CloseOutlined" width={14} height={14} color={common.ui80} />}
                  weight="regular"
                  isRound={false}
                  onClick={handleClickRemove({
                    newHistoryIndex: index,
                    newId: id,
                    newCodeId: codeId,
                    newParentId: parentId,
                    newParentCategoryId: parentCategoryId,
                    newCategorySizeId: categorySizeId,
                    newGenderId: genderId,
                    newGender: gender,
                    newGrouping: grouping,
                    newGroupingDepth: groupingDepth
                  })}
                  customStyle={{
                    '& > svg': {
                      height: 'auto'
                    }
                  }}
                >
                  {codeId === filterCodeIds.color ? (
                    <>
                      {filterColors[description as keyof typeof filterColors] && (
                        <ColorSample
                          colorCode={filterColors[description as keyof typeof filterColors]}
                        />
                      )}
                      {filterImageColorNames.includes(description || '') && (
                        <Avatar
                          width={20}
                          height={20}
                          src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${description}.png`}
                          alt="Color Img"
                          round="50%"
                        />
                      )}
                    </>
                  ) : (
                    displayName
                  )}
                </Chip>
              )
            )}
        </SelectedSearchOptionList>
      )}
      <FilterButtons>
        <Button
          variant="ghost"
          size="xlarge"
          brandColor="black"
          startIcon={<Icon name="RotateOutlined" />}
          onClick={handleClickReset}
          customStyle={{ minWidth: 112, whiteSpace: 'nowrap' }}
        >
          초기화
        </Button>
        <Button variant="solid" size="xlarge" brandColor="primary" onClick={handleClick} fullWidth>
          {selectedTotalCount.toLocaleString()}개 매물보기
        </Button>
      </FilterButtons>
    </StyledFilterBottomOperation>
  );
}

const StyledFilterBottomOperation = styled.div`
  z-index: 1;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 16px 20px 24px 20px;
`;

const SelectedSearchOptionList = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  width: 100%;
  padding: 12px 20px 0 20px;
  overflow-x: auto;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
`;

export const ColorSample = styled.div<{
  colorCode: string;
}>`
  position: relative;
  width: 20px;
  height: 20px;
  border: 1px solid transparent;

  ${({
    theme: {
      palette: { common }
    },
    colorCode
  }) =>
    colorCode === '#FFFFFF'
      ? {
          border: `1px solid ${common.line01}`
        }
      : {}};

  border-radius: 50%;
  background-color: ${({ colorCode }) => colorCode};
`;

export default FilterBottomOperation;
