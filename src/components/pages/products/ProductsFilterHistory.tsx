import { useEffect, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Avatar, Chip, Icon, Toast, useTheme } from 'mrcamel-ui';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
import styled from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColors,
  filterGenders,
  filterImageColorNames,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import type { SelectedSearchOption, SelectedSearchOptionHistory } from '@typings/products';
import {
  activeMyFilterState,
  filterOperationInfoSelector,
  myFilterIntersectionCategorySizesState,
  productsFilterProgressDoneState,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

function ProductsFilterHistory() {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const [activeMyFilter, setActiveMyFilterState] = useRecoilState(activeMyFilterState);
  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const myFilterIntersectionCategorySizes = useRecoilValue(myFilterIntersectionCategorySizesState);

  const [open, setOpen] = useState(false);

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
        value: selectedDisplayName.replace(/~/g, '-')
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

  const handleClickReset = () => {
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
    const hasUnSelectedMyFilterOption = myFilterIntersectionCategorySizes.some(
      ({ categorySizeId, parentCategoryId, viewSize }) =>
        !selectedSearchOptions.some(
          ({
            categorySizeId: intersectionCategorySizeId,
            parentCategoryId: intersectionParentCategoryId,
            viewSize: intersectionViewSize
          }) =>
            categorySizeId === intersectionCategorySizeId &&
            parentCategoryId === intersectionParentCategoryId &&
            viewSize === intersectionViewSize
        )
    );

    if (activeMyFilter && hasUnSelectedMyFilterOption && progressDone) {
      logEvent(attrKeys.products.clickMyFilter, {
        name: attrProperty.name.filterModal,
        title: attrProperty.title.auto,
        att: 'OFF'
      });
      setActiveMyFilterState(false);
      setOpen(true);
    }
  }, [
    setActiveMyFilterState,
    activeMyFilter,
    selectedSearchOptions,
    myFilterIntersectionCategorySizes,
    progressDone
  ]);

  return progressDone ? (
    <>
      <Wrapper show={selectedSearchOptionsHistory.length > 0}>
        <List show={selectedSearchOptionsHistory.length > 0} onScroll={handleScroll}>
          {selectedSearchOptionsHistory.map((selectedSearchOptionHistory) => (
            <FilterChip
              key={`selected-filter-options-history-${selectedSearchOptionHistory.index || 0}-${
                selectedSearchOptionHistory.displayName
              }`}
              weight="regular"
              endIcon={<Icon name="CloseOutlined" />}
              isRound={false}
              onClick={handleClickRemove(selectedSearchOptionHistory)}
            >
              {selectedSearchOptionHistory.codeId === filterCodeIds.color ? (
                <>
                  {filterColors[
                    selectedSearchOptionHistory.description as keyof typeof filterColors
                  ] && (
                    <ColorSample
                      colorCode={
                        filterColors[
                          selectedSearchOptionHistory.description as keyof typeof filterColors
                        ]
                      }
                    />
                  )}
                  {filterImageColorNames.includes(
                    selectedSearchOptionHistory.description || ''
                  ) && (
                    <Avatar
                      width={20}
                      height={20}
                      src={`https://${process.env.IMAGE_DOMAIN}/assets/images/ico/colors/${selectedSearchOptionHistory.description}.png`}
                      alt="Color Img"
                      round="50%"
                    />
                  )}
                </>
              ) : (
                selectedSearchOptionHistory.displayName
              )}
            </FilterChip>
          ))}
        </List>
        <ResetButton>
          <Icon name="RotateOutlined" color={common.ui60} onClick={handleClickReset} />
        </ResetButton>
      </Wrapper>
      <Toast open={open} onClose={() => setOpen(false)}>
        내 사이즈만 보기를 해제했어요!
      </Toast>
    </>
  ) : null;
}

const Wrapper = styled.section<{ show: boolean }>`
  position: relative;
  border-top: ${({
    theme: {
      palette: { common }
    },
    show
  }) => show && `2px solid ${common.ui95}`};
  background-color: #f5f6f7;
  opacity: ${({ show }) => Number(show)};
  max-height: ${({ show }) => !show && 0};
  padding: ${({ show }) => (show ? '8px 0' : 0)};
  transition-property: max-height, padding-top, padding-bottom;
  transition-duration: 0.2s;
`;

const List = styled.div<{ show: boolean }>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  padding: 0 62px 0 16px;
  column-gap: 6px;
  overflow-x: auto;
`;

const FilterChip = styled(Chip)`
  border-color: ${({ theme }) => theme.palette.common.ui90};
  gap: 2px;
  white-space: nowrap;

  & > svg {
    width: 14px;
    height: 14px;
    color: ${({ theme: { palette } }) => palette.common.ui80};
  }
`;

const ResetButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
  width: 56px;
  height: 32px;
  transform: translateY(-50%);
  background-color: #f5f6f7;

  &:before {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    right: 56px;
    width: 32px;
    height: 32px;
    background: linear-gradient(270deg, #f5f6f7 0%, rgba(245, 246, 247, 0) 100%);
    pointer-events: none;
  }
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

export default ProductsFilterHistory;
