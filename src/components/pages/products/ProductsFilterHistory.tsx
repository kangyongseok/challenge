import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import isEmpty from 'lodash-es/isEmpty';
import { debounce } from 'lodash-es';
import Toast from '@mrcamelhub/camel-ui-toast';
import { Avatar, Chip, Icon } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { logEvent } from '@library/amplitude';

import {
  filterCodeIds,
  filterColors,
  filterGenders,
  filterImageColorNames,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CATEGORY_TAGS_HEIGHT,
  GENERAL_FILTER_HEIGHT,
  HEADER_HEIGHT,
  ID_FILTER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import type {
  ProductsVariant,
  SelectedSearchOption,
  SelectedSearchOptionHistory
} from '@typings/products';
import {
  activeMyFilterState,
  filterHistoryOpenStateFamily,
  filterOperationInfoSelector,
  myFilterIntersectionCategorySizesState,
  productsFilterProgressDoneState,
  productsStatusTriggeredStateFamily,
  searchAgainInputOpenStateFamily,
  searchAgainKeywordStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

interface ProductsFilterHistoryProps {
  variant: ProductsVariant;
}

function ProductsFilterHistory({ variant }: ProductsFilterHistoryProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const triggered = useReverseScrollTrigger();

  const [{ open: openFilterHistory }, setFilterHistoryOpenStateFamily] = useRecoilState(
    filterHistoryOpenStateFamily(atomParam)
  );
  const [activeMyFilter, setActiveMyFilterState] = useRecoilState(activeMyFilterState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const { searchParams: baseSearchParams } = useRecoilValue(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const { triggered: productsStatusTriggered } = useRecoilValue(
    productsStatusTriggeredStateFamily(atomParam)
  );
  const myFilterIntersectionCategorySizes = useRecoilValue(myFilterIntersectionCategorySizesState);
  const setSearchOptionsParamsState = useSetRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setSearchAgainInputOpenStateFamily = useSetRecoilState(
    searchAgainInputOpenStateFamily(atomParam)
  );
  const setSearchAgainKeywordtateFamily = useSetRecoilState(
    searchAgainKeywordStateFamily(atomParam)
  );
  const resetSearchAgainKeywordStateFamily = useResetRecoilState(
    searchAgainKeywordStateFamily(atomParam)
  );

  const [open, setOpen] = useState(false);
  const [filteredSelectedSearchOptionsHistory, setFilteredSelectedSearchOptionsHistory] = useState<
    typeof selectedSearchOptionsHistory
  >([]);

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
    (e: MouseEvent<HTMLOrSVGElement>) => {
      e.stopPropagation();

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
        if (selectedCodeId === filterCodeIds.title) {
          resetSearchAgainKeywordStateFamily();
        }
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
    resetSearchAgainKeywordStateFamily();
  };

  const handleClickSearchAgainFilter = (searchAgainKeyword: string) => () => {
    setSearchAgainKeywordtateFamily(({ type }) => ({
      type,
      searchAgainKeyword
    }));
    setSearchAgainInputOpenStateFamily(({ type }) => ({
      type,
      open: true
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

  useEffect(() => {
    const newFilteredSelectedSearchOptionsHistory = selectedSearchOptionsHistory.filter(
      ({ id, codeId }) => !(variant === 'camel' && codeId === filterCodeIds.id && id === 5)
    );
    setFilteredSelectedSearchOptionsHistory(newFilteredSelectedSearchOptionsHistory);
    setFilterHistoryOpenStateFamily(({ type }) => ({
      type,
      open: newFilteredSelectedSearchOptionsHistory.length > 0
    }));
  }, [setFilterHistoryOpenStateFamily, variant, selectedSearchOptionsHistory]);

  return progressDone ? (
    <>
      <Wrapper
        open={openFilterHistory}
        variant={variant}
        triggered={triggered}
        showAppDownloadBanner={showAppDownloadBanner}
        productsStatusTriggered={productsStatusTriggered}
      >
        <List onScroll={handleScroll}>
          {filteredSelectedSearchOptionsHistory.map((selectedSearchOptionHistory) => (
            <FilterChip
              key={`selected-filter-options-history-${selectedSearchOptionHistory.index || 0}-${
                selectedSearchOptionHistory.displayName
              }`}
              weight="regular"
              startIcon={
                selectedSearchOptionHistory.codeId === filterCodeIds.title ? (
                  <Icon
                    name="SearchOutlined"
                    width={20}
                    height={20}
                    color="ui60"
                    customStyle={{
                      width: '20px !important',
                      height: '20px !important'
                    }}
                  />
                ) : undefined
              }
              endIcon={
                <Icon
                  name="CloseOutlined"
                  color="ui60"
                  onClick={handleClickRemove(selectedSearchOptionHistory)}
                />
              }
              onClick={
                selectedSearchOptionHistory.codeId === filterCodeIds.title
                  ? handleClickSearchAgainFilter(selectedSearchOptionHistory.displayName)
                  : handleClickRemove(selectedSearchOptionHistory)
              }
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
          <Icon name="RotateOutlined" color="ui60" onClick={handleClickReset} />
        </ResetButton>
      </Wrapper>
      <Toast open={open} onClose={() => setOpen(false)}>
        내 사이즈만 보기를 해제했어요!
      </Toast>
    </>
  ) : null;
}

const Wrapper = styled.section<{
  open: boolean;
  variant: ProductsVariant;
  showAppDownloadBanner: boolean;
  triggered: boolean;
  productsStatusTriggered: boolean;
}>`
  position: sticky;

  ${({ open, productsStatusTriggered }): CSSObject =>
    !open || productsStatusTriggered
      ? {
          opacity: 0
        }
      : {}};

  top: ${({ variant, showAppDownloadBanner }) => {
    if (variant === 'search') {
      return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
        showAppDownloadBanner
          ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT
          : HEADER_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT
      }px)`;
    }

    return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
      showAppDownloadBanner
        ? APP_DOWNLOAD_BANNER_HEIGHT +
          HEADER_HEIGHT +
          CATEGORY_TAGS_HEIGHT +
          ID_FILTER_HEIGHT +
          GENERAL_FILTER_HEIGHT
        : HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT + ID_FILTER_HEIGHT + GENERAL_FILTER_HEIGHT
    }px)`;
  }};

  ${({ open, triggered, productsStatusTriggered }): CSSObject => {
    if (open && !triggered && productsStatusTriggered) {
      return {
        transform: 'translateY(-30px)',
        opacity: 0,
        pointerEvents: 'none'
      };
    }
    if (open && triggered && productsStatusTriggered) {
      return {
        opacity: 1
      };
    }
    return {};
  }};

  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg03};
  max-height: ${({ open }) => !open && 0};
  padding: ${({ open }) => (open ? '12px 0' : 0)};
  z-index: ${({ theme }) => theme.zIndex.header - 1};
  transition: max-height 0.2s, padding-top 0.2s, padding-bottom 0.2s, opacity 0.2s, transform 0.2s,
    top 0.5s;
`;

const List = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  padding: 0 62px 0 20px;
  column-gap: 6px;
  overflow-x: auto;
`;

const FilterChip = styled(Chip)`
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
