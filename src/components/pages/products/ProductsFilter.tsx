import { useEffect, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { debounce, sortBy, uniqBy } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import { Tooltip } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import OnBoardingSpotlight from '@components/UI/organisms/OnBoardingSpotlight';
import { ProductsGeneralFilter } from '@components/pages/products';

import type { SizeCode } from '@dto/common';

import { logEvent } from '@library/amplitude';

import { fetchSearch, fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  filterCodeIds,
  filterGenders,
  myFilterRelatedParentCategoryIds
} from '@constants/productsFilter';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import {
  convertSearchParams,
  convertSearchParamsByQuery,
  convertSelectedSearchOptions
} from '@utils/products';
import { convertStringToArray } from '@utils/common';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';
import {
  activeMyFilterState,
  dynamicOptionsStateFamily,
  filterOperationInfoSelector,
  myFilterIntersectionCategorySizesState,
  productsFilterAtomParamState,
  productsFilterProgressDoneState,
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
import useSession from '@hooks/useSession';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

interface ProductsFilterProps {
  variant: ProductsVariant;
}

function ProductsFilter({ variant }: ProductsFilterProps) {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const setAtomParamState = useSetRecoilState(productsFilterAtomParamState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);
  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const deviceId = useRecoilValue(deviceIdState);
  const [{ products: productsOnBoardingTrigger }, setUserOnBoardingTriggerState] = useRecoilState(
    userOnBoardingTriggerState
  );
  const [{ searchOptions: baseSearchOptions }, setBaseSearchOptionsState] = useRecoilState(
    searchOptionsStateFamily(`base-${atomParam}`)
  );
  const [{ searchParams: searchOptionsParams }, setSearchOptionsParamsState] = useRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const [{ searchParams: baseSearchParams }, setBaseSearchParamsState] = useRecoilState(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const { searchParams } = useRecoilValue(searchParamsStateFamily(`search-${atomParam}`));
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const [activeMyFilter, setActiveMyFilter] = useRecoilState(activeMyFilterState);
  const [dynamicOptions, setDynamicOptionsState] = useRecoilState(
    dynamicOptionsStateFamily(atomParam)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const setMyFilterIntersectionCategorySizesState = useSetRecoilState(
    myFilterIntersectionCategorySizesState
  );
  const setSearchOptionsState = useSetRecoilState(searchOptionsStateFamily(`latest-${atomParam}`));
  const setTotalCount = useSetRecoilState(
    productsFilterTotalCountStateFamily(`searchOption-${atomParam}`)
  );

  const { isLoggedIn } = useSession();

  const {
    data: {
      baseSearchOptions: newBaseSearchOptions,
      searchOptions,
      productTotal,
      dynamicOptions: newDynamicOptions = []
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

  const [openMyFilterTooltip, setOpenMyFilterTooltip] = useState(false);
  const [{ complete, step }, setProductsOnBoardingTrigger] = useState({
    complete: true,
    step: -1
  });
  const [step1TooltipCustomStyle, setStep1TooltipCustomStyle] = useState<CustomStyle>({});
  const [step2TooltipCustomStyle, setStep2TooltipCustomStyle] = useState<CustomStyle>({});
  const [step3TooltipCustomStyle, setStep3TooltipCustomStyle] = useState<CustomStyle>({});
  const [openOnBoarding, setOpenOnBoarding] = useState(false);
  const [genderId, setGenderId] = useState(0);
  const [needGender, setNeedGender] = useState(false);
  const [intersectionCategorySizes, setIntersectionCategorySizes] = useState<SizeCode[]>([]);
  const [intersectionParentCategoryIds, setIntersectionParentCategoryIds] = useState<number[]>([]);
  const [notIntersectionCategorySizes, setNotIntersectionCategorySizes] = useState<SizeCode[]>([]);
  const [additionalSelectedSearchOptions, setAdditionalSelectedSearchOptions] = useState<
    SelectedSearchOption[]
  >([]);
  const [excludeAdditionalSelectedSearchOptions, setExcludeAdditionalSelectedSearchOptions] =
    useState<SelectedSearchOption[]>([]);

  const isUpdateSelectedSearchOptions = useRef(false);
  const pendingInActiveMyFilterSearchRef = useRef(false);
  const isUpdatedAdditionalSelectedSearchOptionsRef = useRef(false);
  const isUpdatedExcludeSelectedSearchOptionsRef = useRef(false);
  const aiFilterGroupRef = useRef<HTMLDivElement>(null);
  const camelAuthFilterRef = useRef<HTMLButtonElement>(null);
  const mySizeFilterRef = useRef<HTMLDivElement>(null);

  const {
    data: {
      info: { value: { gender = '' } = {} } = {},
      size: { value: { tops = '', bottoms = '', shoes = '' } = {} } = {}
    } = {}
  } = useQueryUserInfo();

  const { categorySizes = [], genderCategories = [] } = baseSearchOptions;
  const hasBaseSearchParams = !!Object.keys(baseSearchParams).length;

  const handleClickMyFilterTooltip = () => {
    logEvent(attrKeys.products.clickMyFilter, {
      name: attrProperty.name.productList,
      title: attrProperty.title.auto,
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

  useEffect(() => {
    setNeedGender(variant === 'search' && !!gender && gender !== 'N');
  }, [gender, variant]);

  useEffect(() => {
    let newGenderId = 0;

    if (gender === 'M') {
      newGenderId = filterGenders.male.id;
    } else if (gender === 'F') {
      newGenderId = filterGenders.female.id;
    }

    setGenderId(newGenderId);
  }, [gender]);

  useEffect(() => {
    if (!gender || !categorySizes.length) return;

    setIntersectionCategorySizes(
      uniqBy(
        [...(tops || []), ...(bottoms || []), ...(shoes || [])]
          .map(({ parentCategoryId, viewSize }) =>
            (categorySizes || [])
              .filter(
                ({
                  parentCategoryId: categorySizeParentCategoryId,
                  viewSize: categorySizeViewSize
                }) =>
                  viewSize === categorySizeViewSize &&
                  myFilterRelatedParentCategoryIds[
                    parentCategoryId as keyof typeof myFilterRelatedParentCategoryIds
                  ].genders[gender as 'M' | 'F' | 'N'].includes(categorySizeParentCategoryId)
              )
              .filter(({ count }) => count)
          )
          .flat(),
        'categorySizeId'
      )
    );
  }, [bottoms, categorySizes, gender, shoes, tops]);

  useEffect(() => {
    setIntersectionParentCategoryIds(
      Array.from(new Set(intersectionCategorySizes.map(({ parentCategoryId }) => parentCategoryId)))
    );
  }, [intersectionCategorySizes]);

  useEffect(() => {
    if (!intersectionParentCategoryIds.length) return;

    setNotIntersectionCategorySizes(
      categorySizes.filter(
        ({ parentCategoryId }) => !intersectionParentCategoryIds.includes(parentCategoryId)
      )
    );
  }, [categorySizes, intersectionParentCategoryIds]);

  useEffect(() => {
    if (!Object.keys(baseSearchOptions).length) return;

    isUpdatedAdditionalSelectedSearchOptionsRef.current = false;

    const convertedInitSearchParams = convertSearchParamsByQuery(router.query, {
      variant,
      defaultValue: {
        order: 'recommDesc'
      }
    });

    let newSelectedSearchOptions = convertSelectedSearchOptions(
      convertedInitSearchParams,
      baseSearchOptions,
      { variant }
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

    setAdditionalSelectedSearchOptions(newSelectedSearchOptions);
  }, [
    activeMyFilter,
    baseSearchOptions,
    genderCategories,
    genderId,
    intersectionCategorySizes,
    needGender,
    notIntersectionCategorySizes,
    router.query,
    variant
  ]);

  useEffect(() => {
    let newSelectedSearchOptions;
    const requireFilterCodeIds = [filterCodeIds.order, filterCodeIds.id, filterCodeIds.map];

    isUpdatedExcludeSelectedSearchOptionsRef.current = false;

    newSelectedSearchOptions = selectedSearchOptions.filter(
      ({ codeId, categorySizeId, parentCategoryId, viewSize }) =>
        !additionalSelectedSearchOptions.find(
          ({
            codeId: additionalCodeId,
            categorySizeId: additionalCategorySizeId,
            parentCategoryId: additionalParentCategoryId,
            viewSize: additionalViewSize
          }) =>
            !requireFilterCodeIds.includes(additionalCodeId) &&
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

    setExcludeAdditionalSelectedSearchOptions(newSelectedSearchOptions);
  }, [additionalSelectedSearchOptions, genderId, needGender, selectedSearchOptions]);

  // TODO 전반적인 필터 관련 state 업데이트 흐름 및 로직 개선
  // 최초 또는 query 변화에 따른 baseSearchParams state 업데이트
  useEffect(() => {
    const convertedBaseSearchParams = convertSearchParamsByQuery(router.query, {
      variant,
      onlyBaseSearchParams: true,
      defaultValue: {
        deviceId
      }
    });

    if (variant === 'camel') {
      convertedBaseSearchParams.searchType = 'camel';
    }

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
  }, [setBaseSearchParamsState, variant, deviceId, router.query]);

  // 최초의 searchParams state 업데이트 (!progressDone: 매몰 목록 새 진입 여부)
  useEffect(() => {
    if (!hasBaseSearchParams || !progressDone) {
      const convertedInitSearchParams = convertSearchParamsByQuery(router.query, {
        variant,
        defaultValue: {
          order: 'recommDesc',
          deviceId
        }
      });

      if (variant === 'camel') {
        convertedInitSearchParams.searchType = 'camel';
      }

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
    router.query
  ]);

  // additionalSelectedSearchOptions: Query String Parameter 내 필터 옵션 또는 유저의 MyFilter 필터 옵션
  // additionalSelectedSearchOptions 이 존재하는 경우 searchParams/selectedSearchOptions state 업데이트 (!progressDone: 매몰 목록 새 진입 여부)
  useEffect(() => {
    if (
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
    progressDone
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

  // 연관 키워드 클릭시 selectedSearchOptionsState 초기화
  useEffect(() => {
    const handleRouteChangeStart = (_: string, { shallow }: { shallow: boolean }) => {
      if (shallow) {
        isUpdateSelectedSearchOptions.current = true;
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router.events]);

  useEffect(() => {
    if (isUpdateSelectedSearchOptions.current && additionalSelectedSearchOptions.length > 0) {
      isUpdateSelectedSearchOptions.current = false;

      setSearchParamsState(({ type }) => ({
        type,
        searchParams: convertSearchParams(additionalSelectedSearchOptions, {
          baseSearchParams
        })
      }));
      setSearchOptionsParamsState(({ type }) => ({
        type,
        searchParams: convertSearchParams(additionalSelectedSearchOptions, {
          baseSearchParams
        })
      }));
      setSelectedSearchOptionsState(({ type }) => ({
        type,
        selectedSearchOptions: additionalSelectedSearchOptions
      }));
    }
  }, [
    additionalSelectedSearchOptions,
    baseSearchParams,
    setSearchOptionsParamsState,
    setSearchParamsState,
    setSelectedSearchOptionsState
  ]);

  // 연관 키워드 클릭 따른 다이나믹 필터 업데이트
  useEffect(() => {
    if (
      variant === 'search' &&
      isFetched &&
      (newDynamicOptions.length !== dynamicOptions.length ||
        newDynamicOptions.some(
          (newDynamicOption) =>
            !dynamicOptions.map(({ name }) => name).includes(newDynamicOption.name)
        )) &&
      selectedSearchOptionsHistory.length === 0
    ) {
      setDynamicOptionsState(newDynamicOptions);
    }
  }, [
    dynamicOptions,
    isFetched,
    newDynamicOptions,
    selectedSearchOptionsHistory.length,
    setDynamicOptionsState,
    variant
  ]);

  // 최초의 baseSearchOptions dynamicOptionsState state 업데이트, (!progressDone: 매몰 목록 새 진입 여부)
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
      setDynamicOptionsState(newDynamicOptions);
    }
  }, [
    setBaseSearchOptionsState,
    newBaseSearchOptions,
    baseSearchOptions,
    progressDone,
    setDynamicOptionsState,
    newDynamicOptions
  ]);

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
      isLoggedIn &&
      !productTotal &&
      !pendingInActiveMyFilterSearchRef.current &&
      isUpdatedExcludeSelectedSearchOptionsRef.current
    ) {
      pendingInActiveMyFilterSearchRef.current = true;
      fetchSearch(
        convertSearchParams(excludeAdditionalSelectedSearchOptions, {
          baseSearchParams
        })
      ).then((response) => {
        const { productTotal: newProductTotal, resultUseAI } = response;
        if (resultUseAI) {
          logEvent(attrKeys.products.LOAD_PRODUCT_LIST_ZAI);
        }
        if (newProductTotal && newProductTotal > 0) {
          logEvent(attrKeys.products.viewMyFilterTooltip, {
            name: attrProperty.name.productList
          });
          setOpenMyFilterTooltip(true);
          pendingInActiveMyFilterSearchRef.current = false;
        }
      });
    }
  }, [
    isFetched,
    activeMyFilter,
    isLoggedIn,
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
    const handleClickMyFilterTooltipExclude = () => setOpenMyFilterTooltip(false);

    if (openMyFilterTooltip) {
      window.addEventListener('click', handleClickMyFilterTooltipExclude);
    } else {
      window.removeEventListener('click', handleClickMyFilterTooltipExclude);
    }

    return () => {
      window.removeEventListener('click', handleClickMyFilterTooltipExclude);
    };
  }, [openMyFilterTooltip]);

  useEffect(() => {
    setTotalCount(({ type }) => ({
      type,
      count: productTotal || 0
    }));
  }, [setTotalCount, productTotal]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setOpenOnBoarding(false);
      } else {
        setOpenOnBoarding(true);
      }

      if (mySizeFilterRef.current) {
        const { clientHeight } = mySizeFilterRef.current;
        const { top } = mySizeFilterRef.current.getBoundingClientRect();

        setStep1TooltipCustomStyle({
          position: 'fixed',
          top: top + clientHeight + 10,
          left: 15,
          transform: 'none',
          height: 'fit-content'
        });
      }

      if (aiFilterGroupRef.current) {
        setStep2TooltipCustomStyle({
          position: 'fixed',
          top:
            aiFilterGroupRef.current.getBoundingClientRect().top +
            aiFilterGroupRef.current.clientHeight +
            10,
          left: aiFilterGroupRef.current.offsetLeft / 2,
          transform: 'none',
          height: 'fit-content',
          '& > svg': { left: aiFilterGroupRef.current.offsetLeft + 20 }
        });
      }

      if (camelAuthFilterRef.current) {
        setStep3TooltipCustomStyle({
          position: 'fixed',
          top:
            camelAuthFilterRef.current.getBoundingClientRect().top +
            camelAuthFilterRef.current.clientHeight +
            10,
          left: 20,
          transform: 'none',
          height: 'fit-content'
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [productsOnBoardingTrigger, showAppDownloadBanner]);

  useEffect(() => {
    const handleScrollAndResize = debounce(() => {
      if (productsOnBoardingTrigger.complete) return;

      if (mySizeFilterRef.current) {
        const { clientHeight } = mySizeFilterRef.current;
        const { top } = mySizeFilterRef.current.getBoundingClientRect();

        setStep1TooltipCustomStyle({
          position: 'fixed',
          top: top + clientHeight + 10,
          left: 15,
          transform: 'none',
          height: 'fit-content'
        });
      }

      if (aiFilterGroupRef.current) {
        setStep2TooltipCustomStyle({
          position: 'fixed',
          top:
            aiFilterGroupRef.current.getBoundingClientRect().top +
            aiFilterGroupRef.current.clientHeight +
            10,
          left: aiFilterGroupRef.current.offsetLeft / 2,
          transform: 'none',
          height: 'fit-content',
          '& > svg': { left: aiFilterGroupRef.current.offsetLeft + 20 }
        });
      }

      if (camelAuthFilterRef.current) {
        setStep3TooltipCustomStyle({
          position: 'fixed',
          top:
            camelAuthFilterRef.current.getBoundingClientRect().top +
            camelAuthFilterRef.current.clientHeight +
            10,
          left: 20,
          transform: 'none',
          height: 'fit-content'
        });
      }

      if (isLoggedIn) {
        setProductsOnBoardingTrigger(productsOnBoardingTrigger);

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 500);

    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, [isLoggedIn, productsOnBoardingTrigger, showAppDownloadBanner]);

  useEffect(() => {
    if (!hasBaseSearchParams || !progressDone) return;

    if (window.scrollY <= 0) {
      setOpenOnBoarding(true);
    }

    if (isLoggedIn && !productsOnBoardingTrigger.complete) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    if (mySizeFilterRef.current) {
      const { clientHeight } = mySizeFilterRef.current;
      const { top } = mySizeFilterRef.current.getBoundingClientRect();

      setStep1TooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight + 10,
        left: 15,
        transform: 'none',
        height: 'fit-content'
      });
    }

    if (aiFilterGroupRef.current) {
      setStep2TooltipCustomStyle({
        position: 'fixed',
        top:
          aiFilterGroupRef.current.getBoundingClientRect().top +
          aiFilterGroupRef.current.clientHeight +
          10,
        left: aiFilterGroupRef.current.offsetLeft / 2,
        transform: 'none',
        height: 'fit-content',
        '& > svg': { left: aiFilterGroupRef.current.offsetLeft + 20 }
      });
    }

    if (camelAuthFilterRef.current) {
      setStep3TooltipCustomStyle({
        position: 'fixed',
        top:
          camelAuthFilterRef.current.getBoundingClientRect().top +
          camelAuthFilterRef.current.clientHeight +
          10,
        left: 20,
        transform: 'none',
        height: 'fit-content'
      });
    }

    if (isLoggedIn) {
      setProductsOnBoardingTrigger(productsOnBoardingTrigger);
    }
  }, [productsOnBoardingTrigger, isLoggedIn, hasBaseSearchParams, progressDone]);

  useEffect(() => {
    if (isLoggedIn) {
      if (productsOnBoardingTrigger.complete && productsOnBoardingTrigger.step === 2) {
        setProductsOnBoardingTrigger({ complete: false, step: 2 });
      }
    }
  }, [isLoggedIn, productsOnBoardingTrigger]);

  useEffect(() => {
    if (!hasBaseSearchParams || !progressDone || !complete) {
      setOpenMyFilterTooltip(false);
    }
  }, [hasBaseSearchParams, progressDone, complete]);

  useEffect(() => {
    if (excludeAdditionalSelectedSearchOptions.length)
      isUpdatedExcludeSelectedSearchOptionsRef.current = true;
  }, [excludeAdditionalSelectedSearchOptions]);

  useEffect(() => {
    if (isFetched)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
  }, [searchParams, isFetched]);

  return (
    <>
      <ProductsGeneralFilter
        ref={mySizeFilterRef}
        aiFilterGroupRef={aiFilterGroupRef}
        camelAuthFilterRef={camelAuthFilterRef}
        isLoading={!hasBaseSearchParams || !progressDone}
        variant={variant}
        openMyFilterTooltip={openMyFilterTooltip}
        onClickMyFilterTooltip={handleClickMyFilterTooltip}
      />
      <OnBoardingSpotlight
        open={hasBaseSearchParams && progressDone && !complete && step === 0 && openOnBoarding}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: { complete: false, step: 1 }
          }))
        }
        targetRef={mySizeFilterRef}
        customSpotlightPosition={{
          width: 12
        }}
        customStyle={{
          borderRadius: 8
        }}
      >
        <Tooltip
          open={hasBaseSearchParams && progressDone && !complete && step === 0 && openOnBoarding}
          variant="ghost"
          brandColor="primary"
          message="내 사이즈만 보고싶다면 클릭!"
          triangleLeft={16}
          placement="bottom"
          customStyle={step1TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={hasBaseSearchParams && progressDone && !complete && step === 1 && openOnBoarding}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: { complete: false, step: 2 }
          }))
        }
        targetRef={aiFilterGroupRef}
        customSpotlightPosition={{ width: 6, left: 1 }}
        customStyle={{ borderRadius: 8 }}
      >
        <Tooltip
          open={hasBaseSearchParams && progressDone && !complete && step === 1 && openOnBoarding}
          variant="ghost"
          brandColor="primary"
          message="카멜의 AI로 좋은 상태와 가격만 모아서 보여드려요!"
          triangleLeft={16}
          placement="bottom"
          customStyle={step2TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={hasBaseSearchParams && progressDone && !complete && step === 2 && openOnBoarding}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: { complete: true, step: 3 }
          }))
        }
        targetRef={camelAuthFilterRef}
        customSpotlightPosition={{
          left: 1
        }}
        customStyle={{ borderRadius: 8 }}
      >
        <Tooltip
          open={hasBaseSearchParams && progressDone && !complete && step === 2 && openOnBoarding}
          variant="ghost"
          brandColor="primary"
          message="카멜이 인증한 판매자와 안전하게 거래해보세요."
          triangleLeft={16}
          placement="bottom"
          customStyle={step3TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
    </>
  );
}

export default ProductsFilter;
