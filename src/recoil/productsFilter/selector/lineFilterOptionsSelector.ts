import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import { parseWordToConsonant } from '@utils/brands';

import {
  productsFilterActionStateFamily,
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const lineFilterOptionsSelector = selector({
  key: 'productsFilter/lineFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const { sortValue } = get(productsFilterActionStateFamily(`line-${atomParam}`));
    const {
      searchOptions: { lines: baseLines = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { lines = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    let newLines = baseLines.map((baseLine) => ({
      ...baseLine,
      codeId: filterCodeIds.line,
      count: (lines.find((line) => line.id === baseLine.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.line && id === baseLine.id
      ),
      consonant: parseWordToConsonant(baseLine.name)
    }));

    switch (sortValue) {
      case 'asc':
        newLines = newLines.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        newLines = newLines.sort((a, b) => b.count - a.count);
        break;
    }

    return newLines;
  }
});

export default lineFilterOptionsSelector;
