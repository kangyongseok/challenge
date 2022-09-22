import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import {
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const genderFilterOptionsSelector = selector({
  key: 'productsFilter/genderFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const {
      searchOptions: { genderCategories: baseGenderCategories = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { genderCategories = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    return baseGenderCategories.map((baseGenderCategory) => ({
      ...baseGenderCategory,
      codeId: filterCodeIds.gender,
      count:
        (genderCategories.find((brand) => baseGenderCategory.id === brand.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id, gender }) =>
          codeId === filterCodeIds.gender &&
          (id === baseGenderCategory.id || gender === baseGenderCategory.synonyms)
      )
    }));
  }
});

export default genderFilterOptionsSelector;
