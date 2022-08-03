import { ParsedUrlQuery } from 'querystring';

import type { Product, ProductOrder, ProductSearchOption, SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { filterCodeIds, filterGenders } from '@constants/productsFilter';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

import convertStringToArray from '@utils/convertStringToArray';

import type { ProductsVariant, SelectedSearchOption } from '@typings/products';

interface ProductDetailAttProps {
  key: string;
  product: Product;
  rest?: object;
  source?: string;
}
interface ProductDetailAttProps {
  key: string;
  product: Product;
  rest?: object;
  source?: string;
}

export function convertSearchParams(
  selectedSearchOptions: SelectedSearchOption[],
  options?: { baseSearchParams?: SearchParams; excludeCodeId?: number }
) {
  const { baseSearchParams = {}, excludeCodeId } = options || {};
  const searchParams: SearchParams = { ...baseSearchParams };

  selectedSearchOptions.forEach(
    ({
      codeId,
      id,
      parentId,
      categorySizeId,
      genderIds: selectedSearchOptionGenderIds = [],
      minPrice,
      maxPrice,
      distance,
      productOrder
    }) => {
      const {
        brandIds = [],
        parentIds = [],
        subParentIds = [],
        genderIds = [],
        siteUrlIds = [],
        categorySizeIds = [],
        lineIds = [],
        seasonIds = [],
        colorIds = [],
        materialIds = [],
        idFilterIds = []
      } = searchParams;

      if (id && codeId === filterCodeIds.brand) {
        searchParams.brandIds = Array.from(new Set([...brandIds, id]));
      } else if (id && parentId && codeId === filterCodeIds.category) {
        searchParams.parentIds = Array.from(new Set([...parentIds, parentId]));
        searchParams.subParentIds = Array.from(new Set([...subParentIds, id]));
        searchParams.genderIds = Array.from(
          new Set([...genderIds, ...selectedSearchOptionGenderIds])
        );
      } else if (minPrice && maxPrice && codeId === filterCodeIds.price) {
        searchParams.minPrice = minPrice;
        searchParams.maxPrice = maxPrice;
      } else if (id && codeId === filterCodeIds.platform) {
        searchParams.siteUrlIds = Array.from(new Set([...siteUrlIds, id]));
      } else if (categorySizeId && codeId === filterCodeIds.size) {
        searchParams.categorySizeIds = Array.from(new Set([...categorySizeIds, categorySizeId]));
      } else if (id && codeId === filterCodeIds.line) {
        searchParams.lineIds = Array.from(new Set([...lineIds, id]));
      } else if (id && codeId === filterCodeIds.season) {
        searchParams.seasonIds = Array.from(new Set([...seasonIds, id]));
      } else if (id && codeId === filterCodeIds.color) {
        searchParams.colorIds = Array.from(new Set([...colorIds, id]));
      } else if (id && codeId === filterCodeIds.material) {
        searchParams.materialIds = Array.from(new Set([...materialIds, id]));
      } else if (id && codeId === filterCodeIds.id) {
        searchParams.idFilterIds = Array.from(new Set([...idFilterIds, id]));
      } else if (!Number.isNaN(Number(distance)) && codeId === filterCodeIds.map) {
        searchParams.distance = distance;
      } else if (productOrder && codeId === filterCodeIds.order) {
        searchParams.order = productOrder;
      }
    }
  );

  if (excludeCodeId === filterCodeIds.brand) {
    delete searchParams.brandIds;
  } else if (excludeCodeId === filterCodeIds.size) {
    delete searchParams.categorySizeIds;
  } else if (excludeCodeId === filterCodeIds.category) {
    delete searchParams.parentIds;
    delete searchParams.subParentIds;
    delete searchParams.genderIds;
  } else if (excludeCodeId === filterCodeIds.price) {
    delete searchParams.minPrice;
    delete searchParams.maxPrice;
  } else if (excludeCodeId === filterCodeIds.platform) {
    delete searchParams.siteUrlIds;
  } else if (excludeCodeId === filterCodeIds.line) {
    delete searchParams.lineIds;
  } else if (excludeCodeId === filterCodeIds.detailOption) {
    delete searchParams.seasonIds;
    delete searchParams.colorIds;
    delete searchParams.materialIds;
  }

  return searchParams;
}

export function convertSearchParamsByQuery(
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

export function convertSelectedSearchOptions(
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

export function getEventPropertyOrder(productOrder: ProductOrder) {
  if (productOrder === 'postedDesc') {
    return 'RECENT';
  }
  if (productOrder === 'postedAllDesc') {
    return 'RECENT_ALL';
  }
  if (productOrder === 'priceDesc') {
    return 'HIGHP';
  }
  if (productOrder === 'priceAsc') {
    return 'LOWP';
  }
  return 'RECOMM';
}

export function getEventPropertySortValue(order?: ProductOrder) {
  if (order === 'postedDesc') {
    return 1;
  }
  if (order === 'postedAllDesc') {
    return 6;
  }
  if (order === 'priceAsc') {
    return 3;
  }
  if (order === 'priceDesc') {
    return 4;
  }
  return 7;
}

export default function getEventPropertyTitle(codeId: number) {
  if (codeId === filterCodeIds.category) {
    return 'CATEGORY';
  }
  if (codeId === filterCodeIds.brand) {
    return 'BRAND';
  }
  if (codeId === filterCodeIds.size) {
    return 'SIZE';
  }
  if (codeId === filterCodeIds.platform) {
    return 'SITE';
  }
  if (codeId === filterCodeIds.line) {
    return 'LINE';
  }
  if (codeId === filterCodeIds.season) {
    return 'SEASON';
  }
  if (codeId === filterCodeIds.color) {
    return 'COLOR+MATERIAL';
  }
  if (codeId === filterCodeIds.price) {
    return 'PRICE';
  }
  if (codeId === filterCodeIds.detailOption) {
    return 'COLOR+MATERIAL';
  }
  return 'EMPTY';
}

export function getEventPropertyViewType(variant: ProductsVariant, parentIds?: string | string[]) {
  if (variant === 'categories') {
    return 'CATEGORY';
  }
  if (variant === 'brands' && !parentIds) {
    return 'BRAND';
  }
  if (variant === 'brands' && parentIds) {
    return 'BRAND_CATEGORY1';
  }
  if (variant === 'camel') {
    return 'CAMEL';
  }

  return 'SEARCH';
}

export function productDetailAtt({ key, product, rest, source }: ProductDetailAttProps) {
  logEvent(key, {
    name: attrProperty.productName.PRODUCT_DETAIL,
    ...rest,
    id: product.id,
    site: product.site.name,
    brand: product.brand.name,
    category: product.category.name,
    parentId: product.category.parentId,
    parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
    line: product.line,
    price: product.price,
    scoreTotal: product.scoreTotal,
    scoreStatus: product.scoreStatus,
    scoreSeller: product.scoreSeller,
    scorePrice: product.scorePrice,
    scorePriceAvg: product.scorePriceAvg,
    scorePriceCount: product.scorePriceCount,
    scorePriceRate: product.scorePriceRate,
    source: source || attrProperty.productSource.MAIN_CAMEL,
    imageCount: product.imageCount,
    isProductLegit: product.isProductLegit
  });
}
