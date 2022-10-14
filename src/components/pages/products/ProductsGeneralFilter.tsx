import { forwardRef, useCallback, useMemo } from 'react';
import type { MouseEvent, MutableRefObject } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import type { SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import {
  defaultIdFilterOptionIds,
  filterCodeIds,
  filterCodes,
  generalFilterOptions,
  idFilterIds,
  idFilterOptions,
  legitIdFilterOptionIds,
  productDynamicOptionCodeType,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import { GENERAL_FILTER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { pulse } from '@styles/transition';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
  activeTabCodeIdState,
  dynamicOptionsStateFamily,
  filterOperationInfoSelector,
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { toastState } from '@recoil/common';
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
    const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
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
    const { data: { area: { values: areaValues = [] } = {} } = {} } = useQuery(
      queryKeys.users.userInfo(),
      fetchUserInfo,
      {
        enabled: !!accessUser
      }
    );

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
      [variant, dynamicOptions, selectedSearchOptions]
    );

    const handleClickIdFilterOption = useCallback(
      (id: number, name: string, disableClickEvent = false) => {
        if (isLoading) return;

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
            idFilterIds: (searchParams.idFilterIds || []).filter((idFilterId) => idFilterId !== id)
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

        if (filterCodeIds.id === codeId && idFilterIds.lowPrice === id) {
          handleClickIdFilterOption(id, name, true);
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
      if (selectedSearchOptionsHistory.length === 0) return;

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

    return (
      <Box
        component="section"
        customStyle={{ minHeight: GENERAL_FILTER_HEIGHT, position: 'relative' }}
      >
        <Wrapper ref={ref}>
          <Flexbox gap={12} alignment="center" customStyle={{ padding: '0 16px', minHeight: 36 }}>
            {idFilterOptions
              .filter(
                ({ id }) =>
                  defaultIdFilterOptionIds.includes(id) ||
                  [
                    searchParams.idFilterIds?.some((idFilterId) =>
                      legitIdFilterOptionIds.includes(idFilterId)
                    )
                      ? searchParams.idFilterIds.find((idFilterId) =>
                          legitIdFilterOptionIds.includes(idFilterId)
                        )
                      : idFilterIds.legitAll
                  ].includes(id)
              )
              .map(({ id, name }, index) => (
                <IdFilterButton
                  key={`id-filter-option-button-${id}`}
                  ref={id === idFilterIds.legitAll ? legitFilterButtonRef : undefined}
                  isLoading={isLoading}
                  onClick={() => handleClickIdFilterOption(id, name)}
                >
                  <Icon
                    name={`CheckboxChecked${
                      (searchParams.idFilterIds || []).includes(id) ? 'Filled' : 'Outlined'
                    }`}
                    width={20}
                    height={20}
                    visibility={isLoading ? 'hidden' : 'visible'}
                    color={
                      (searchParams.idFilterIds || []).includes(id) ? primary.light : common.ui80
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
          <Box customStyle={{ minHeight: 36, width: '100%', overflowX: 'auto' }}>
            <GeneralFilterList
              hasSelectedSearchOptionsHistory={selectedSearchOptionsHistory.length > 0}
            >
              {extendsGeneralFilterOptions.map(({ codeId, id, name, count }) => {
                const active =
                  (filterCodeIds.map === codeId &&
                    selectedSearchOptions.some(
                      (selectedSearchOption) =>
                        selectedSearchOption.codeId === codeId && !!selectedSearchOption.distance
                    )) ||
                  (filterCodeIds.id === codeId &&
                    selectedSearchOptions.some(
                      (selectedSearchOption) =>
                        selectedSearchOption.codeId === codeId && selectedSearchOption.id === id
                    )) ||
                  (filterCodeIds.gender === codeId &&
                    selectedSearchOptions.some(
                      (selectedSearchOption) => selectedSearchOption.codeId === filterCodeIds.gender
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
                  >
                    <Typography variant="body1" weight="medium" customStyle={{ color: 'inherit' }}>
                      {`${name}${count > 0 ? ` ${count}` : ''}`}
                    </Typography>
                    {![filterCodeIds.map, filterCodeIds.id].includes(codeId) && (
                      <Icon
                        name="DropdownFilled"
                        viewBox="0 0 12 24"
                        width="10px"
                        height="20px"
                        visibility={isLoading ? 'hidden' : 'visible'}
                        color={active ? primary.light : common.ui60}
                      />
                    )}
                  </FilterButton>
                );
              })}
            </GeneralFilterList>
          </Box>
          <AllFilterButton show={!isLoading && selectedSearchOptionsHistory.length > 0}>
            <Button size="medium" onClick={handleClickOpenFilter}>
              <Icon name="FilterFilled" />
            </Button>
            {selectedSearchOptionsHistory.length > 0 && (
              <Badge variant="small2" weight="medium">
                {new Set(selectedSearchOptionsHistory.map((history) => history.codeId)).size || ''}
              </Badge>
            )}
          </AllFilterButton>
        </Wrapper>
      </Box>
    );
  }
);

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
  padding: 8px 0 12px;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  z-index: ${({ theme }) => theme.zIndex.header};
  width: 100%;
`;

const IdFilterButton = styled.div<{ isLoading?: boolean }>`
  display: flex;
  align-items: center;
  margin: 8px 0;
  column-gap: 4px;
  background-color: ${({ isLoading, theme: { palette } }) =>
    isLoading ? palette.common.ui95 : 'inherit'};
  cursor: pointer;

  ${({ isLoading }) =>
    isLoading && {
      animation: `${pulse} 800ms linear 0s infinite alternate`,
      cursor: 'default'
    }};
`;

const GeneralFilterList = styled.div<{ hasSelectedSearchOptionsHistory: boolean }>`
  display: flex;
  align-items: center;
  column-gap: 8px;
  width: fit-content;
  padding: ${({ hasSelectedSearchOptionsHistory }) =>
    `0 ${hasSelectedSearchOptionsHistory ? 52 : 16}px 0 16px`};
`;

const FilterButton = styled(Button)<{ active?: boolean; isLoading?: boolean }>`
  display: flex;
  align-items: center;
  row-gap: 2px;
  white-space: nowrap;
  color: ${({ active, theme: { palette } }) => active && palette.primary.light};
  background-color: ${({ active, theme: { palette } }) => active && palette.primary.highlight};

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

const AllFilterButton = styled.div<{ show: boolean }>`
  position: fixed;
  transform: translateY(123%);
  right: 0;
  padding-right: 16px;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  opacity: ${({ show }) => Number(show)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  transition: opacity 0.1s ease-in 0s;

  & > button {
    border-color: ${({ theme }) => theme.palette.primary.light};
    max-width: 36px;

    > svg {
      color: ${({ theme }) => theme.palette.primary.light};
    }
  }

  :before {
    z-index: -1;
    content: '';
    position: fixed;
    right: 46px;
    width: 38px;
    height: 100%;
    background: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
  }
`;

const Badge = styled(Typography)`
  position: absolute;
  top: -4px;
  right: 12px;
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
