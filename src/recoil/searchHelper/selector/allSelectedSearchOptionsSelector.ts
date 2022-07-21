import { selector } from 'recoil';

import commaNumber from '@utils/commaNumber';

import { selectedSearchOptionsState } from '@recoil/searchHelper';

const allSelectedSearchOptionsSelector = selector({
  key: 'searchHelper/allSelectedSearchOptionsSelector',
  get: ({ get }) => {
    const {
      brand,
      parentCategory,
      subParentCategory,
      sizes,
      lines = [],
      maxPrice = 0,
      colors = [],
      seasons = [],
      materials = [],
      platforms = []
    } = get(selectedSearchOptionsState);

    const lineLabel = `${lines
      .slice(0, 1)
      .map(({ name }) => name)
      .join('')}${lines.length > 1 ? ' ...' : ''}`;
    const categoryLabel = subParentCategory.name || parentCategory.name;
    const colorLabel = `${colors
      .slice(0, 3)
      .map(({ name }) => name)
      .join(', ')}${colors.length > 3 ? ' ...' : ''}`;
    const seasonLabel = `${seasons
      .slice(0, 3)
      .map(({ name }) => name)
      .join(', ')}${seasons.length > 3 ? ' ...' : ''}`;
    const materialLabel = `${materials
      .slice(0, 3)
      .map(({ name }) => name)
      .join(', ')}${materials.length > 3 ? ' ...' : ''}`;

    return {
      brandLabel: brand.name,
      lineLabel,
      categoryLabel,
      brandLineCategoryLabels: [brand.name].concat(
        lineLabel.length > 0 ? [lineLabel, categoryLabel] : [categoryLabel]
      ),
      sizeLabel: `${sizes
        .slice(0, 3)
        .map(({ name }) => name)
        .join(', ')}${sizes.length > 3 ? ' ...' : ''}`,
      maxPriceLabel: maxPrice ? `${commaNumber(maxPrice)}만원` : '',
      colorLabel,
      seasonLabel,
      materialLabel,
      moreLabels: [colorLabel]
        .concat([seasonLabel])
        .concat([materialLabel])
        .filter((more) => more.length > 0),
      platformLabel: `${platforms
        .slice(0, 3)
        .map(({ name }) => name)
        .join(', ')}${platforms.length > 3 ? ' ...' : ''}`
    };
  }
});

export default allSelectedSearchOptionsSelector;
