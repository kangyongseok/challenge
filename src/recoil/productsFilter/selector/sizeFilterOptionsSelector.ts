import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import {
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const sizeFilterOptionsSelector = selector({
  key: 'productsFilter/sizeFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const {
      searchOptions: { parentCategories = [], categorySizes: baseCategorySizes = [] }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { categorySizes = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    return parentCategories
      .map((parentCategory) => {
        const newCategorySizes = baseCategorySizes
          .filter(({ parentCategoryId }) => parentCategoryId === parentCategory.id)
          .map((baseCategorySize) => ({
            ...baseCategorySize,
            codeId: filterCodeIds.size,
            count:
              (
                categorySizes.find(
                  ({ parentCategoryId, categorySizeId }) =>
                    parentCategoryId === baseCategorySize.parentCategoryId &&
                    categorySizeId === baseCategorySize.categorySizeId
                ) || {}
              ).count || 0,
            checked: selectedSearchOptions.some(
              ({ codeId, parentCategoryId, categorySizeId }) =>
                codeId === filterCodeIds.size &&
                parentCategoryId === baseCategorySize.parentCategoryId &&
                categorySizeId === baseCategorySize.categorySizeId
            )
          }));

        return {
          ...parentCategory,
          codeId: filterCodeIds.size,
          count: newCategorySizes.map(({ count }) => count).reduce((a, b) => a + b, 0),
          checkedAll:
            newCategorySizes.length ===
            newCategorySizes.filter((newCategorySize) => newCategorySize.checked).length,
          categorySizes: newCategorySizes,
          filteredCategorySizes: newCategorySizes.filter(({ viewSize }) => {
            const replacedName = parentCategory.name.replace(/\(P\)/g, '');
            if (['아우터', '상의'].includes(replacedName)) {
              return /^[a-zA-Z]*$/.test(viewSize);
            }
            if (replacedName === '하의') {
              return /^([\d]|[\d\sINCH])*$/.test(viewSize);
            }
            if (replacedName === '신발') {
              return /^[\d]*$/.test(viewSize);
            }
            return true;
          })
        };
      })
      .filter((parentCategory) => parentCategory.categorySizes.length);
  }
});

export default sizeFilterOptionsSelector;
