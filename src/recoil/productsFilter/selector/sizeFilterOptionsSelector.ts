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
          categorySizes: newCategorySizes
        };
      })
      .filter((parentCategory) => parentCategory.categorySizes.length);
  }
});

export default sizeFilterOptionsSelector;
