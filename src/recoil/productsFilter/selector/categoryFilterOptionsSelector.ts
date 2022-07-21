import { selector } from 'recoil';

import { filterCodeIds, filterGenders } from '@constants/productsFilter';

import {
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const categoryFilterOptionsSelector = selector({
  key: 'productsFilter/categoryFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const { searchOptions: { genders = [], parentCategories = [], genderCategories = [] } = {} } =
      get(searchOptionsStateFamily(`base-${atomParam}`));
    const { searchOptions: { genderCategories: latestGenderCategories = [] } = {} } = get(
      searchOptionsStateFamily(`latest-${atomParam}`)
    );
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    // 남여공용
    const requireGender = genders.find(({ id }) => id === filterGenders.common.id);

    return genderCategories.map((genderCategory) => {
      const newParentCategories = parentCategories
        .filter((parentCategory) =>
          genderCategory.id === filterGenders.male.id
            ? parentCategory.name.indexOf('원피스') === -1 && parentCategory.nameEng
            : parentCategory.nameEng
        )
        .map((parentCategory) => {
          const latestSubParentCategories =
            (latestGenderCategories.find(({ id }) => id === genderCategory.id) || {})
              .subParentCategories || [];
          const subParentCategories = genderCategory.subParentCategories
            .filter(({ parentId }) => parentId === parentCategory.id)
            .filter(
              (subParentCategory) =>
                !(
                  genderCategory.id === filterGenders.male.id
                    ? ['스커트', '힐/펌프스', '버킷백', '그릇']
                    : ['그릇']
                ).includes(subParentCategory.name)
            )
            .map((subParentCategory) => ({
              ...subParentCategory,
              codeId: filterCodeIds.category,
              genderIds: [genderCategory.id, (requireGender || {}).id].filter(
                (genderId) => genderId
              ) as number[],
              count:
                (
                  latestSubParentCategories.find(
                    ({ id, parentId }) =>
                      id === subParentCategory.id && parentId === subParentCategory.parentId
                  ) || {}
                ).count || 0,
              checked: selectedSearchOptions.some(({ id, codeId, parentId, genderIds = [] }) => {
                const [selectedGenderId] = genderIds.filter(
                  (genderId) => genderId !== filterGenders.common.id
                );

                return (
                  codeId === filterCodeIds.category &&
                  parentId === subParentCategory.parentId &&
                  id === subParentCategory.id &&
                  selectedGenderId === genderCategory.id
                );
              })
            }));

          return {
            ...parentCategory,
            codeId: filterCodeIds.category,
            count: subParentCategories.map(({ count }) => count).reduce((a, b) => a + b, 0),
            checkedAll:
              subParentCategories.length ===
              subParentCategories.filter((subParentCategory) => subParentCategory.checked).length,
            subParentCategories
          };
        });

      return {
        ...genderCategory,
        codeId: filterCodeIds.category,
        count: newParentCategories.map(({ count }) => count).reduce((a, b) => a + b, 0),
        checkedAll:
          newParentCategories.length ===
          newParentCategories.filter((newParentCategory) => newParentCategory.checkedAll).length,
        parentCategories: newParentCategories
      };
    });
  }
});

export default categoryFilterOptionsSelector;
