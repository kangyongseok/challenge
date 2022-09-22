import { atom, atomFamily } from 'recoil';

import type { SearchParams } from '@dto/product';

import LocalStorage from '@library/localStorage';

import { filterGenders } from '@constants/productsFilter';
import { DEVICE_ID, SAVED_SEARCH_HELPER_SEARCH_OPTIONS } from '@constants/localStorage';

export const searchHelperPopupStateFamily = atomFamily<boolean, 'continue' | 'break'>({
  key: 'searchHelper/popupStateFamily',
  default: false
});

export interface SelectedSearchOptions {
  pathname: string;
  brand: { id: number; name: string };
  gender: { id: number; name: string };
  parentCategory: { id: number; name: string };
  subParentCategory: { id: number; name: string };
  sizes: { id: number; name: string }[];
  lines?: { id: number; name: string }[];
  maxPrice?: number;
  minPrice?: number;
  platforms?: { id: number; name: string }[];
  colors?: { id: number; name: string }[];
  seasons?: { id: number; name: string }[];
  materials?: { id: number; name: string }[];
}

export const selectedSearchOptionsDefault = {
  pathname: '',
  brand: { id: 0, name: '' },
  gender: { id: 0, name: '' },
  parentCategory: { id: 0, name: '' },
  subParentCategory: { id: 0, name: '' },
  sizes: []
};

export const selectedSearchOptionsState = atom<SelectedSearchOptions>({
  key: 'searchHelper/selectedSearchOptionsState',
  default: selectedSearchOptionsDefault,
  effects: [
    ({ onSet, setSelf }) => {
      const savedSearchHelperOptions = LocalStorage.get<SelectedSearchOptions>(
        SAVED_SEARCH_HELPER_SEARCH_OPTIONS
      );

      if (savedSearchHelperOptions) setSelf(savedSearchHelperOptions);

      onSet((newValue, _, isReset) => {
        if (isReset) {
          LocalStorage.remove(SAVED_SEARCH_HELPER_SEARCH_OPTIONS);
        } else {
          LocalStorage.set(SAVED_SEARCH_HELPER_SEARCH_OPTIONS, newValue);
        }
      });
    }
  ]
});

export const searchParamsState = atom<SearchParams>({
  key: 'searchHelper/searchParamsState',
  default: {},
  effects: [
    ({ setSelf }) => {
      const savedSearchHelperOptions = LocalStorage.get<SelectedSearchOptions>(
        SAVED_SEARCH_HELPER_SEARCH_OPTIONS
      );
      const deviceId = LocalStorage.get<string>(DEVICE_ID);

      if (savedSearchHelperOptions) {
        const {
          brand,
          gender,
          parentCategory,
          subParentCategory,
          sizes,
          lines = [],
          maxPrice = 0,
          minPrice = 0,
          platforms = [],
          colors = [],
          seasons = [],
          materials = []
        } = savedSearchHelperOptions;
        const newSearchHelperSearchParams: SearchParams = deviceId
          ? { logging: false, deviceId }
          : { logging: false };

        if (brand.id > 0) newSearchHelperSearchParams.brandIds = [brand.id];

        if (parentCategory.id > 0) newSearchHelperSearchParams.parentIds = [parentCategory.id];

        if (subParentCategory.id > 0)
          newSearchHelperSearchParams.subParentIds = [subParentCategory.id];

        if (gender.id > 0)
          newSearchHelperSearchParams.genderIds = [gender.id, filterGenders.common.id];

        newSearchHelperSearchParams.categorySizeIds = sizes.map(({ id }) => id);
        newSearchHelperSearchParams.lineIds = lines.map(({ id }) => id);

        if (minPrice > 0) newSearchHelperSearchParams.maxPrice = minPrice * 10000;

        if (maxPrice > 0) newSearchHelperSearchParams.maxPrice = (maxPrice + 1) * 10000;

        newSearchHelperSearchParams.siteUrlIds = platforms.map(({ id }) => id);
        newSearchHelperSearchParams.colorIds = colors.map(({ id }) => id);
        newSearchHelperSearchParams.seasonIds = seasons.map(({ id }) => id);
        newSearchHelperSearchParams.materialIds = materials.map(({ id }) => id);

        setSelf(newSearchHelperSearchParams);
      }
    },
    ({ onSet, setSelf }) => {
      onSet((newValue) => {
        const deviceId = LocalStorage.get<string>(DEVICE_ID);

        setSelf(
          deviceId ? { ...newValue, logging: false, deviceId } : { ...newValue, logging: false }
        );
      });
    }
  ]
});
