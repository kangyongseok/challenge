import { selector } from 'recoil';

import { filterCodeIds } from '@constants/productsFilter';

import {
  productsFilterAtomParamState,
  searchOptionsStateFamily,
  selectedSearchOptionsStateFamily
} from '@recoil/productsFilter';

const detailFilterOptionsSelector = selector({
  key: 'productsFilter/detailFilterOptionsSelector',
  get: ({ get }) => {
    const atomParam = get(productsFilterAtomParamState);
    const {
      searchOptions: {
        seasons: baseSeasons = [],
        colors: baseColors = [],
        materials: baseMaterials = []
      }
    } = get(searchOptionsStateFamily(`base-${atomParam}`));
    const {
      searchOptions: { seasons = [], colors = [], materials = [] }
    } = get(searchOptionsStateFamily(`latest-${atomParam}`));
    const { selectedSearchOptions } = get(selectedSearchOptionsStateFamily(`active-${atomParam}`));

    const newSeasons = baseSeasons.map((baseSeason) => ({
      ...baseSeason,
      codeId: filterCodeIds.season,
      count: (seasons.find((season) => season.id === baseSeason.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.season && id === baseSeason.id
      )
    }));

    const newColors = baseColors.map((baseColor) => ({
      ...baseColor,
      codeId: filterCodeIds.color,
      count: (colors.find((color) => color.id === baseColor.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.color && id === baseColor.id
      )
    }));

    const newMaterials = baseMaterials.map((baseMaterial) => ({
      ...baseMaterial,
      codeId: filterCodeIds.material,
      count: (materials.find((material) => material.id === baseMaterial.id) || {}).count || 0,
      checked: selectedSearchOptions.some(
        ({ codeId, id }) => codeId === filterCodeIds.material && id === baseMaterial.id
      )
    }));

    return {
      season: {
        checkedAll: baseSeasons.length === newSeasons.filter(({ checked }) => checked).length,
        filterOptions: newSeasons,
        count: newSeasons.map(({ count }) => count).reduce((a, b) => a + b, 0)
      },
      color: {
        checkedAll: baseColors.length === newColors.filter(({ checked }) => checked).length,
        filterOptions: newColors,
        count: newColors.map(({ count }) => count).reduce((a, b) => a + b, 0)
      },
      material: {
        checkedAll: baseMaterials.length === newMaterials.filter(({ checked }) => checked).length,
        filterOptions: newMaterials,
        count: newMaterials.map(({ count }) => count).reduce((a, b) => a + b, 0)
      }
    };
  }
});

export default detailFilterOptionsSelector;
