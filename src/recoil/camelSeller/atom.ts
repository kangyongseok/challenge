import { atom, atomFamily, selector } from 'recoil';
import { isEmpty } from 'lodash-es';

import type { CamelSellerTempData } from '@typings/camelSeller';

export const camelSellerTempSaveDataState = atom<CamelSellerTempData>({
  key: '@camelSeller/tempSaveDataState',
  default: {
    title: '',
    quoteTitle: '',
    condition: { id: 0, name: '', synonyms: '' },
    size: { id: 0, name: '', categorySizeId: 0 },
    brand: { id: 0, name: '' },
    brands: '',
    category: { id: 0, parentId: 0, parentCategoryName: '', subParentId: 0, name: '' },
    categorySizeIds: [],
    brandIds: [],
    sizeOptionIds: [],
    sizes: '',
    price: 0,
    description: '',
    images: [],
    useDeliveryPrice: false
  }
});

export const camelSellerCategoryBrandState = atom<{
  category: {
    id: number;
    parentId: number;
    parentCategoryName: string;
    subParentId: number;
    name: string;
  };
}>({
  key: '@camelSeller/categoryBrandState',
  default: {
    category: { id: 0, parentId: 0, parentCategoryName: '', subParentId: 0, name: '' }
  }
});

export const camelSellerBrandSearchValueState = atom({
  key: '@camelSeller/brandSearchValueState',
  default: ''
});

export const camelSellerSubmitValidatorState = selector({
  key: '@camelSeller/submitValidatorState',
  get: ({ get }) => {
    const tempData = get(camelSellerTempSaveDataState);
    if (tempData) {
      return !!(
        tempData.images.length > 0 &&
        tempData.title &&
        tempData.condition.id &&
        tempData.category.id &&
        tempData.brand.id &&
        (tempData.categorySizeIds?.length || tempData.sizes) &&
        tempData.price
      );
    }
    return false;
  }
});

export const camelSellerSurveyValidatorState = selector({
  key: '@camelSeller/tempDataValidatorState',
  get: ({ get }) => {
    const tempData = get(camelSellerTempSaveDataState);
    if (tempData) {
      return !!(
        tempData.title &&
        tempData.condition.id &&
        tempData.category.id &&
        tempData.brand.id &&
        (tempData.categorySizeIds?.length || tempData.sizes) &&
        tempData.price
      );
    }
    return false;
  }
});

export const camelSellerChangeDetectSelector = selector({
  key: '@camelSeller/changeDetectSelector',
  get: ({ get }) => {
    const tempData = get(camelSellerTempSaveDataState);

    return Object.keys(tempData).some((key) => {
      if (['condition', 'size', 'brand', 'category'].includes(key)) {
        return !!(tempData[key as keyof typeof tempData] as { id: number }).id;
      }
      return !isEmpty(tempData[key as keyof typeof tempData]);
    });
  }
});

export const camelSellerModifiedPriceState = atom({
  key: '@camelSeller/modifiedPriceState',
  default: 0
});

export const camelSellerRecentPriceCardTabNumState = atom<{ id: number; index: number } | null>({
  key: '@camelSeller/recentPriceCardTabNumState',
  default: null
});

export const camelSellerBooleanStateFamily = atomFamily({
  key: '@camelSeller/booleanStateFamily',
  default: (type: string) => ({
    type,
    isState: false
  })
});

export const camelSellerDialogStateFamily = atomFamily({
  key: '@camelSeller/dialogState',
  default: (type: string) => ({
    type,
    open: false
  })
});

export const camelSellerIsImageLoadingState = atom({
  key: '@camelSeller/isImageLoadingState',
  default: false
});

export const camelSellerPriceInputFocusState = atom({
  key: '@camelSeller/priceInputFocusState',
  default: false
});

export const camelSellerSurveyBottomSheetState = atom({
  key: '@camelSeller/surveyBottomSheetOpenState',
  default: {
    open: false,
    step: 0
  }
});

export const camelSellerHasOpenedSurveyBottomSheetState = atom({
  key: '@camelSeller/hasOpenedSurveyBottomSheetState',
  default: false
});

export const camelSellerSurveyFormOffsetTopState = atom({
  key: '@camelSeller/surveyFormOffsetTopState',
  default: 0
});

export const camelSellerIsMovedScrollState = atom({
  key: '@camelSeller/isMovedScrollState',
  default: false
});

export const camelSellerSurveyState = atom<{
  units: {
    id: number;
    name: string;
    selected: boolean;
  }[];
  stores: {
    id: number;
    name: string;
    selected: boolean;
  }[];
  distances: {
    id: number;
    name: string;
    selected: boolean;
  }[];
  colors: {
    id: number;
    name: string;
    description: string;
  }[];
}>({
  key: '@camelSeller/surveyState',
  default: {
    units: [
      {
        id: 2,
        name: '풀구성',
        selected: false
      },
      {
        id: 3,
        name: '구성품 일부 보유',
        selected: false
      },
      {
        id: 4,
        name: '단품(구성품 없음)',
        selected: false
      }
    ],
    stores: [
      {
        id: 2,
        name: '매장(공홈)',
        selected: false
      },
      {
        id: 3,
        name: '온라인몰',
        selected: false
      },
      {
        id: 4,
        name: '중고',
        selected: false
      },
      {
        id: 5,
        name: '기타(선물)',
        selected: false
      }
    ],
    distances: [
      {
        id: 0,
        name: '상관없음',
        selected: false
      },
      {
        id: 101,
        name: '직거래',
        selected: false
      },
      {
        id: 102,
        name: '택배거래',
        selected: false
      }
    ],
    colors: []
  }
});
