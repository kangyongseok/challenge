import { forwardRef, useEffect, useState } from 'react';
import type { MutableRefObject } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import sortBy from 'lodash-es/sortBy';
import { useQuery } from '@tanstack/react-query';
import Toast, { useToastStack } from '@mrcamelhub/camel-ui-toast';
import {
  Box,
  Button,
  CheckboxGroup,
  Flexbox,
  Icon,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import type { SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import {
  filterCodeIds,
  filterCodes,
  filterGenders,
  generalFilterOptions,
  idFilterIds,
  legitIdFilterOptionIds,
  productFilterEventPropertyTitle
} from '@constants/productsFilter';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  CATEGORY_TAGS_HEIGHT,
  HEADER_HEIGHT,
  ID_FILTER_HEIGHT,
  IOS_SAFE_AREA_TOP
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { convertSearchParams } from '@utils/products';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
  activeMyFilterState,
  activeTabCodeIdState,
  filterOperationInfoSelector,
  myFilterIntersectionCategorySizesState,
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  productsStatusTriggeredStateFamily,
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import { showAppDownloadBannerState, userOnBoardingTriggerState } from '@recoil/common';
import useSession from '@hooks/useSession';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';

interface ProductsGeneralFilterProps {
  aiFilterGroupRef: MutableRefObject<HTMLDivElement | null>;
  camelAuthFilterRef: MutableRefObject<HTMLButtonElement | null>;
  isLoading?: boolean;
  variant: ProductsVariant;
  openMyFilterTooltip: boolean;
  onClickMyFilterTooltip: () => void;
}

const ProductsGeneralFilter = forwardRef<HTMLDivElement, ProductsGeneralFilterProps>(
  function ProductsGeneralFilter(
    {
      camelAuthFilterRef,
      aiFilterGroupRef,
      isLoading = true,
      variant,
      openMyFilterTooltip,
      onClickMyFilterTooltip
    },
    ref
  ) {
    const router = useRouter();
    const { keyword, parentIds, subParentIds } = router.query;

    const {
      theme: {
        palette: { primary, common }
      }
    } = useTheme();

    const toastStack = useToastStack();

    const atomParam = router.asPath.split('?')[0];

    const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
    const progressDone = useRecoilValue(productsFilterProgressDoneState);
    const [{ searchParams }, setSearchParamsState] = useRecoilState(
      searchParamsStateFamily(`search-${atomParam}`)
    );

    const setSearchOptionsParamsState = useSetRecoilState(
      searchParamsStateFamily(`searchOptions-${atomParam}`)
    );
    const {
      products: { complete, step }
    } = useRecoilValue(userOnBoardingTriggerState);
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

    const setActiveTabCodeIdState = useSetRecoilState(activeTabCodeIdState);

    const { isLoggedIn } = useSession();
    const {
      data: {
        info: { value: { gender = '' } = {} } = {},
        area: { values: areaValues = [] } = {},
        size: { value: { tops = '', bottoms = '', shoes = '' } = {} } = {}
      } = {}
    } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
      enabled: isLoggedIn
    });

    const triggered = useReverseScrollTrigger();

    const [open, setOpen] = useState(false);
    const [activeToastOpen, setActiveToastOpen] = useState(false);
    const [inactiveToastOpen, setInActiveToastOpen] = useState(false);
    const [showMySizeFilter, setShowMySizeFilter] = useState(false);
    const [selectedSearchOptionsHistoryCount, setSelectedSearchOptionsHistoryCount] = useState(0);
    const [extendsGeneralFilterOptions, setExtendsGeneralFilterOptions] = useState<
      { name: string; count: number; codeId: number }[]
    >([]);

    const handleClickMyFilter = () => {
      if (!isLoggedIn) {
        toastStack({
          children: '로그인이 필요해요',
          action: {
            text: '로그인하기',
            onClick: () => {
              logEvent(attrKeys.products.clickLogin, {
                name: attrProperty.name.filterMapToast
              });
              router.push({ pathname: '/login' });
            }
          }
        });
        return;
      }

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
    };

    const handleClickIdFilterOption =
      (id: number, name: string, disableClickEvent = false) =>
      () => {
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
      };

    const handleClickFilterOption =
      (codeId: number, id: number | undefined, name: string) => () => {
        if (filterCodeIds.map === codeId) {
          logEvent(attrKeys.products.clickApplyMapFilter);

          if (!isLoggedIn) {
            toastStack({
              children: '로그인이 필요해요',
              action: {
                text: '로그인하기',
                onClick: () => {
                  logEvent(attrKeys.products.clickLogin, {
                    name: attrProperty.name.filterMapToast
                  });
                  router.push({ pathname: '/login', query: { returnUrl: '/user/addressInput' } });
                }
              }
            });
            return;
          }

          if (isLoggedIn && areaValues.length === 0) {
            toastStack({
              children: '위치 정보가 필요해요!',
              action: {
                text: '입력하기',
                onClick: () => {
                  logEvent(attrKeys.products.clickPersonalInput, {
                    name: attrProperty.name.filterMapToast,
                    att: 'NEW'
                  });
                  router.push('/user/addressInput');
                }
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

        if (filterCodeIds.safePayment === codeId) {
          handleClickIdFilterOption(6, name, true)();
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
      };

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
      setExtendsGeneralFilterOptions(
        generalFilterOptions[variant]
          .filter(({ codeId }) => {
            if (codeId === filterCodeIds.my) {
              return isLoggedIn && (tops.length || bottoms.length || shoes.length);
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
          })
      );
    }, [bottoms, isLoggedIn, selectedSearchOptions, shoes, tops, variant]);

    useEffect(() => {
      setSelectedSearchOptionsHistoryCount(
        new Set(selectedSearchOptionsHistory.map((history) => history.codeId)).size
      );
    }, [selectedSearchOptionsHistory]);

    useEffect(() => {
      let newShowMySizeFilter = false;

      if (variant === 'categories') {
        newShowMySizeFilter = ['아우터', '상의', '하의', '원피스', '기타의류', '신발'].includes(
          String(keyword)
        );
      } else if (variant === 'brands' || variant === 'camel') {
        newShowMySizeFilter =
          (!parentIds && !subParentIds) || [119, 97, 104, 282, 283, 14].includes(Number(parentIds));
      } else if (variant === 'search') {
        newShowMySizeFilter =
          baseSearchOptions?.parentCategories?.some(({ id }) =>
            [119, 97, 104, 282, 283, 14].includes(id)
          ) || false;
      }

      if (!newShowMySizeFilter) {
        newShowMySizeFilter = !complete || !step;
      }

      setShowMySizeFilter(newShowMySizeFilter);
    }, [variant, keyword, parentIds, subParentIds, baseSearchOptions, complete, step]);

    return (
      <>
        <StyledGeneralFilter variant={variant} showAppDownloadBanner={showAppDownloadBanner}>
          <Box
            customStyle={{
              position: 'relative'
            }}
          >
            <Wrapper>
              <Flexbox
                gap={8}
                customStyle={{
                  minHeight: 36
                }}
              >
                {isLoading && (
                  <>
                    <Flexbox alignment="center" gap={4}>
                      <Skeleton width={20} height={20} round="50%" disableAspectRatio />
                      <Skeleton width={50} height={20} round={8} disableAspectRatio />
                    </Flexbox>
                    <Flexbox alignment="center" gap={4}>
                      <Skeleton width={20} height={20} round="50%" disableAspectRatio />
                      <Skeleton width={50} height={20} round={8} disableAspectRatio />
                    </Flexbox>
                    <Flexbox alignment="center" gap={4}>
                      <Skeleton width={20} height={20} round="50%" disableAspectRatio />
                      <Skeleton width={50} height={20} round={8} disableAspectRatio />
                    </Flexbox>
                  </>
                )}
                {!isLoading && (
                  <>
                    {showMySizeFilter && (
                      <Box
                        customStyle={{
                          '& > div': {
                            display: 'flex',
                            height: '100%'
                          }
                        }}
                      >
                        <Tooltip
                          open={openMyFilterTooltip}
                          message={
                            <Flexbox gap={8} alignment="center">
                              <Typography variant="body2" weight="medium" color="uiWhite">
                                내 사이즈만 보기가 켜져 있어요!
                              </Typography>
                              <Typography
                                variant="body2"
                                weight="medium"
                                onClick={onClickMyFilterTooltip}
                                color="ui80"
                                customStyle={{
                                  textDecoration: 'underline',
                                  cursor: 'pointer'
                                }}
                              >
                                필터끄기
                              </Typography>
                            </Flexbox>
                          }
                          triangleLeft={20}
                          customStyle={{
                            top: 20,
                            left: 110,
                            height: 'fit-content'
                          }}
                        >
                          <CheckboxGroup
                            ref={ref}
                            isRound={false}
                            value={filterCodeIds.my}
                            text="내 사이즈"
                            checked={activeMyFilter || (!complete && !step)}
                            onChange={handleClickMyFilter}
                            customStyle={{
                              fontFamily: 'NanumSquareNeo',
                              fontSize: 13,
                              fontWeight: 700
                            }}
                          />
                        </Tooltip>
                      </Box>
                    )}
                    <Flexbox ref={aiFilterGroupRef} gap={8}>
                      <CheckboxGroup
                        isRound={false}
                        text="새상품급"
                        value={idFilterIds.new}
                        checked={
                          (searchParams.idFilterIds || []).includes(idFilterIds.new) ||
                          (!complete && step === 1)
                        }
                        onChange={handleClickIdFilterOption(idFilterIds.new, '새상품급')}
                        customStyle={{
                          fontFamily: 'NanumSquareNeo',
                          fontSize: 13,
                          fontWeight: 700
                        }}
                      />
                      <CheckboxGroup
                        isRound={false}
                        text="시세이하"
                        value={idFilterIds.lowPrice}
                        checked={
                          (searchParams.idFilterIds || []).includes(idFilterIds.lowPrice) ||
                          (!complete && step === 1)
                        }
                        onChange={handleClickIdFilterOption(idFilterIds.lowPrice, '새상품급')}
                        customStyle={{
                          fontFamily: 'NanumSquareNeo',
                          fontSize: 13,
                          fontWeight: 700
                        }}
                      />
                    </Flexbox>
                  </>
                )}
              </Flexbox>
              <Box
                onClick={handleClickOpenFilter}
                customStyle={{
                  position: 'relative'
                }}
              >
                {isLoading ? (
                  <Skeleton width={59} height={32} round={8} disableAspectRatio />
                ) : (
                  <Button
                    variant="solid"
                    brandColor="black"
                    startIcon={<Icon name="FilterFilled" />}
                    size="small"
                    customStyle={{
                      minWidth: 36
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
            </Wrapper>
          </Box>
        </StyledGeneralFilter>
        <GeneralFilterList
          variant={variant}
          showAppDownloadBanner={showAppDownloadBanner}
          triggered={triggered}
          productsStatusTriggered={productsStatusTriggered}
        >
          <FilterButton
            ref={camelAuthFilterRef}
            variant="ghost"
            brandColor="gray"
            isLoading={isLoading}
            disabled={isLoading}
            onClick={handleClickIdFilterOption(idFilterIds.auth, '카멜인증')}
            active={
              (progressDone && (searchParams.idFilterIds || []).includes(idFilterIds.auth)) ||
              (!complete && step === 2)
            }
          >
            <Typography
              variant="body1"
              weight="medium"
              customStyle={{
                visibility: isLoading ? 'hidden' : 'visible',
                color: 'inherit'
              }}
            >
              카멜인증
            </Typography>
          </FilterButton>
          {extendsGeneralFilterOptions.map(({ codeId, name, count }) => {
            const active =
              (filterCodeIds.map === codeId &&
                selectedSearchOptions.some(
                  (selectedSearchOption) =>
                    selectedSearchOption.codeId === codeId && !!selectedSearchOption.distance
                )) ||
              (filterCodeIds.my === codeId && activeMyFilter) ||
              (filterCodeIds.gender === codeId &&
                selectedSearchOptions.some(
                  (selectedSearchOption) => selectedSearchOption.codeId === filterCodeIds.gender
                )) ||
              (filterCodeIds.safePayment === codeId &&
                selectedSearchOptions.some((option) => option.id === idFilterIds.safePayment)) ||
              count > 0;

            return (
              <FilterButton
                key={`filter-option-button-${codeId}`}
                variant="ghost"
                brandColor="gray"
                isLoading={isLoading}
                disabled={isLoading}
                onClick={handleClickFilterOption(codeId, undefined, name)}
                active={progressDone && active}
                data-code-id={codeId}
                endIcon={
                  ![
                    filterCodeIds.map,
                    filterCodeIds.id,
                    filterCodeIds.my,
                    filterCodeIds.safePayment
                  ].includes(codeId) ? (
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
                <Typography
                  variant="body1"
                  weight="medium"
                  customStyle={{
                    visibility: isLoading ? 'hidden' : 'visible',
                    color: 'inherit'
                  }}
                >
                  {`${name}${count > 0 ? ` ${count}` : ''}`}
                </Typography>
              </FilterButton>
            );
          })}
        </GeneralFilterList>
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
}>`
  position: sticky;

  top: ${({ variant, showAppDownloadBanner }) => {
    if (variant === 'search') {
      return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
        showAppDownloadBanner ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT : HEADER_HEIGHT
      }px)`;
    }

    return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
      showAppDownloadBanner
        ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT
        : HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT
    }px)`;
  }};

  z-index: ${({ theme: { zIndex } }) => zIndex.header - 1};
  transition: top 0.5s, opacity 0.2s, transform 0.2s;
`;

const Wrapper = styled(Flexbox)`
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  z-index: ${({ theme }) => theme.zIndex.header - 1};
  width: 100%;
`;

const GeneralFilterList = styled.section<{
  variant?: ProductsVariant;
  showAppDownloadBanner: boolean;
  triggered?: boolean;
  productsStatusTriggered?: boolean;
}>`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  column-gap: 8px;
  padding: 0 20px 12px;
  min-height: 26px;
  overflow-x: auto;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};

  position: sticky;
  ${({ productsStatusTriggered }): CSSObject =>
    productsStatusTriggered
      ? {
          opacity: 0
        }
      : {}};

  top: ${({ variant, showAppDownloadBanner }) => {
    if (variant === 'search') {
      return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
        showAppDownloadBanner
          ? HEADER_HEIGHT + APP_DOWNLOAD_BANNER_HEIGHT + ID_FILTER_HEIGHT
          : HEADER_HEIGHT + ID_FILTER_HEIGHT
      }px)`;
    }

    return `calc(${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'} + ${
      showAppDownloadBanner
        ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT + ID_FILTER_HEIGHT
        : HEADER_HEIGHT + CATEGORY_TAGS_HEIGHT + ID_FILTER_HEIGHT
    }px)`;
  }};

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

  z-index: ${({ theme: { zIndex } }) => zIndex.header - 1};
  transition: top 0.5s, opacity 0.2s, transform 0.2s;
`;

const FilterButton = styled(Button)<{ active?: boolean; isLoading?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  row-gap: 2px;
  white-space: nowrap;
  ${({
    theme: {
      palette: { primary }
    },
    active
  }): CSSObject =>
    active
      ? {
          color: primary.light,
          '& *': {
            fontWeight: 700
          }
        }
      : {}};
  overflow: hidden;

  ${({
    isLoading,
    theme: {
      palette: { common }
    }
  }) =>
    isLoading && {
      '&:after': {
        content: '""',
        top: 0,
        left: 0,
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `linear-gradient(
      -45deg,
      ${common.ui95} 30%,
      transparent 50%,
      ${common.ui95} 70%
    )`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '350% 350%',
        animation: 'wave 1.2s ease-in-out infinite',
        animationDelay: '-0.2s',
        opacity: 0.6
      },
      '&:disabled': {
        border: 'none',
        color: common.ui95,
        backgroundColor: common.ui90,
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
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.uiBlack};
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiBlack};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};

  display: flex;
  justify-content: center;
  align-items: center;
`;

export default ProductsGeneralFilter;
