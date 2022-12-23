import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent, MutableRefObject } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Toast, Typography, useTheme } from 'mrcamel-ui';
import sortBy from 'lodash-es/sortBy';
import styled, { CSSObject } from '@emotion/styled';

import { Skeleton } from '@components/UI/atoms';

import type { SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import {
  defaultIdFilterOptionIds,
  filterCodeIds,
  filterCodes,
  filterGenders,
  generalFilterOptions,
  idFilterIds,
  idFilterOptions,
  legitIdFilterOptionIds,
  productDynamicOptionCodeType,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CATEGORY_TAGS_HEIGHT,
  GENERAL_FILTER_HEIGHT,
  HEADER_HEIGHT
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';

import { pulse } from '@styles/transition';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
  activeMyFilterState,
  activeTabCodeIdState,
  dynamicOptionsStateFamily,
  filterOperationInfoSelector,
  myFilterIntersectionCategorySizesState,
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  productsStatusTriggeredStateFamily,
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { showAppDownloadBannerState, toastState } from '@recoil/common';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductsGeneralFilterProps {
  mapFilterButtonRef: MutableRefObject<HTMLButtonElement | null>;
  legitFilterButtonRef: MutableRefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  variant: ProductsVariant;
}

const ProductsGeneralFilter = forwardRef<HTMLDivElement, ProductsGeneralFilterProps>(
  function ProductsGeneralFilter(
    { mapFilterButtonRef, legitFilterButtonRef, isLoading = true, variant },
    ref
  ) {
    const {
      theme: {
        palette: { primary, common }
      }
    } = useTheme();

    const router = useRouter();
    const atomParam = router.asPath.split('?')[0];

    const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
    const progressDone = useRecoilValue(productsFilterProgressDoneState);
    const [{ searchParams }, setSearchParamsState] = useRecoilState(
      searchParamsStateFamily(`search-${atomParam}`)
    );
    const setSearchOptionsParamsState = useSetRecoilState(
      searchParamsStateFamily(`searchOptions-${atomParam}`)
    );
    const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
      selectedSearchOptionsStateFamily(`active-${atomParam}`)
    );
    const [activeMyFilter, setActiveMyFilterState] = useRecoilState(activeMyFilterState);
    const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
    const { searchParams: baseSearchParams } = useRecoilValue(
      searchParamsStateFamily(`base-${atomParam}`)
    );
    const { searchOptions: baseSearchOptions } = useRecoilValue(
      searchOptionsStateFamily(`base-${atomParam}`)
    );
    const myFilterIntersectionCategorySizes = useRecoilValue(
      myFilterIntersectionCategorySizesState
    );
    const { triggered: productsStatusTriggered } = useRecoilValue(
      productsStatusTriggeredStateFamily(atomParam)
    );
    const setBackupSelectedSearchOptionsState = useSetRecoilState(
      selectedSearchOptionsStateFamily(`backup-${atomParam}`)
    );
    const setProductsFilterState = useSetRecoilState(
      productsFilterStateFamily(`general-${atomParam}`)
    );
    const dynamicOptions = useRecoilValue(dynamicOptionsStateFamily(atomParam));
    const setProductsLegitFilterState = useSetRecoilState(
      productsFilterStateFamily(`legit-${atomParam}`)
    );
    const setActiveTabCodeIdState = useSetRecoilState(activeTabCodeIdState);
    const setToastState = useSetRecoilState(toastState);

    const { data: accessUser } = useQueryAccessUser();
    const {
      data: {
        info: { value: { gender = '' } = {} } = {},
        area: { values: areaValues = [] } = {},
        size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
      } = {}
    } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
      enabled: !!accessUser
    });

    const triggered = useReverseScrollTrigger();

    const [open, setOpen] = useState(false);
    const [activeToastOpen, setActiveToastOpen] = useState(false);
    const [inactiveToastOpen, setInActiveToastOpen] = useState(false);
    const [selectedSearchOptionsHistoryCount, setSelectedSearchOptionsHistoryCount] = useState(0);

    const extendsGeneralFilterOptions = useMemo(
      () =>
        generalFilterOptions[variant]
          // 다이나믹 필터에 가격필터가 없을 경우에만 시세이하 필터 노출
          .filter(
            (option) =>
              !(
                option.codeId === filterCodeIds.id &&
                option.id === idFilterIds.lowPrice &&
                dynamicOptions.length > 0 &&
                dynamicOptions.some(
                  (dynamicOption) => dynamicOption.codeType === productDynamicOptionCodeType.price
                )
              )
          )
          .filter(({ codeId }) => {
            if (codeId === filterCodeIds.my) {
              return accessUser && (tops.length || bottoms.length || shoes.length);
            }
            return true;
          })
          .map((option) => {
            const selectedGenderSearchOptions =
              selectedSearchOptions.filter(({ codeId }) => codeId === filterCodeIds.gender) || [];

            return {
              ...option,
              name:
                (option.codeId === filterCodeIds.gender &&
                  selectedGenderSearchOptions.length === 1 &&
                  selectedGenderSearchOptions[0].viewName) ||
                option.name,
              count: [filterCodeIds.map, filterCodeIds.id, filterCodeIds.gender].includes(
                option.codeId
              )
                ? 0
                : selectedSearchOptions.filter((selectedSearchOption) =>
                    option.codeId === filterCodeIds.detailOption
                      ? [
                          filterCodeIds.season,
                          filterCodeIds.color,
                          filterCodeIds.material
                        ].includes(selectedSearchOption.codeId)
                      : selectedSearchOption.codeId === option.codeId
                  ).length
            };
          }),
      [
        variant,
        dynamicOptions,
        accessUser,
        tops.length,
        bottoms.length,
        shoes.length,
        selectedSearchOptions
      ]
    );

    const handleClickMyFilter = useCallback(() => {
      if (!activeMyFilter && !myFilterIntersectionCategorySizes.length) {
        setOpen(true);
        return;
      }

      logEvent(attrKeys.products.clickMyFilter, {
        name: attrProperty.name.productList,
        att: !activeMyFilter ? 'ON' : 'OFF'
      });

      const { categorySizes = [], genderCategories = [] } = baseSearchOptions;

      const needGender = variant === 'search' && gender && gender !== 'N';
      const intersectionParentCategoryIds = Array.from(
        new Set(myFilterIntersectionCategorySizes.map(({ parentCategoryId }) => parentCategoryId))
      );
      const notIntersectionCategorySizes = categorySizes.filter(
        ({ parentCategoryId }) => !intersectionParentCategoryIds.includes(parentCategoryId)
      );
      let genderId = 0;
      let newSelectedSearchOptions: SelectedSearchOption[] = [];
      if (gender === 'M') genderId = filterGenders.male.id;
      if (gender === 'F') genderId = filterGenders.female.id;

      if (!activeMyFilter && myFilterIntersectionCategorySizes.length) {
        setActiveToastOpen(true);
        setInActiveToastOpen(false);
        newSelectedSearchOptions = [
          ...selectedSearchOptions,
          ...myFilterIntersectionCategorySizes.filter(
            ({ categorySizeId, parentCategoryId, viewSize }) =>
              !selectedSearchOptions.find(
                ({
                  categorySizeId: intersectionCategorySizeId,
                  parentCategoryId: intersectionParentCategoryId,
                  viewSize: intersectionViewSize
                }) =>
                  categorySizeId === intersectionCategorySizeId &&
                  parentCategoryId === intersectionParentCategoryId &&
                  viewSize === intersectionViewSize
              )
          ),
          ...sortBy(notIntersectionCategorySizes, 'parentCategoryId')
        ];

        if (needGender)
          newSelectedSearchOptions = [
            ...newSelectedSearchOptions,
            ...genderCategories
              .filter(({ id }) => id === genderId)
              .map(({ subParentCategories }) => subParentCategories)
              .flat()
              .map((subParentCategory) => ({
                ...subParentCategory,
                codeId: filterCodeIds.category,
                genderIds: [genderId, filterGenders.common.id]
              }))
          ];
      } else {
        setActiveToastOpen(false);
        setInActiveToastOpen(true);
        newSelectedSearchOptions = selectedSearchOptions.filter(
          ({ categorySizeId, parentCategoryId, viewSize }) =>
            ![...myFilterIntersectionCategorySizes, ...notIntersectionCategorySizes].find(
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

        if (needGender)
          newSelectedSearchOptions = newSelectedSearchOptions.filter(
            ({ codeId, genderIds = [] }) => {
              const [selectedGenderId] = genderIds.filter((id) => id !== filterGenders.common.id);

              return codeId !== filterCodeIds.category && selectedGenderId !== genderId;
            }
          );
      }

      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: newSelectedSearchOptions
      }));
      setSearchParamsState(({ type }) => ({
        type,
        searchParams: convertSearchParams(newSelectedSearchOptions, {
          baseSearchParams
        })
      }));
      setSearchOptionsParamsState(({ type }) => ({
        type,
        searchParams: convertSearchParams(newSelectedSearchOptions, {
          baseSearchParams
        })
      }));
      setActiveMyFilterState(!activeMyFilter);
    }, [
      activeMyFilter,
      baseSearchOptions,
      baseSearchParams,
      gender,
      myFilterIntersectionCategorySizes,
      selectedSearchOptions,
      setActiveMyFilterState,
      setSearchOptionsParamsState,
      setSearchParamsState,
      setSelectedSearchOptionsState,
      variant
    ]);

    const handleClickIdFilterOption = useCallback(
      (id: number, name: string, disableClickEvent = false) =>
        () => {
          if (isLoading) return;
          if (variant === 'camel' && id === 5) return;

          if (legitIdFilterOptionIds.includes(id)) {
            logEvent(attrKeys.products.CLICK_LEGIT_FILTER, {
              name: attrProperty.productName.PRODUCT_LIST,
              att: (searchParams.idFilterIds || []).some((idFilterId) =>
                legitIdFilterOptionIds.includes(idFilterId)
              )
                ? 'OFF'
                : 'ON'
            });
          } else if (!disableClickEvent) {
            logEvent(attrKeys.products.clickApplyIdFilter);
          }

          const selectedIdFilterOptionIndex = selectedSearchOptions.findIndex(
            (selectedSearchOption) =>
              selectedSearchOption.codeId === filterCodeIds.id && selectedSearchOption.id === id
          );
          let newSelectedSearchOptions: SelectedSearchOption[];
          let newSearchParams: Partial<SearchParams>;

          if (selectedIdFilterOptionIndex > -1) {
            newSelectedSearchOptions = selectedSearchOptions.filter(
              (_, index) => index !== selectedIdFilterOptionIndex
            );
            newSearchParams = {
              ...searchParams,
              idFilterIds: (searchParams.idFilterIds || []).filter(
                (idFilterId) => idFilterId !== id
              )
            };
          } else {
            if (!legitIdFilterOptionIds.includes(id)) {
              logEvent(attrKeys.products.selectIdFilter, {
                name: attrProperty.name.productList,
                att: name
              });
            }

            newSelectedSearchOptions = selectedSearchOptions.concat({
              id,
              codeId: filterCodeIds.id
            });
            newSearchParams = {
              ...searchParams,
              idFilterIds: (searchParams.idFilterIds || []).concat(id)
            };

            if (id === idFilterIds.lowPrice) {
              newSelectedSearchOptions = newSelectedSearchOptions.filter(
                ({ codeId }) => codeId !== filterCodeIds.price
              );
              delete newSearchParams.minPrice;
              delete newSearchParams.maxPrice;
            }
          }

          setSelectedSearchOptionsState(({ type }) => ({
            type,
            selectedSearchOptions: newSelectedSearchOptions
          }));
          setSearchParamsState(({ type }) => ({
            type,
            searchParams: newSearchParams
          }));
          setSearchOptionsParamsState(({ type }) => ({
            type,
            searchParams: newSearchParams
          }));
        },
      [
        isLoading,
        variant,
        searchParams,
        selectedSearchOptions,
        setSearchOptionsParamsState,
        setSearchParamsState,
        setSelectedSearchOptionsState
      ]
    );

    const handleClickLegitFilter = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        if (isLoading) return;

        setProductsLegitFilterState(({ type }) => ({ type, open: true }));
      },
      [isLoading, setProductsLegitFilterState]
    );

    const handleClickFilterOption = useCallback(
      (codeId: number, id: number | undefined, name: string) => () => {
        if (filterCodeIds.map === codeId) {
          logEvent(attrKeys.products.clickApplyMapFilter);

          if (!accessUser) {
            setToastState({
              type: 'mapFilter',
              status: 'signIn',
              action: () => {
                logEvent(attrKeys.products.clickLogin, {
                  name: attrProperty.name.filterMapToast
                });
                router.push({ pathname: '/login', query: { returnUrl: '/user/addressInput' } });
              }
            });
            return;
          }

          if (accessUser && areaValues.length === 0) {
            setToastState({
              type: 'mapFilter',
              status: 'locationInfo',
              action: () => {
                logEvent(attrKeys.products.clickPersonalInput, {
                  name: attrProperty.name.filterMapToast,
                  att: 'NEW'
                });
                router.push('/user/addressInput');
              }
            });
            return;
          }

          setSelectedSearchOptionsState(
            ({ type, selectedSearchOptions: prevSelectedSearchOptions }) => ({
              type,
              selectedSearchOptions: prevSelectedSearchOptions.some(
                (prevSelectedSearchOption) => prevSelectedSearchOption.codeId === filterCodeIds.map
              )
                ? prevSelectedSearchOptions.filter(
                    (prevSelectedSearchOption) =>
                      prevSelectedSearchOption.codeId !== filterCodeIds.map
                  )
                : prevSelectedSearchOptions.concat([{ codeId, distance: 10 }])
            })
          );
          setSearchParamsState(
            ({ type, searchParams: { distance: prevDistance, ...prevSearchParams } }) => ({
              type,
              searchParams: prevDistance ? prevSearchParams : { ...prevSearchParams, distance: 10 }
            })
          );
          setSearchOptionsParamsState(
            ({ type, searchParams: { distance: prevDistance, ...prevSearchParams } }) => ({
              type,
              searchParams: prevDistance ? prevSearchParams : { ...prevSearchParams, distance: 10 }
            })
          );

          return;
        }

        if (filterCodeIds.my === codeId) {
          handleClickMyFilter();
          return;
        }

        if (filterCodeIds.id === codeId && idFilterIds.lowPrice === id) {
          handleClickIdFilterOption(id, name, true)();
          return;
        }

        logEvent(attrKeys.products.clickFilter, {
          name: attrProperty.name.productList,
          title: productFilterEventPropertyTitle[codeId],
          keyword: router.query.keyword
        });
        setProductsFilterState(({ type }) => ({
          type,
          open: true
        }));
        setActiveTabCodeIdState(codeId);
        setBackupSelectedSearchOptionsState(({ type }) => ({
          type,
          selectedSearchOptions
        }));
      },
      [
        accessUser,
        areaValues.length,
        handleClickIdFilterOption,
        handleClickMyFilter,
        router,
        selectedSearchOptions,
        setActiveTabCodeIdState,
        setBackupSelectedSearchOptionsState,
        setProductsFilterState,
        setSearchOptionsParamsState,
        setSearchParamsState,
        setSelectedSearchOptionsState,
        setToastState
      ]
    );

    const handleClickOpenFilter = () => {
      logEvent(attrKeys.products.clickFilter, {
        name: attrProperty.name.productList,
        title: attrProperty.title.all,
        keyword: router.query?.keyword
      });
      setProductsFilterState(({ type }) => ({ type, open: true }));
      setActiveTabCodeIdState(filterCodes[variant][0].codeId);
      setBackupSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions
      }));
    };

    useEffect(() => {
      setSelectedSearchOptionsHistoryCount(
        new Set(selectedSearchOptionsHistory.map((history) => history.codeId)).size
      );
    }, [selectedSearchOptionsHistory]);

    return (
      <>
        <StyledGeneralFilter
          variant={variant}
          showAppDownloadBanner={showAppDownloadBanner}
          triggered={triggered}
          productsStatusTriggered={productsStatusTriggered}
        >
          <Box
            customStyle={{
              minHeight: GENERAL_FILTER_HEIGHT,
              position: 'relative'
            }}
          >
            <Wrapper ref={ref}>
              <Flexbox
                gap={12}
                alignment="center"
                customStyle={{ padding: '0 16px', minHeight: 36, overflowX: 'auto' }}
              >
                {idFilterOptions
                  .filter(({ id }) => defaultIdFilterOptionIds.includes(id))
                  .map(({ id, name }, index) => (
                    <IdFilterButton
                      key={`id-filter-option-button-${id}`}
                      ref={id === idFilterIds.legitAll ? legitFilterButtonRef : undefined}
                      isLoading={isLoading}
                      onClick={handleClickIdFilterOption(id, name)}
                    >
                      <Icon
                        name={`CheckboxChecked${
                          (searchParams.idFilterIds || []).includes(id) ? 'Filled' : 'Outlined'
                        }`}
                        width={20}
                        height={20}
                        visibility={isLoading ? 'hidden' : 'visible'}
                        color={
                          (searchParams.idFilterIds || []).includes(id)
                            ? primary.light
                            : common.ui80
                        }
                      />
                      <Flexbox
                        alignment="center"
                        gap={4}
                        onClick={
                          legitIdFilterOptionIds.includes(id) ? handleClickLegitFilter : undefined
                        }
                      >
                        <Typography
                          variant="body1"
                          weight={index === 0 ? 'bold' : 'regular'}
                          customStyle={{ color: isLoading ? common.ui95 : common.ui20 }}
                        >
                          {!(searchParams.idFilterIds || []).includes(id) &&
                          legitIdFilterOptionIds.includes(id)
                            ? '사진감정'
                            : name}
                        </Typography>
                        {legitIdFilterOptionIds.includes(id) && (
                          <Icon
                            name="DropdownFilled"
                            viewBox="0 0 12 24"
                            width="10px"
                            height="20px"
                            visibility={isLoading ? 'hidden' : 'visible'}
                            color={common.ui60}
                          />
                        )}
                      </Flexbox>
                    </IdFilterButton>
                  ))}
              </Flexbox>
              <GeneralFilterList>
                <Box
                  onClick={handleClickOpenFilter}
                  customStyle={{
                    position: 'relative',
                    marginRight: 4
                  }}
                >
                  {isLoading ? (
                    <Skeleton
                      width="68px"
                      height="36px"
                      disableAspectRatio
                      isRound
                      customStyle={{ backgroundColor: common.ui95 }}
                    />
                  ) : (
                    <Button
                      brandColor={selectedSearchOptionsHistoryCount > 0 ? 'primary' : 'black'}
                      size="medium"
                      startIcon={<Icon name="FilterFilled" />}
                      customStyle={{
                        minWidth: 68
                      }}
                    >
                      필터
                    </Button>
                  )}
                  {!isLoading && selectedSearchOptionsHistoryCount > 0 && (
                    <Badge variant="small2" weight="medium">
                      {selectedSearchOptionsHistoryCount}
                    </Badge>
                  )}
                </Box>
                {extendsGeneralFilterOptions.map(({ codeId, id, name, count }) => {
                  const active =
                    (filterCodeIds.map === codeId &&
                      selectedSearchOptions.some(
                        (selectedSearchOption) =>
                          selectedSearchOption.codeId === codeId && !!selectedSearchOption.distance
                      )) ||
                    (filterCodeIds.my === codeId && activeMyFilter) ||
                    (filterCodeIds.id === codeId &&
                      selectedSearchOptions.some(
                        (selectedSearchOption) =>
                          selectedSearchOption.codeId === codeId && selectedSearchOption.id === id
                      )) ||
                    (filterCodeIds.gender === codeId &&
                      selectedSearchOptions.some(
                        (selectedSearchOption) =>
                          selectedSearchOption.codeId === filterCodeIds.gender
                      )) ||
                    count > 0;

                  return (
                    <FilterButton
                      key={`filter-option-button-${codeId}`}
                      ref={filterCodeIds.map === codeId ? mapFilterButtonRef : undefined}
                      variant="ghost"
                      brandColor="black"
                      isLoading={isLoading}
                      disabled={isLoading}
                      onClick={handleClickFilterOption(codeId, id, name)}
                      active={progressDone && active}
                      data-code-id={codeId}
                      endIcon={
                        ![filterCodeIds.map, filterCodeIds.id, filterCodeIds.my].includes(
                          codeId
                        ) ? (
                          <Icon
                            name="DropdownFilled"
                            viewBox="0 0 12 24"
                            width="10px"
                            height="20px"
                            visibility={isLoading ? 'hidden' : 'visible'}
                            color={active ? primary.light : common.ui60}
                          />
                        ) : undefined
                      }
                    >
                      {`${name}${count > 0 ? ` ${count}` : ''}`}
                    </FilterButton>
                  );
                })}
              </GeneralFilterList>
            </Wrapper>
          </Box>
        </StyledGeneralFilter>
        <Toast open={open} onClose={() => setOpen(false)}>
          필터 설정에 일치하는 중고매물이 없습니다😭
        </Toast>
        <Toast open={activeToastOpen} onClose={() => setActiveToastOpen(false)}>
          내 사이즈만 보기를 적용했어요!
        </Toast>
        <Toast open={inactiveToastOpen} onClose={() => setInActiveToastOpen(false)}>
          내 사이즈만 보기를 해제했어요!
        </Toast>
      </>
    );
  }
);

const StyledGeneralFilter = styled.section<{
  variant?: ProductsVariant;
  showAppDownloadBanner: boolean;
  triggered?: boolean;
  productsStatusTriggered?: boolean;
}>`
  position: sticky;
  ${({ productsStatusTriggered }): CSSObject =>
    productsStatusTriggered
      ? {
          opacity: 0
        }
      : {}};

  top: ${({ variant, showAppDownloadBanner }) => {
    if (variant === 'search') {
      return showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT;
    }

    return showAppDownloadBanner
      ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT
      : HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT;
  }}px;

  ${({ triggered, productsStatusTriggered }): CSSObject => {
    if (!triggered && productsStatusTriggered) {
      return {
        transform: 'translateY(-30px)',
        opacity: 0,
        pointerEvents: 'none'
      };
    }
    if (triggered && productsStatusTriggered) {
      return {
        opacity: 1
      };
    }
    return {};
  }};

  border-bottom: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.ui95};
  z-index: ${({ theme: { zIndex } }) => zIndex.header - 1};
  transition: top 0.5s, opacity 0.2s, transform 0.2s;
`;

const Wrapper = styled.div`
  padding: 8px 0 12px;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  z-index: ${({ theme }) => theme.zIndex.header - 1};
  width: 100%;
`;

const IdFilterButton = styled.div<{ isLoading?: boolean }>`
  display: flex;
  align-items: center;
  margin: 8px 0;
  column-gap: 4px;
  background-color: ${({ isLoading, theme: { palette } }) =>
    isLoading ? palette.common.ui95 : 'inherit'};
  white-space: nowrap;
  cursor: pointer;

  ${({ isLoading }) =>
    isLoading && {
      animation: `${pulse} 800ms linear 0s infinite alternate`,
      cursor: 'default'
    }};
`;

const GeneralFilterList = styled.div`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  padding: 8px 16px 0;
  min-height: 26px;
  overflow-x: auto;
`;

const FilterButton = styled(Button)<{ active?: boolean; isLoading?: boolean }>`
  display: flex;
  align-items: center;
  row-gap: 2px;
  white-space: nowrap;
  color: ${({ active, theme: { palette } }) => active && palette.primary.light};

  ${({ isLoading, theme: { palette } }) =>
    isLoading && {
      animation: `${pulse} 800ms linear 0s infinite alternate`,
      '&:disabled': {
        color: palette.common.ui95,
        backgroundColor: palette.common.ui95,
        cursor: 'default'
      }
    }};

  & > div {
    color: inherit;
  }

  & > svg {
    color: inherit;
    width: 10px;
    height: 24px !important;
  }
`;

const Badge = styled(Typography)`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.light};

  display: flex;
  justify-content: center;
  align-items: center;
`;

export default ProductsGeneralFilter;
