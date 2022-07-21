import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import { parseWordToConsonant } from '@utils/brands';

import {
  productsFilterActionStateFamily,
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const platformFilterOptionsSelector = selector({
  key: 'productsFilter/platformFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const { sortValue } = get(productsFilterActionStateFamily(`platform-${atomParam}`));
    const {
      searchOptions: { siteUrls: baseSiteUrls = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { siteUrls = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    let newSiteUrls = baseSiteUrls.map((baseSiteUrl) => ({
      ...baseSiteUrl,
      codeId: filterCodeIds.platform,
      count: (siteUrls.find((siteUrl) => siteUrl.id === baseSiteUrl.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.platform && id === baseSiteUrl.id
      ),
      consonant: parseWordToConsonant(baseSiteUrl.name)
    }));

    switch (sortValue) {
      case 'asc':
        newSiteUrls = newSiteUrls.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        newSiteUrls = newSiteUrls.sort((a, b) => b.count - a.count);
        break;
    }

    return newSiteUrls;
  }
});

export default platformFilterOptionsSelector;
