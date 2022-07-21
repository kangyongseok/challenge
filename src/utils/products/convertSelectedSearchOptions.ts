import { ProductSearchOption, SearchParams } from '@dto/product';

import { filterCodeIds, filterGenders } from '@constants/productsFilter';

import convertStringToArray from '@utils/convertStringToArray';

import type { SelectedSearchOption } from '@typings/products';

// TODO 추후 로직 개선
export default function convertSelectedSearchOptions(
  searchParams: SearchParams,
  baseSearchOptions: Partial<ProductSearchOption>
) {
  let selectedSearchOptions: SelectedSearchOption[] = [];
  const {
    brandIds = '',
    categorySizeIds = '',
    colorIds = '',
    lineIds = '',
    materialIds = '',
    seasonIds = '',
    siteUrlIds = '',
    parentIds = '',
    subParentIds = '',
    genderIds = '',
    minPrice,
    maxPrice,
    idFilterIds = [],
    distance,
    order
  } = searchParams;
  const {
    brands = [],
    categorySizes = [],
    colors = [],
    lines = [],
    materials = [],
    seasons = [],
    siteUrls = [],
    subParentCategories = []
  } = baseSearchOptions;

  const searchParamKeys = Object.keys(searchParams) as Array<keyof typeof searchParams>;

  searchParamKeys.forEach((key) => {
    if (searchParams[key] || !Number.isNaN(Number(searchParams[key]))) {
      if (key === 'brandIds') {
        const convertedBrandIds = convertStringToArray(String(brandIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...brands
            .filter(({ id }) => convertedBrandIds.includes(id))
            .map((brand) => ({
              ...brand,
              codeId: filterCodeIds.brand
            }))
        ];
      } else if (key === 'categorySizeIds') {
        const convertedCategorySizeIds = convertStringToArray(String(categorySizeIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...categorySizes
            .filter(({ categorySizeId }) => convertedCategorySizeIds.includes(categorySizeId))
            .map((categorySize) => ({
              ...categorySize,
              codeId: filterCodeIds.size
            }))
        ];
      } else if (key === 'colorIds') {
        const convertedColorIds = convertStringToArray(String(colorIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...colors
            .filter(({ id }) => convertedColorIds.includes(id))
            .map((color) => ({
              ...color,
              codeId: filterCodeIds.color
            }))
        ];
      } else if (key === 'lineIds') {
        const convertedLineIds = convertStringToArray(String(lineIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...lines
            .filter(({ id }) => convertedLineIds.includes(id))
            .map((line) => ({
              ...line,
              codeId: filterCodeIds.line
            }))
        ];
      } else if (key === 'materialIds') {
        const convertedMaterialIds = convertStringToArray(String(materialIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...materials
            .filter(({ id }) => convertedMaterialIds.includes(id))
            .map((material) => ({
              ...material,
              codeId: filterCodeIds.material
            }))
        ];
      } else if (key === 'seasonIds') {
        const convertedSeasonIds = convertStringToArray(String(seasonIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...seasons
            .filter(({ id }) => convertedSeasonIds.includes(id))
            .map((season) => ({
              ...season,
              codeId: filterCodeIds.season
            }))
        ];
      } else if (key === 'siteUrlIds') {
        const convertedSiteUrlIds = convertStringToArray(String(siteUrlIds));

        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...siteUrls
            .filter(({ id }) => convertedSiteUrlIds.includes(id))
            .map((siteUrl) => ({
              ...siteUrl,
              codeId: filterCodeIds.platform
            }))
        ];
      } else if (key === 'genderIds') {
        const convertedGenderIds = convertStringToArray(String(genderIds)).filter(
          (genderId) => genderId !== filterGenders.common.id
        );

        convertedGenderIds.forEach((genderId) => {
          if (parentIds && !subParentIds) {
            const convertedParentIds = convertStringToArray(String(parentIds));

            selectedSearchOptions = [
              ...selectedSearchOptions,
              ...subParentCategories
                .filter(({ parentId }) => convertedParentIds.includes(parentId))
                .map((subParentCategory) => ({
                  ...subParentCategory,
                  codeId: filterCodeIds.category,
                  genderIds: [genderId, filterGenders.common.id]
                }))
            ];
          } else if (!parentIds && subParentIds) {
            const convertedSubParentIds = convertStringToArray(String(subParentIds));

            selectedSearchOptions = [
              ...selectedSearchOptions,
              ...subParentCategories
                .filter(({ id }) => convertedSubParentIds.includes(id))
                .map((subParentCategory) => ({
                  ...subParentCategory,
                  codeId: filterCodeIds.category,
                  genderIds: [genderId, filterGenders.common.id]
                }))
            ];
          } else if (parentIds && subParentIds) {
            const convertedParentIds = convertStringToArray(String(parentIds));
            const convertedSubParentIds = convertStringToArray(String(subParentIds));

            selectedSearchOptions = [
              ...selectedSearchOptions,
              ...subParentCategories
                .filter(
                  ({ id, parentId }) =>
                    convertedParentIds.includes(parentId) && convertedSubParentIds.includes(id)
                )
                .map((subParentCategory) => ({
                  ...subParentCategory,
                  codeId: filterCodeIds.category,
                  genderIds: [genderId, filterGenders.common.id]
                }))
            ];
          }
        });
      } else if (key === 'minPrice' || key === 'maxPrice') {
        if (minPrice && maxPrice) {
          selectedSearchOptions = [
            ...selectedSearchOptions.filter(({ codeId }) => codeId !== filterCodeIds.price),
            {
              codeId: filterCodeIds.price,
              minPrice,
              maxPrice
            }
          ];
        }
      } else if (key === 'idFilterIds') {
        selectedSearchOptions = [
          ...selectedSearchOptions,
          ...idFilterIds.map((id) => ({
            id,
            codeId: filterCodeIds.id
          }))
        ];
      } else if (key === 'distance') {
        selectedSearchOptions = [
          ...selectedSearchOptions,
          {
            codeId: filterCodeIds.map,
            distance
          }
        ];
      } else if (key === 'order') {
        selectedSearchOptions = [
          ...selectedSearchOptions,
          {
            codeId: filterCodeIds.order,
            productOrder: order
          }
        ];
      }
    }
  });

  return selectedSearchOptions;
}
