import { atom } from 'recoil';

import type { ProductOrder, SearchParams } from '@dto/product';

interface BrandAndCategory {
  name: string;
  brandId?: number;
  parentId?: number;
}

interface CamelProductCuration {
  brandsAndCategories: BrandAndCategory[];
  selectedChip: number;
}

export const camelProductCurationState = atom<CamelProductCuration>({
  key: 'camelProductCurationState',
  default: {
    brandsAndCategories: [],
    selectedChip: 0
  }
});

export const chipMenuPrevScrollState = atom({
  key: 'camelProductCuration/chipMenuPrevScrollState',
  default: 0
});

export const productCurationPrevScrollState = atom({
  key: 'camelProductCuration/productCurationPrevScrollState',
  default: 0
});

export const searchParamsState = atom<Partial<SearchParams>>({
  key: 'camelProductCuration/searchParamsState',
  default: {
    size: 20,
    siteUrlIds: [161],
    order: 'recommDesc' as ProductOrder
  }
});

export default camelProductCurationState;
