import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import { parseWordToConsonant } from '@utils/brands';

import {
  productsFilterActionStateFamily,
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const colorFilterOptionsSelector = selector({
  key: 'productsFilter/colorFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const { sortValue } = get(productsFilterActionStateFamily(`color-${atomParam}`));
    const {
      searchOptions: { colors: baseColors = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { colors = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    let newColors = baseColors.map((baseColor) => ({
      ...baseColor,
      codeId: filterCodeIds.color,
      count: (colors.find((color) => color.id === baseColor.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.color && id === baseColor.id
      ),
      consonant: parseWordToConsonant(baseColor.name)
    }));

    switch (sortValue) {
      case 'asc':
        newColors = newColors.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        newColors = newColors.sort((a, b) => b.count - a.count);
        break;
    }

    return newColors;
  }
});

export default colorFilterOptionsSelector;
