import { useEffect, useMemo, useRef, useState } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Tooltip, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import sortBy from 'lodash-es/sortBy';

import OnBoardingSpotlight from '@components/UI/organisms/OnBoardingSpotlight';
import {
  ProductsDynamicFilter,
  ProductsFilterHistory,
  ProductsGeneralFilter
} from '@components/pages/products/index';

import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';
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

import type { ProductsVariant } from '@typings/products';
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
import { deviceIdState, userOnBoardingTriggerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

interface ProductsFilterProps {
  variant: ProductsVariant;
  showDynamicFilter?: boolean;
}

function ProductsFilter({ variant, showDynamicFilter = false }: ProductsFilterProps) {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];

  const setAtomParamState = useSetRecoilState(productsFilterAtomParamState);
  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const deviceId = useRecoilValue(deviceIdState);
  const [{ products: productsOnBoardingTrigger }, setUserOnBoardingTriggerState] = useRecoilState(
    userOnBoardingTriggerState
  );
  const [{ searchOptions: baseSearchOptions }, setBaseSearchOptionsState] = useRecoilState(
    searchOptionsStateFamily(`base-${atomParam}`)
  );
  const setSearchParamsState = useSetRecoilState(searchParamsStateFamily(`search-${atomParam}`));
  const [{ searchParams: searchOptionsParams }, setSearchOptionsParamsState] = useRecoilState(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const [{ selectedSearchOptions }, setSelectedSearchOptionsState] = useRecoilState(
    selectedSearchOptionsStateFamily(`active-${atomParam}`)
  );
  const [{ searchParams: baseSearchParams }, setBaseSearchParamsState] = useRecoilState(
    searchParamsStateFamily(`base-${atomParam}`)
  );
  const { selectedSearchOptionsHistory } = useRecoilValue(filterOperationInfoSelector);
  const [activeMyFilter, setActiveMyFilter] = useRecoilState(activeMyFilterState);
  const [dynamicOptions, setDynamicOptionsState] = useRecoilState(
    dynamicOptionsStateFamily(atomParam)
  );

  const setMyFilterIntersectionCategorySizesState = useSetRecoilState(
    myFilterIntersectionCategorySizesState
  );
  const setSearchOptionsState = useSetRecoilState(searchOptionsStateFamily(`latest-${atomParam}`));
  const setTotalCount = useSetRecoilState(
    productsFilterTotalCountStateFamily(`searchOption-${atomParam}`)
  );

  const { data: accessUser } = useQueryAccessUser();
  const {
    data: {
      baseSearchOptions: newBaseSearchOptions,
      searchOptions,
      userProductKeyword,
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
  const [myFilterTooltipCustomStyle, setMyFilterTooltipCustomStyle] = useState<CustomStyle>({});
  const [step1TooltipCustomStyle, setStep1TooltipCustomStyle] = useState<CustomStyle>({});
  const [step2TooltipCustomStyle, setStep2TooltipCustomStyle] = useState<CustomStyle>({});
  const [step3TooltipCustomStyle, setStep3TooltipCustomStyle] = useState<CustomStyle>({});

  const isUpdateSelectedSearchOptions = useRef(false);
  const pendingInActiveMyFilterSearchRef = useRef(false);
  const isUpdatedAdditionalSelectedSearchOptionsRef = useRef(false);
  const mapFilterButtonRef = useRef<HTMLButtonElement | null>(null);
  const legitFilterButtonRef = useRef<HTMLDivElement | null>(null);
  const generalFilterRef = useRef<HTMLDivElement | null>(null);

  const {
    data: {
      info: { value: { gender = '' } = {} } = {},
      size: { value: { tops = [], bottoms = [], shoes = [] } = {} } = {}
    } = {}
  } = useQuery(queryKeys.users.userInfo(), fetchUserInfo, {
    enabled: !!accessUser
  });
  const { categorySizes = [], genderCategories = [] } = baseSearchOptions;

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

  const handleClickMyFilterInActiveTooltip = () => {
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
          logEvent(attrKeys.products.viewMyFilterTooltip, {
            name: attrProperty.name.productList
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
    const handleClickMyFilterTooltip = () => setOpenMyFilterTooltip(false);

    if (openMyFilterTooltip) {
      window.addEventListener('click', handleClickMyFilterTooltip);
    } else {
      window.removeEventListener('click', handleClickMyFilterTooltip);
    }

    return () => {
      window.removeEventListener('click', handleClickMyFilterTooltip);
    };
  }, [openMyFilterTooltip]);

  useEffect(() => {
    setTotalCount(({ type }) => ({
      type,
      count: productTotal || 0
    }));
  }, [setTotalCount, productTotal]);

  useEffect(() => {
    if (!router.isReady || !hasBaseSearchParams || !progressDone) return;

    if (generalFilterRef.current) {
      const { clientHeight } = generalFilterRef.current;
      const { top } = generalFilterRef.current.getBoundingClientRect();

      setStep1TooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight + 15,
        left: 20,
        transform: 'none',
        height: 'fit-content'
      });
      setMyFilterTooltipCustomStyle({
        position: 'fixed',
        top: top + clientHeight,
        left: 'inherit',
        right: 20,
        transform: 'none',
        height: 'fit-content',
        '& > svg': { left: 'auto', right: 11 }
      });
    }

    if (mapFilterButtonRef.current) {
      setStep2TooltipCustomStyle({
        position: 'fixed',
        top:
          mapFilterButtonRef.current.getBoundingClientRect().top +
          mapFilterButtonRef.current.clientHeight +
          15,
        left: 20,
        transform: 'none',
        height: 'fit-content'
      });
    }
    if (legitFilterButtonRef.current) {
      setStep3TooltipCustomStyle({
        position: 'fixed',
        top:
          legitFilterButtonRef.current.getBoundingClientRect().top +
          legitFilterButtonRef.current.clientHeight +
          22,
        left: legitFilterButtonRef.current.offsetLeft - 51,
        transform: 'none',
        height: 'fit-content',
        '& > svg': { left: 'auto', right: 11 }
      });
    }

    if (accessUser) {
      setProductsOnBoardingTrigger(productsOnBoardingTrigger);
    }
  }, [router.isReady, productsOnBoardingTrigger, accessUser, hasBaseSearchParams, progressDone]);

  useEffect(() => {
    if (accessUser) {
      if (productsOnBoardingTrigger.complete && productsOnBoardingTrigger.step === 2) {
        setProductsOnBoardingTrigger({ complete: false, step: 2 });
      }
    }
  }, [accessUser, productsOnBoardingTrigger]);

  return (
    <>
      <ProductsGeneralFilter
        ref={generalFilterRef}
        mapFilterButtonRef={mapFilterButtonRef}
        legitFilterButtonRef={legitFilterButtonRef}
        isLoading={!hasBaseSearchParams || !progressDone}
        variant={variant}
      />
      {showDynamicFilter && dynamicOptions.length > 0 && hasBaseSearchParams && progressDone && (
        <ProductsDynamicFilter />
      )}
      <ProductsFilterHistory
        variant={variant}
        showProductKeywordSaveChip={showProductKeywordSaveChip}
      />
      <OnBoardingSpotlight
        open={hasBaseSearchParams && progressDone && !complete && step === 0}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: { complete: false, step: 1 }
          }))
        }
        targetRef={generalFilterRef}
        customStyle={{ height: 100 }}
      >
        <Tooltip
          open={hasBaseSearchParams && progressDone && !complete && step === 0}
          variant="ghost"
          brandColor="primary"
          message={
            <Typography
              variant="body2"
              weight="medium"
              customStyle={{
                '& > span': { position: 'relative', color: primary.main }
              }}
            >
              새로워진 필터로 <span>찾으시는 조건</span>의 매물만 보세요 👀
            </Typography>
          }
          triangleLeft={16}
          placement="bottom"
          customStyle={step1TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={hasBaseSearchParams && progressDone && !complete && step === 1}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: { complete: false, step: 2 }
          }))
        }
        targetRef={mapFilterButtonRef}
        customSpotlightPosition={{ top: 1, left: 1 }}
        customStyle={{ borderRadius: 8 }}
      >
        <Tooltip
          open={hasBaseSearchParams && progressDone && !complete && step === 1}
          variant="ghost"
          brandColor="primary"
          message={
            <Typography variant="body2" weight="medium" brandColor="primary">
              당근마켓 매물도 보고, 직거래 위주로 거래하신다면 클릭!
            </Typography>
          }
          triangleLeft={16}
          placement="bottom"
          customStyle={step2TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <OnBoardingSpotlight
        open={hasBaseSearchParams && progressDone && !complete && step === 2}
        onClose={() =>
          setUserOnBoardingTriggerState((prevState) => ({
            ...prevState,
            products: { complete: true, step: 3 }
          }))
        }
        targetRef={legitFilterButtonRef}
        customSpotlightPosition={{ width: 16, height: 16, top: -8, left: -8 }}
        customStyle={{ borderRadius: 8 }}
      >
        <Tooltip
          open={hasBaseSearchParams && progressDone && !complete && step === 2}
          message={
            <Typography variant="body2" weight="medium" brandColor="primary">
              정가품이 궁금하다면 클릭!
            </Typography>
          }
          variant="ghost"
          brandColor="primary"
          placement="bottom"
          customStyle={step3TooltipCustomStyle}
        />
      </OnBoardingSpotlight>
      <Tooltip
        className="products-filter-tooltip"
        open={hasBaseSearchParams && progressDone && openMyFilterTooltip}
        message={
          <Flexbox gap={8} alignment="center">
            <Typography variant="body2" weight="medium" customStyle={{ color: common.uiWhite }}>
              {variant === 'search' ? '내 성별/사이즈만 보기' : '내 사이즈만 보기'}가 켜져 있어요!
            </Typography>
            <Typography
              variant="body2"
              weight="medium"
              onClick={handleClickMyFilterInActiveTooltip}
              customStyle={{
                textDecoration: 'underline',
                color: common.ui80,
                cursor: 'pointer'
              }}
            >
              필터끄기
            </Typography>
          </Flexbox>
        }
        brandColor="black"
        placement="bottom"
        customStyle={myFilterTooltipCustomStyle}
      />
    </>
  );
}

export default ProductsFilter;
