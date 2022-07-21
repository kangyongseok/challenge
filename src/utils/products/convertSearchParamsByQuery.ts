import { ParsedUrlQuery } from 'querystring';

import type { ProductOrder, SearchParams } from '@dto/product';

import convertStringToArray from '@utils/convertStringToArray';

import type { ProductsVariant } from '@typings/products';

// TODO 추후 로직 개선
export default function convertSearchParamsByQuery(
  query: ParsedUrlQuery,
  options?: {
    variant?: ProductsVariant;
    onlyBaseSearchParams?: boolean;
    defaultValue?: {
      order?: ProductOrder;
      deviceId?: string;
    };
    excludeSearchParams?: Array<keyof SearchParams>;
  }
): Partial<SearchParams> {
  const {
    variant,
    onlyBaseSearchParams,
    defaultValue: { order: defaultOrder = undefined, deviceId: defaultDeviceId = undefined } = {},
    excludeSearchParams = []
  } = options || {};
  const {
    keyword,
    brands,
    categories,
    categorySizeIds,
    categoryIds,
    lines,
    sizes,
    colors,
    materials,
    seasons,
    genders,
    scoreTotal,
    scorePrice,
    scoreSeller,
    scoreStatus,
    scorePriceRate,
    scorePriceCount,
    idFilterIds,
    brandIds,
    parentIds,
    subParentIds,
    genderIds,
    minPrice,
    maxPrice,
    siteUrlIds,
    lineIds,
    seasonIds,
    colorIds,
    materialIds,
    order,
    notice,
    distance,
    requiredBrands,
    requiredBrandIds,
    requiredLineIds,
    collaboIds,
    deviceId
  }: SearchParams & { notice?: string } = query;
  const baseSearchParams = {
    keyword,
    categoryIds,
    lines,
    sizes,
    colors,
    materials,
    seasons,
    genders,
    scoreTotal,
    scorePrice,
    scoreSeller,
    scoreStatus,
    scorePriceRate,
    scorePriceCount,
    requiredBrandIds,
    requiredLineIds,
    collaboIds,
    deviceId: deviceId || defaultDeviceId
  };
  const searchParams = {
    keyword,
    brands,
    categories,
    categorySizeIds,
    categoryIds,
    lines,
    sizes,
    colors,
    materials,
    seasons,
    genders,
    scoreTotal,
    scorePrice,
    scoreSeller,
    scoreStatus,
    scorePriceRate,
    scorePriceCount,
    idFilterIds,
    brandIds,
    parentIds,
    subParentIds,
    genderIds,
    minPrice,
    maxPrice,
    siteUrlIds,
    lineIds,
    seasonIds,
    colorIds,
    materialIds,
    order: order || defaultOrder,
    notice,
    distance,
    requiredBrands,
    requiredBrandIds,
    requiredLineIds,
    collaboIds,
    deviceId: deviceId || defaultDeviceId
  };

  if (variant === 'categories') {
    delete searchParams.keyword;
    searchParams[variant] = String(keyword || '').split('-');
  } else if (variant === 'brands') {
    delete searchParams.keyword;
    searchParams.requiredBrands = String(keyword || '').split('-');
  }

  if (onlyBaseSearchParams) {
    const baseSearchParamsKeys = Object.keys(searchParams) as Array<keyof typeof baseSearchParams>;

    baseSearchParamsKeys.forEach((key) => {
      const baseSearchParam = baseSearchParams[key];

      if (!baseSearchParam) delete baseSearchParams[key];
    });

    baseSearchParamsKeys.forEach((key) => {
      if (key === 'requiredLineIds' && requiredLineIds) {
        baseSearchParams[key] = convertStringToArray(String(requiredLineIds));
      } else if (key === 'requiredBrandIds' && requiredBrandIds) {
        baseSearchParams[key] = convertStringToArray(String(requiredBrandIds));
      } else if (key === 'collaboIds' && collaboIds) {
        baseSearchParams[key] = convertStringToArray(String(collaboIds));
      } else if (key === 'genders' && genders) {
        baseSearchParams[key] = String(genders).split(',');
      } else if (key === 'materials' && materials) {
        baseSearchParams[key] = String(materials).split(',');
      } else if (key === 'colors' && colors) {
        baseSearchParams[key] = String(colors).split(',');
      } else if (key === 'seasons' && seasons) {
        baseSearchParams[key] = String(seasons).split(',');
      } else if (key === 'sizes' && sizes) {
        baseSearchParams[key] = String(sizes).split(',');
      } else if (key === 'lines' && lines) {
        baseSearchParams[key] = String(lines).split(',');
      }
    });

    excludeSearchParams.forEach((key) => {
      delete baseSearchParams[key as keyof typeof baseSearchParams];
    });

    if (variant === 'categories') {
      delete baseSearchParams.keyword;
      return {
        ...baseSearchParams,
        [variant]: searchParams[variant]
      };
    }
    if (variant === 'brands') {
      delete baseSearchParams.keyword;
      return {
        ...baseSearchParams,
        requiredBrands: searchParams.requiredBrands
      };
    }

    return baseSearchParams;
  }

  const searchParamsKeys = Object.keys(searchParams) as Array<keyof typeof searchParams>;

  searchParamsKeys.forEach((key) => {
    const searchParam = searchParams[key];

    if (!searchParam) delete searchParams[key];
  });

  if (!Number.isNaN(Number(distance))) searchParams.distance = Number(searchParams.distance);

  searchParamsKeys.forEach((key) => {
    if (key === 'brandIds' && brandIds) {
      searchParams[key] = convertStringToArray(String(brandIds));
    } else if (key === 'categorySizeIds' && categorySizeIds) {
      searchParams[key] = convertStringToArray(String(categorySizeIds));
    } else if (key === 'idFilterIds' && idFilterIds) {
      searchParams[key] = convertStringToArray(String(idFilterIds));
    } else if (key === 'parentIds' && parentIds) {
      searchParams[key] = convertStringToArray(String(parentIds));
    } else if (key === 'subParentIds' && subParentIds) {
      searchParams[key] = convertStringToArray(String(subParentIds));
    } else if (key === 'genderIds' && genderIds) {
      searchParams[key] = convertStringToArray(String(genderIds));
    } else if (key === 'siteUrlIds' && siteUrlIds) {
      searchParams[key] = convertStringToArray(String(siteUrlIds));
    } else if (key === 'lineIds' && lineIds) {
      searchParams[key] = convertStringToArray(String(lineIds));
    } else if (key === 'seasonIds' && seasonIds) {
      searchParams[key] = convertStringToArray(String(seasonIds));
    } else if (key === 'colorIds' && colorIds) {
      searchParams[key] = convertStringToArray(String(colorIds));
    } else if (key === 'materialIds' && materialIds) {
      searchParams[key] = convertStringToArray(String(materialIds));
    } else if (key === 'requiredLineIds' && requiredLineIds) {
      searchParams[key] = convertStringToArray(String(requiredLineIds));
    } else if (key === 'requiredBrandIds' && requiredBrandIds) {
      searchParams[key] = convertStringToArray(String(requiredBrandIds));
    } else if (key === 'collaboIds' && collaboIds) {
      searchParams[key] = convertStringToArray(String(collaboIds));
    } else if (key === 'genders' && genders) {
      searchParams[key] = String(genders).split(',');
    } else if (key === 'materials' && materials) {
      searchParams[key] = String(materials).split(',');
    } else if (key === 'colors' && colors) {
      searchParams[key] = String(colors).split(',');
    } else if (key === 'seasons' && seasons) {
      searchParams[key] = String(seasons).split(',');
    } else if (key === 'sizes' && sizes) {
      searchParams[key] = String(sizes).split(',');
    } else if (key === 'lines' && lines) {
      searchParams[key] = String(lines).split(',');
    }
  });

  excludeSearchParams.forEach((key) => {
    delete searchParams[key as keyof typeof searchParams];
  });

  return searchParams;
}
