import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Chip,
  CustomStyle,
  Flexbox,
  Icon,
  Toast,
  Tooltip,
  Typography,
  useTheme
} from 'mrcamel-ui';
import sortBy from 'lodash-es/sortBy';
import styled, { CSSObject } from '@emotion/styled';

import OnBoardingSpotlight from '@components/UI/organisms/OnBoardingSpotlight';

import type { SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { deleteProductKeyword, fetchUserInfo, putProductKeyword } from '@api/user';
import { fetchSearch, fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  filterCodeIds,
  filterCodes,
  filterGenders,
  idFilterOptions,
  mapFilterOptions,
  myFilterRelatedParentCategoryIds
} from '@constants/productsFilter';
import { PRODUCT_NAME } from '@constants/product';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  convertSearchParams,
  convertSearchParamsByQuery,
  convertSelectedSearchOptions
} from '@utils/products';
import convertStringToArray from '@utils/convertStringToArray';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
  productsKeywordInduceTriggerState,
  productsKeywordState,
  productsKeywordToastStateFamily
} from '@recoil/productsKeyword';
import {
  activeMyFilterState,
  activeTabCodeIdState,
  myFilterIntersectionCategorySizesState,
  productsFilterAtomParamState,
  productsFilterProgressDoneState,
  productsFilterStateFamily,
  productsFilterTotalCountStateFamily,
  searchOptionsStateFamily,
  searchParamsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';
import {
  deviceIdState,
  showAppDownloadBannerState,
  userOnBoardingTriggerState
} from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useReverseScrollTrigger from '@hooks/useReverseScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductsFilterProps {
  variant: ProductsVariant;
  customStyle?: CustomStyle;
}

function ProductsFilter({ variant, customStyle }: ProductsFilterProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const setAtomParamState = useSetRecoilState(productsFilterAtomParamState);
  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const deviceId = useRecoilValue(deviceIdState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const [{ products: productsOnBoardingTrigger }, setUserOnBoardingTriggerState] = useRecoilState(
    userOnBoardingTriggerState
  );
  const [{ searchOptions: baseSearchOptions }, setBaseSearchOptionsState] = useRecoilState(
    searchOptionsStateFamily(`base-${atomParam}`)
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
  const [{ open: openSavedProductKeywordToast }, setSavedProductKeywordToastState] = useRecoilState(
    productsKeywordToastStateFamily('saved')
  );
  const [{ open: openDeletedProductKeywordToast }, setDeletedProductKeywordToastState] =
    useRecoilState(productsKeywordToastStateFamily('deleted'));
  const [{ open: openRestoredProductKeywordToast }, setRestoredProductKeywordToastState] =
    useRecoilState(productsKeywordToastStateFamily('restored'));
  const [activeMyFilter, setActiveMyFilter] = useRecoilState(activeMyFilterState);
  const [{ searchParams: baseSearchParams }, setBaseSearchParamsState] = useRecoilState(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const [{ tooltip }, setProductsKeywordInduceTriggerState] = useRecoilState(
    productsKeywordInduceTriggerState
  );
  const setSearchOptionsState = useSetRecoilState(searchOptionsStateFamily(`latest-${atomParam}`));
  const setBackupSelectedSearchOptionsState = useSetRecoilState(
    selectedSearchOptionsStateFamily(`backup-${atomParam}`)
  );
  const setProductsFilterState = useSetRecoilState(
    productsFilterStateFamily(`general-${atomParam}`)
  );
  const setProductsMapFilterState = useSetRecoilState(
    productsFilterStateFamily(`map-${atomParam}`)
  );
  const setProductsKeywordState = useSetRecoilState(productsKeywordState);
  const setActiveTabCodeIdState = useSetRecoilState(activeTabCodeIdState);
  const setMyFilterIntersectionCategorySizesState = useSetRecoilState(
    myFilterIntersectionCategorySizesState
  );
  const setTotalCount = useSetRecoilState(
    productsFilterTotalCountStateFamily(`searchOption-${atomParam}`)
  );
  const {
    theme: {
      palette: { primary, common },
      zIndex: { header }
    }
  } = useTheme();

  const queryClient = useQueryClient();

  const { data: accessUser } = useQueryAccessUser();

  const {
    data: {
      baseSearchOptions: newBaseSearchOptions,
      searchOptions,
      userProductKeyword,
      productTotal
    } = {},
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

  const pendingInActiveMyFilterSearchRef = useRef(false);
  const isUpdatedAdditionalSelectedSearchOptionsRef = useRef(false);
  const prevProductKeywordIdRef = useRef(0);
  const filterButtonsRef = useRef<HTMLDivElement | null>(null);
  const productKeywordSaveChipRef = useRef<HTMLButtonElement | null>(null);
  const mapFilterChipRef = useRef<HTMLButtonElement | null>(null);
  const legitChipRef = useRef<HTMLButtonElement | null>(null);

  const productsFilterRef = useRef<HTMLDivElement | null>(null);
  const prevReverseTriggeredRef = useRef(true);

  const scrollTriggered = useScrollTrigger({
    ref: productsFilterRef,
    additionalOffsetTop:
      ((customStyle || {}).top || 0) + (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
  });
  const reverseTriggered = useReverseScrollTrigger();

  const [openMyFilterTooltip, setOpenMyFilterTooltip] = useState(false);
  const [{ complete, step }, setProductsOnBoardingTrigger] = useState({
    complete: true,
    step: -1
  });
  const [myFilterTooltipCustomStyle, setMyFilterTooltipCustomStyle] = useState<CustomStyle>({});
  const [step1TooltipCustomStyle, setStep1TooltipCustomStyle] = useState<CustomStyle>({});
  const [step2TooltipCustomStyle, setStep2TooltipCustomStyle] = useState<CustomStyle>({});
  const [step3TooltipCustomStyle, setStep3TooltipCustomStyle] = useState<CustomStyle>({});
  const [step4TooltipCustomStyle, setStep4TooltipCustomStyle] = useState<CustomStyle>({});

  const {
    data: {
      info: { value: { gender = '' } = {} } = {},
      size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
    } = {}
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    enabled: !!accessUser
  });

  const { mutate } = useMutation(deleteProductKeyword, {
    onMutate: (data: number) => {
      prevProductKeywordIdRef.current = data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      setSavedProductKeywordToastState({
        type: 'saved',
        open: false
      });
      setDeletedProductKeywordToastState({
        type: 'deleted',
        open: true
      });
      setRestoredProductKeywordToastState({
        type: 'restored',
        open: false
      });
    }
  });

  const { mutate: productKeywordRestoreMutate } = useMutation(putProductKeyword, {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.products.searchOptions(searchOptionsParams));
      setSavedProductKeywordToastState({
        type: 'saved',
        open: false
      });
      setDeletedProductKeywordToastState({
        type: 'deleted',
        open: false
      });
      setRestoredProductKeywordToastState({
        type: 'restored',
        open: true
      });
    }
  });

  const { categorySizes = [], genderCategories = [] } = baseSearchOptions;

  const filterCustomStyle = useMemo(
    () => ({
      ...customStyle,
      top: ((customStyle || {}).top || 0) + (showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT : 0)
    }),
    [customStyle, showAppDownloadBanner]
  );

  const intersectionCategorySizes = useMemo(() => {
    if (!gender) return [];
    if (!categorySizes.length) return [];

    return [...tops, ...bottoms, ...shoes]
      .map(({ parentCategoryId, viewSize }) =>
        (categorySizes || [])
          .filter(
            ({ parentCategoryId: categorySizeParentCategoryId, viewSize: categorySizeViewSize }) =>
              viewSize === categorySizeViewSize &&
              myFilterRelatedParentCategoryIds[
                parentCategoryId as keyof typeof myFilterRelatedParentCategoryIds
              ].genders[gender as 'M' | 'F' | 'N'].includes(categorySizeParentCategoryId)
          )
          .filter(({ count }) => count)
      )
      .flat();
  }, [tops, bottoms, shoes, categorySizes, gender]);
  const selectedMapFilterOption = useMemo(
    () =>
      mapFilterOptions.find(
        (mapFilterOption) => mapFilterOption.distance === searchParams.distance
      ),
    [searchParams.distance]
  );
  const showProductKeywordSaveChip = useMemo(() => {
    const allowPathNames = [
      '/products/brands/[keyword]',
      '/products/categories/[keyword]',
      '/products/search/[keyword]'
    ];
    return (
      isFetched &&
      !userProductKeyword &&
      !!selectedSearchOptions.filter(({ codeId }) => ![filterCodeIds.order].includes(codeId))
        .length &&
      allowPathNames.includes(router.pathname)
    );
  }, [isFetched, userProductKeyword, selectedSearchOptions, router.pathname]);
  const extendsFilterCodes = useMemo(
    () =>
      filterCodes[variant].map((filterCode) => ({
        ...filterCode,
        count: selectedSearchOptions.filter(({ codeId }) => {
          if (filterCode.codeId === filterCodeIds.detailOption) {
            return [filterCodeIds.season, filterCodeIds.color, filterCodeIds.material].includes(
              codeId
            );
          }

          return codeId === filterCode.codeId;
        }).length
      })),
    [variant, selectedSearchOptions]
  );
  const title = useMemo(
    () => (variant === 'search' ? '내 성별/사이즈만 보기' : '내 사이즈만 보기'),
    [variant]
  );
  const needGender = useMemo(
    () => variant === 'search' && gender && gender !== 'N',
    [variant, gender]
  );
  const genderId = useMemo(() => {
    if (gender === 'M') return filterGenders.male.id;
    if (gender === 'F') return filterGenders.female.id;
    return 0;
  }, [gender]);
  const intersectionParentCategoryIds = useMemo(
    () =>
      Array.from(
        new Set(intersectionCategorySizes.map(({ parentCategoryId }) => parentCategoryId))
      ),
    [intersectionCategorySizes]
  );
  const notIntersectionCategorySizes = useMemo(
    () =>
      categorySizes.filter(
        ({ parentCategoryId }) => !intersectionParentCategoryIds.includes(parentCategoryId)
      ),
    [categorySizes, intersectionParentCategoryIds]
  );
  const additionalSelectedSearchOptions = useMemo(() => {
    if (!Object.keys(baseSearchOptions).length) return [];

    const convertedInitSearchParams = convertSearchParamsByQuery(router.query, {
      variant,
      defaultValue: {
        order: 'recommDesc'
      }
    });

    let newSelectedSearchOptions = convertSelectedSearchOptions(
      convertedInitSearchParams,
      baseSearchOptions
    );

    if (activeMyFilter && intersectionCategorySizes.length) {
      newSelectedSearchOptions = [
        ...newSelectedSearchOptions,
        ...intersectionCategorySizes.filter(
          ({ categorySizeId, parentCategoryId, viewSize }) =>
            !newSelectedSearchOptions.find(
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
            .map(({ subParentCategories: genderSubParentCategories }) => genderSubParentCategories)
            .flat()
            .map((genderSubParentCategory) => ({
              ...genderSubParentCategory,
              codeId: filterCodeIds.category,
              genderIds: [genderId, filterGenders.common.id]
            }))
        ];
    }

    return newSelectedSearchOptions;
  }, [
    baseSearchOptions,
    router.query,
    variant,
    activeMyFilter,
    intersectionCategorySizes,
    notIntersectionCategorySizes,
    needGender,
    genderCategories,
    genderId
  ]);
  const excludeAdditionalSelectedSearchOptions = useMemo(() => {
    let newSelectedSearchOptions;

    newSelectedSearchOptions = selectedSearchOptions.filter(
      ({ codeId, categorySizeId, parentCategoryId, viewSize }) =>
        !additionalSelectedSearchOptions.find(
          ({
            codeId: additionalCodeId,
            categorySizeId: additionalCategorySizeId,
            parentCategoryId: additionalParentCategoryId,
            viewSize: additionalViewSize
          }) =>
            codeId === additionalCodeId &&
            categorySizeId === additionalCategorySizeId &&
            parentCategoryId === additionalParentCategoryId &&
            viewSize === additionalViewSize
        )
    );

    if (needGender)
      newSelectedSearchOptions = newSelectedSearchOptions.filter(({ codeId, genderIds = [] }) => {
        const [selectedGenderId] = genderIds.filter((id) => id !== filterGenders.common.id);

        return codeId !== filterCodeIds.category && selectedGenderId !== genderId;
      });

    return newSelectedSearchOptions;
  }, [selectedSearchOptions, additionalSelectedSearchOptions, needGender, genderId]);
  const hasBaseSearchParams = useMemo(
    () => !!Object.keys(baseSearchParams).length,
    [baseSearchParams]
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const dataCodeId = Number(e.currentTarget.getAttribute('data-code-id') || 0);
    logEvent(attrKeys.products.CLICK_FILTER, { keyword: router.query.keyword });
    setProductsFilterState(({ type }) => ({
      type,
      open: true
    }));
    setActiveTabCodeIdState(dataCodeId);
    setBackupSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions
    }));
  };

  const handleClickIdFilterOption = (e: MouseEvent<HTMLButtonElement>) => {
    logEvent(attrKeys.products.CLICK_APPLY_IDFILTER);

    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);

    const selectedIdFilterOption = idFilterOptions.find(({ id }) => id === dataId);

    if (!selectedIdFilterOption) return;

    const { id } = selectedIdFilterOption;
    const idFilterIds = searchParams.idFilterIds || [];
    const selectedIdFilterOptionIndex = selectedSearchOptions.findIndex(
      ({ codeId, id: selectedId }) => codeId === filterCodeIds.id && id === selectedId
    );
    const selectedIdFilterIndex = idFilterIds.findIndex((idFilterId) => idFilterId === id);
    let newSearchParams: Partial<SearchParams>;
    let newSelectedSearchOptions: SelectedSearchOption[];

    if (selectedIdFilterOptionIndex > -1) {
      newSelectedSearchOptions = selectedSearchOptions.filter(
        (_, index) => index !== selectedIdFilterOptionIndex
      );
    } else {
      logEvent(attrKeys.products.SELECT_ID_FILTER, {
        name: PRODUCT_NAME.PRODUCT_LIST,
        att: selectedIdFilterOption.name
      });

      newSelectedSearchOptions = selectedSearchOptions.concat({
        id,
        codeId: filterCodeIds.id
      });
    }

    if (dataId === 100) {
      logEvent(attrKeys.products.CLICK_LEGIT_FILTER, {
        name: attrProperty.productName.PRODUCT_LIST,
        att: selectedIdFilterOptionIndex > -1 ? 'OFF' : 'ON'
      });
    }

    if (selectedIdFilterIndex > -1) {
      newSearchParams = {
        ...searchParams,
        idFilterIds: idFilterIds.filter((idFilterId) => idFilterId !== id)
      };
    } else {
      newSearchParams = {
        ...searchParams,
        idFilterIds: idFilterIds.concat(id)
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
  };

  const handleClickDeleteProductKeyword = () => {
    if (userProductKeyword) {
      const { keyword, keywordFilterJson } = userProductKeyword;
      logEvent(attrKeys.products.CLICK_MYLIST, {
        name: PRODUCT_NAME.PRODUCT_LIST,
        att: 'DELETE',
        keyword,
        filters: keywordFilterJson
      });
      mutate(userProductKeyword.id);
    }
  };

  const handleClickRestoreProductKeyword = () => {
    if (prevProductKeywordIdRef.current) {
      logEvent(attrKeys.products.CLICK_UNDO, {
        name: 'PRODUCT_LIST',
        title: 'MYLIST_DELETE'
      });
      productKeywordRestoreMutate(prevProductKeywordIdRef.current);
    }
  };

  const handleClickProductsKeywordSave = () => {
    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }

    logEvent(attrKeys.products.CLICK_MYLIST, {
      name: PRODUCT_NAME.PRODUCT_LIST,
      att: 'SAVE'
    });
    setProductsKeywordState(true);
  };

  const handleClickMyFilterTooltip = useCallback(() => setOpenMyFilterTooltip(false), []);
  const handleClickProductKeywordTooltip = useCallback(
    () => setProductsKeywordInduceTriggerState((prevState) => ({ ...prevState, tooltip: false })),
    [setProductsKeywordInduceTriggerState]
  );

  const handleClickMyFilterInActiveTooltip = () => {
    logEvent(attrKeys.products.CLICK_MYFILTER, {
      name: PRODUCT_NAME.PRODUCT_LIST,
      title: 'AUTO',
      att: 'OFF'
    });
    setSearchParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(excludeAdditionalSelectedSearchOptions, {
        baseSearchParams
      })
    }));
    setSearchOptionsParamsState(({ type }) => ({
      type,
      searchParams: convertSearchParams(excludeAdditionalSelectedSearchOptions, {
        baseSearchParams
      })
    }));
    setSelectedSearchOptionsState(({ type }) => ({
      type,
      selectedSearchOptions: excludeAdditionalSelectedSearchOptions
    }));
    setActiveMyFilter(false);
    setOpenMyFilterTooltip(false);
  };

  useEffect(() => {
    setAtomParamState(atomParam);
  }, [setAtomParamState, atomParam]);

  // TODO 전반적인 필터 관련 state 업데이트 흐름 및 로직 개선
  // 최초 또는 query 변화에 따른 baseSearchParams state 업데이트
  useEffect(() => {
    if (router.isReady) {
      const convertedBaseSearchParams = convertSearchParamsByQuery(router.query, {
        variant,
        onlyBaseSearchParams: true,
        defaultValue: {
          deviceId
        }
      });

      const { parentIds: newParentIds, subParentIds: newSubParentIds } = convertSearchParamsByQuery(
        router.query,
        {
          variant,
          defaultValue: {
            order: 'recommDesc'
          }
        }
      );

      setBaseSearchParamsState((prevState) => {
        if (variant !== 'search') {
          return {
            type: prevState.type,
            searchParams: {
              ...prevState.searchParams,
              ...convertedBaseSearchParams,
              parentIds: newParentIds,
              subParentIds: newSubParentIds
            }
          };
        }
        return {
          type: prevState.type,
          searchParams: { ...prevState.searchParams, ...convertedBaseSearchParams }
        };
      });
    }
  }, [setBaseSearchParamsState, variant, deviceId, router.isReady, router.query]);

  // 최초의 searchParams state 업데이트 (!progressDone: 매몰 목록 새 진입 여부)
  useEffect(() => {
    if (router.isReady && (!hasBaseSearchParams || !progressDone)) {
      const convertedInitSearchParams = convertSearchParamsByQuery(router.query, {
        variant,
        defaultValue: {
          order: 'recommDesc',
          deviceId
        }
      });
      setSearchParamsState(({ type }) => ({
        type,
        searchParams: convertedInitSearchParams
      }));
      setSearchOptionsParamsState(({ type }) => ({
        type,
        searchParams: convertedInitSearchParams
      }));
    }
  }, [
    setBaseSearchOptionsState,
    setSearchParamsState,
    setSearchOptionsParamsState,
    hasBaseSearchParams,
    variant,
    progressDone,
    deviceId,
    router.isReady,
    router.query
  ]);

  // additionalSelectedSearchOptions: Query String Parameter 내 필터 옵션 또는 유저의 MyFilter 필터 옵션
  // additionalSelectedSearchOptions 이 존재하는 경우 searchParams/selectedSearchOptions state 업데이트 (!progressDone: 매몰 목록 새 진입 여부)
  useEffect(() => {
    if (
      router.isReady &&
      hasBaseSearchParams &&
      additionalSelectedSearchOptions.length &&
      !progressDone &&
      !isLoading &&
      !isUpdatedAdditionalSelectedSearchOptionsRef.current
    ) {
      isUpdatedAdditionalSelectedSearchOptionsRef.current = true;
      setSearchParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: convertSearchParams(additionalSelectedSearchOptions, {
          baseSearchParams: prevSearchParams
        })
      }));
      setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: convertSearchParams(additionalSelectedSearchOptions, {
          baseSearchParams: prevSearchParams
        })
      }));
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: additionalSelectedSearchOptions
      }));
    }
  }, [
    setSearchParamsState,
    setSearchOptionsParamsState,
    setSelectedSearchOptionsState,
    additionalSelectedSearchOptions,
    hasBaseSearchParams,
    isLoading,
    progressDone,
    router.isReady
  ]);

  // 브랜드/카테고리/카멜 매물 목록 한정 parentIds, subParentIds 변화를 감지하여 searchParams state 업데이트
  useEffect(() => {
    if (!(variant === 'brands' || variant === 'categories' || variant === 'camel')) return;

    let parentIds: number[] | undefined = convertStringToArray(
      String(router.query.parentIds || '')
    );
    let subParentIds: number[] | undefined = convertStringToArray(
      String(router.query.subParentIds || '')
    );

    parentIds = !parentIds.length ? undefined : parentIds;
    subParentIds = !subParentIds.length ? undefined : subParentIds;

    if (parentIds || subParentIds) {
      setSearchParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: {
          ...prevSearchParams,
          parentIds,
          subParentIds
        }
      }));
      setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: {
          ...prevSearchParams,
          parentIds,
          subParentIds
        }
      }));
    } else if (!parentIds && !subParentIds && !isLoading && isFetched) {
      setSearchParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: {
          ...prevSearchParams,
          parentIds,
          subParentIds
        }
      }));
      setSearchOptionsParamsState(({ type, searchParams: prevSearchParams }) => ({
        type,
        searchParams: {
          ...prevSearchParams,
          parentIds,
          subParentIds
        }
      }));
    }
  }, [
    setSearchParamsState,
    setSearchOptionsParamsState,
    router.query.parentIds,
    router.query.subParentIds,
    isLoading,
    isFetched,
    variant
  ]);

  // 최초의 baseSearchOptions state 업데이트, (!progressDone: 매몰 목록 새 진입 여부)
  useEffect(() => {
    const hasBaseSearchOptions = !!Object.keys(baseSearchOptions).length;
    if (
      (newBaseSearchOptions && !hasBaseSearchOptions) ||
      (newBaseSearchOptions && !progressDone)
    ) {
      setBaseSearchOptionsState(({ type }) => ({
        type,
        searchOptions: newBaseSearchOptions
      }));
    }
  }, [setBaseSearchOptionsState, newBaseSearchOptions, baseSearchOptions, progressDone]);

  useEffect(() => {
    if (searchOptions) {
      setSearchOptionsState(({ type }) => ({
        type,
        searchOptions
      }));
    }
  }, [setSearchOptionsState, searchOptions]);

  useEffect(
    () => setMyFilterIntersectionCategorySizesState(intersectionCategorySizes),
    [setMyFilterIntersectionCategorySizesState, intersectionCategorySizes]
  );

  // 유저가 검색한 매물 목록 검색 결과가 없을 때 MyFilter 가 활성화 중인 상태라면, MyFilter 를 비활성화를 했을 때의 매물 목록 검색 결과가 존재하는지 확인하여 Tooltip 렌더링
  useEffect(() => {
    if (
      isFetched &&
      progressDone &&
      activeMyFilter &&
      !productTotal &&
      !pendingInActiveMyFilterSearchRef.current
    ) {
      pendingInActiveMyFilterSearchRef.current = true;
      fetchSearch(
        convertSearchParams(excludeAdditionalSelectedSearchOptions, {
          baseSearchParams
        })
      ).then((response) => {
        const { productTotal: newProductTotal } = response;

        if (newProductTotal && newProductTotal > 0) {
          logEvent(attrKeys.products.VIEW_MYFILTER_TOOLTIP, {
            name: PRODUCT_NAME.PRODUCT_LIST
          });
          setOpenMyFilterTooltip(true);
        }
      });
    }
  }, [
    isFetched,
    activeMyFilter,
    productTotal,
    baseSearchParams,
    excludeAdditionalSelectedSearchOptions,
    progressDone
  ]);

  useEffect(() => {
    if (isFetched) {
      setOpenMyFilterTooltip(false);
      pendingInActiveMyFilterSearchRef.current = false;
    }
  }, [router.query, isFetched]);

  // TODO 추후 로직 개선
  useEffect(() => {
    if (openMyFilterTooltip) {
      window.addEventListener('click', handleClickMyFilterTooltip);
    } else {
      window.removeEventListener('click', handleClickMyFilterTooltip);
    }

    return () => {
      window.removeEventListener('click', handleClickMyFilterTooltip);
    };
  }, [openMyFilterTooltip, handleClickMyFilterTooltip]);

  // TODO 추후 로직 개선
  useEffect(() => {
    if (tooltip && showProductKeywordSaveChip) {
      window.addEventListener('click', handleClickProductKeywordTooltip);
    } else {
      window.removeEventListener('click', handleClickProductKeywordTooltip);
    }

    return () => {
      window.removeEventListener('click', handleClickProductKeywordTooltip);
    };
  }, [tooltip, showProductKeywordSaveChip, handleClickProductKeywordTooltip]);

  useEffect(() => {
    setTotalCount(({ type }) => ({
      type,
      count: productTotal || 0
    }));
  }, [setTotalCount, productTotal]);

  useEffect(() => {
    if (showProductKeywordSaveChip) {
      logEvent(attrKeys.products.VIEW_MYLIST, {
        name: PRODUCT_NAME.PRODUCT_LIST,
        att: 'SAVE'
      });
    }
  }, [showProductKeywordSaveChip]);

  useEffect(() => {
    if (!router.isReady) return;

    if (filterButtonsRef.current) {
      const { clientHeight } = filterButtonsRef.current;
      const { top } = filterButtonsRef.current.getBoundingClientRect();

      setStep1TooltipCustomStyle({
        position: 'fixed',
        // 27: Spotlight clientHeight 과 Tooltip 삼각형의 clientHeight, 피그마에 정의된 여백 합계
        top: top + clientHeight + 27,
        left: 20,
        transform: 'none',
        height: 'fit-content'
      });
      setMyFilterTooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight + 19,
        left: 20,
        transform: 'none',
        height: 'fit-content'
      });
    }
    if (productKeywordSaveChipRef.current) {
      const { clientHeight } = productKeywordSaveChipRef.current;
      const { top } = productKeywordSaveChipRef.current.getBoundingClientRect();

      setStep2TooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight + 20,
        left: 'auto',
        right: 20,
        transform: 'none',
        height: 'fit-content'
      });
    }
    if (mapFilterChipRef.current) {
      const { clientHeight } = mapFilterChipRef.current;
      const { top } = mapFilterChipRef.current.getBoundingClientRect();

      setStep3TooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight + 20,
        left: 20,
        transform: 'none',
        height: 'fit-content'
      });
    }
    if (legitChipRef.current) {
      const { clientHeight } = legitChipRef.current;
      const { top } = legitChipRef.current.getBoundingClientRect();

      setStep4TooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight + 20,
        left: ((mapFilterChipRef.current || {}).clientWidth || 0) + 26,
        transform: 'none',
        height: 'fit-content'
      });
    }

    if (accessUser) {
      setProductsOnBoardingTrigger(productsOnBoardingTrigger);
    }
  }, [router.isReady, productsOnBoardingTrigger, accessUser]);

  useEffect(() => {
    if (accessUser) {
      if (productsOnBoardingTrigger.complete && productsOnBoardingTrigger.step === 4) {
        setProductsOnBoardingTrigger({
          complete: false,
          step: 4
        });
      }
    }
  }, [accessUser, productsOnBoardingTrigger]);

  useEffect(() => {
    if (!complete && step === 3) {
      setProductsMapFilterState(({ type }) => ({
        type,
        open: true
      }));
    }
  }, [setProductsMapFilterState, complete, step]);

  useEffect(() => {
    prevReverseTriggeredRef.current = reverseTriggered;
  }, [reverseTriggered]);

  return (
    <>
      <Box component="section" customStyle={{ height: 85 }}>
        <StyledProductsFilter
          ref={productsFilterRef}
          variant={variant}
          reverseTriggered={reverseTriggered}
          prevReverseTriggered={prevReverseTriggeredRef.current}
          scrollTriggered={scrollTriggered}
          css={filterCustomStyle}
        >
          <FilterButtons ref={filterButtonsRef}>
            {idFilterOptions
              .filter(({ id }) => id !== 100)
              .map(({ id, name }) => (
                <Chip
                  key={`id-filter-option-button-${id}`}
                  variant={
                    (searchParams.idFilterIds || []).includes(id) || (!complete && step === 0)
                      ? 'outlinedGhost'
                      : 'outlined'
                  }
                  brandColor={
                    (searchParams.idFilterIds || []).includes(id) || (!complete && step === 0)
                      ? 'primary'
                      : 'grey'
                  }
                  data-id={id}
                  size="small"
                  weight="medium"
                  isRound={false}
                  onClick={handleClickIdFilterOption}
                >
                  {name}
                </Chip>
              ))}
            {extendsFilterCodes.map(({ codeId, name, count }) => (
              <Chip
                key={`filter-option-button-${codeId}`}
                variant={count ? 'outlinedGhost' : 'outlined'}
                brandColor={count ? 'primary' : 'grey'}
                size="small"
                weight="medium"
                endIcon={<Icon name="CaretDownOutlined" size="small" />}
                isRound={false}
                data-code-id={codeId}
                onClick={handleClick}
                customStyle={{ gap: 2 }}
              >
                {name}&nbsp;
                {count || ''}
              </Chip>
            ))}
          </FilterButtons>
          <Flexbox
            justifyContent="space-between"
            customStyle={{
              padding: '8px 20px'
            }}
          >
            <Flexbox gap={6}>
              <Chip
                ref={mapFilterChipRef}
                variant={selectedMapFilterOption ? 'outlinedGhost' : 'ghost'}
                size="small"
                weight="medium"
                brandColor={selectedMapFilterOption ? 'primary' : 'black'}
                onClick={() =>
                  setProductsMapFilterState(({ type }) => ({
                    type,
                    open: true
                  }))
                }
                customStyle={{
                  minWidth: 'fit-content'
                }}
              >
                {selectedMapFilterOption && selectedMapFilterOption.viewName}
                {!selectedMapFilterOption && '내 주변 위치'}
              </Chip>
              <LegitChip
                ref={legitChipRef}
                variant={(searchParams.idFilterIds || []).includes(100) ? 'outlinedGhost' : 'ghost'}
                brandColor={(searchParams.idFilterIds || []).includes(100) ? 'primary' : 'black'}
                data-id={100}
                size="small"
                weight="medium"
                onClick={handleClickIdFilterOption}
              >
                <span>🔎&nbsp;</span>사진감정
                <span>&nbsp;{(searchParams.idFilterIds || []).includes(100) ? 'ON' : 'OFF'}</span>
              </LegitChip>
            </Flexbox>
            {showProductKeywordSaveChip && (
              <Tooltip
                open={tooltip}
                message={
                  <Typography variant="body2" weight="bold" customStyle={{ color: common.white }}>
                    나중에 같은 필터로 또 볼거죠? 그럼 저장하세요!
                  </Typography>
                }
                placement="bottom"
                round="16"
                triangleLeft={227}
                customStyle={{
                  left: -30,
                  zIndex: header - 1
                }}
              >
                <Chip
                  brandColor="primary"
                  size="small"
                  weight="medium"
                  startIcon={<Icon name="BookmarkFilled" size="small" />}
                  onClick={handleClickProductsKeywordSave}
                  customStyle={{
                    minWidth: 'fit-content'
                  }}
                >
                  이 검색 저장
                </Chip>
              </Tooltip>
            )}
            {!showProductKeywordSaveChip && (
              <Chip
                ref={productKeywordSaveChipRef}
                brandColor="primary"
                size="small"
                weight="medium"
                startIcon={<Icon name="BookmarkFilled" size="small" />}
                customStyle={{
                  minWidth: 'fit-content',
                  visibility: !complete && step === 1 ? 'visible' : 'hidden'
                }}
              >
                이 검색 저장
              </Chip>
            )}
            {isFetched && userProductKeyword && (
              <Chip
                brandColor="grey"
                size="small"
                weight="medium"
                startIcon={<Icon name="CloseOutlined" size="small" />}
                customStyle={{
                  minWidth: 'fit-content',
                  borderColor: common.grey['40']
                }}
                onClick={handleClickDeleteProductKeyword}
              >
                저장한 검색 삭제
              </Chip>
            )}
          </Flexbox>
        </StyledProductsFilter>
      </Box>
      <OnBoardingSpotlight
        open={!complete && step === 0}
        onClose={() =>
          // 검색집사에서 매물목록 저장하고 넘어온 경우 step 1 skip
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: {
              complete: false,
              step: userProductKeyword ? 2 : 1
            }
          }))
        }
        targetRef={filterButtonsRef}
        customStyle={{ height: 46 }}
      >
        <Tooltip
          open={!complete && step === 0}
          brandColor="primary-highlight"
          message={
            <Typography
              variant="body2"
              weight="bold"
              customStyle={{
                '& > strong': { position: 'relative', color: primary.main }
              }}
            >
              새로워진 필터로 <strong>찾으시는 조건</strong>의 매물만 보세요 👀
              <NewButton variant="contained" brandColor="primary" size="small">
                NEW
              </NewButton>
            </Typography>
          }
          triangleLeft={12}
          placement="bottom"
          customStyle={step1TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={!complete && step === 1}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: {
              complete: false,
              step: 2
            }
          }))
        }
        targetRef={productKeywordSaveChipRef}
        customSpotlightPosition={{
          top: 1,
          left: 1
        }}
        customStyle={{ borderRadius: 36 }}
      >
        <Tooltip
          open={!complete && step === 1}
          brandColor="primary-highlight"
          message={
            <Typography
              variant="body2"
              weight="bold"
              customStyle={{ '& > strong': { position: 'relative', color: primary.main } }}
            >
              필터 적용하신 뒤 저장해두면 다시 찾기 쉬워요!
              <NewButton
                variant="contained"
                brandColor="primary"
                size="small"
                customStyle={{ left: -30 }}
              >
                NEW
              </NewButton>
            </Typography>
          }
          triangleLeft={227}
          placement="bottom"
          customStyle={step2TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={!complete && step === 2}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: {
              complete: false,
              step: 3
            }
          }))
        }
        targetRef={mapFilterChipRef}
        customSpotlightPosition={{
          width: 1
        }}
        customStyle={{ borderRadius: 36 }}
      >
        <Tooltip
          open={!complete && step === 2}
          brandColor="primary-highlight"
          message={
            <Typography variant="body2" weight="bold">
              당근마켓 매물도 보고, 직거래 위주로 거래하신다면 클릭!
            </Typography>
          }
          triangleLeft={12}
          placement="bottom"
          customStyle={step3TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={!complete && step === 4}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: {
              complete: true,
              step: 5
            }
          }))
        }
        targetRef={legitChipRef}
        customStyle={{ borderRadius: 36 }}
      >
        <Tooltip
          open={!complete && step === 4}
          brandColor="primary-highlight"
          message={
            <Typography variant="body2" weight="bold">
              정가품이 궁금하다면 클릭!
            </Typography>
          }
          triangleLeft={12}
          placement="bottom"
          customStyle={step4TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <Tooltip
        className="products-filter-tooltip"
        open={openMyFilterTooltip}
        message={
          <Flexbox gap={8}>
            <Typography variant="body2" weight="bold" customStyle={{ color: common.white }}>
              {title}가 켜져 있어요!
            </Typography>
            <Typography
              variant="body2"
              weight="bold"
              onClick={handleClickMyFilterInActiveTooltip}
              customStyle={{
                textDecoration: 'underline',
                color: common.white,
                cursor: 'pointer'
              }}
            >
              필터끄기
            </Typography>
          </Flexbox>
        }
        brandColor="black"
        placement="bottom"
        triangleLeft={12}
        customStyle={myFilterTooltipCustomStyle}
      />
      <Toast
        open={openSavedProductKeywordToast}
        onClose={() => setSavedProductKeywordToastState({ type: 'saved', open: false })}
      >
        <Typography weight="medium" customStyle={{ color: common.white }}>
          저장이 완료되었어요
        </Typography>
      </Toast>
      <Toast
        open={openDeletedProductKeywordToast}
        autoHideDuration={4000}
        onClose={() => setDeletedProductKeywordToastState({ type: 'deleted', open: false })}
      >
        <Flexbox gap={8}>
          <Typography
            weight="medium"
            customStyle={{ flexGrow: 1, color: common.white, textAlign: 'left' }}
          >
            저장한 매물목록이 삭제되었습니다.
          </Typography>
          <Typography
            onClick={handleClickRestoreProductKeyword}
            customStyle={{ textDecoration: 'underline', color: common.white }}
          >
            되돌리기
          </Typography>
        </Flexbox>
      </Toast>
      <Toast
        open={openRestoredProductKeywordToast}
        onClose={() => setRestoredProductKeywordToastState({ type: 'restored', open: false })}
      >
        <Typography weight="medium" customStyle={{ color: common.white }}>
          삭제한 매물목록을 다시 저장했어요
        </Typography>
      </Toast>
    </>
  );
}

const StyledProductsFilter = styled.div<{
  variant?: ProductsVariant;
  scrollTriggered: boolean;
  reverseTriggered: boolean;
  prevReverseTriggered: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: 100%;

  ${({ theme: { zIndex }, scrollTriggered }): CSSObject =>
    scrollTriggered
      ? {
          position: 'fixed',
          opacity: 0,
          zIndex: zIndex.header,
          pointerEvents: 'none'
        }
      : {
          position: 'static'
        }}
  ${({ scrollTriggered, reverseTriggered, prevReverseTriggered }): CSSObject => {
    if (scrollTriggered && !reverseTriggered && prevReverseTriggered) {
      return {
        opacity: 0,
        transition: 'opacity 0.1s ease-in 0ms'
      };
    }
    if (reverseTriggered) {
      return {
        opacity: 1,
        pointerEvents: 'visible',
        transition: 'opacity 0.1s ease-in 0ms'
      };
    }
    return {};
  }};

  border-bottom: 1px solid ${({ theme: { palette } }) => palette.common.grey['90']};
  background-color: ${({ theme: { palette } }) => palette.common.white};

  & > .products-filter-tooltip {
    max-width: 100%;
  }
`;

const FilterButtons = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 8px 20px 0 20px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;

  & > button {
    display: inline-flex;
    min-width: fit-content;
    margin-right: 6px;

    &:last-child {
      margin-right: 0;
    }
  }
`;

const NewButton = styled(Button)`
  position: absolute;
  top: -10px;
  right: -30px;
  width: 36px;
  height: 25px;
  padding: 5px 6px;
  font-weight: 700;
  font-size: 10px;
`;

const LegitChip = styled(Chip)`
  min-width: fit-content;
  @media (max-width: 355px) {
    & > span {
      display: none;
    }
  }
`;

export default ProductsFilter;
