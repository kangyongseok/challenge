import { ParsedUrlQuery } from 'querystring';

import { MrCamelTheme } from 'mrcamel-ui/dist/types';

import type { Product, ProductOrder, ProductSearchOption, SearchParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { SELLER_STATUS } from '@constants/user';
import { filterCodeIds, filterGenders } from '@constants/productsFilter';
import { PRODUCT_SITE } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, convertStringToArray } from '@utils/common';

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
      gender,
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
        genders = [],
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
      } else if (codeId === filterCodeIds.gender) {
        if (gender) {
          searchParams.genders = Array.from(
            new Set(Array.isArray(genders) ? [...genders, gender] : [genders, gender])
          );
        }

        if (id) {
          searchParams.genderIds = Array.from(new Set([...genderIds, id, filterGenders.common.id]));
        }
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
    defaultValue?: Partial<SearchParams>;
    excludeSearchParams?: Array<keyof SearchParams>;
  }
): Partial<SearchParams> {
  const { variant, onlyBaseSearchParams, defaultValue, excludeSearchParams = [] } = options || {};
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
    deviceId
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
    order,
    notice,
    distance,
    requiredBrands,
    requiredBrandIds,
    requiredLineIds,
    collaboIds,
    deviceId,
    ...defaultValue
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
      // 브랜드형 매물 목록에 성별 필터 모달 추가로 인한 삭제
      delete baseSearchParams.genders;

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
  baseSearchOptions: Partial<ProductSearchOption>,
  options?: { variant?: ProductsVariant }
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
    order,
    genders = []
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

        // 브랜드 매물 목록에만 성별 탭 존재하여 임시로 추가, 이후 다른 매물 목록에도 성별 탭이 추가될 경우 수정 필요
        if (options?.variant === 'brands') {
          convertedGenderIds.forEach((genderId) => {
            Object.values(filterGenders)
              .filter(({ id }) => genderId === id)
              .forEach(({ id, name }) => {
                selectedSearchOptions = [
                  ...selectedSearchOptions,
                  {
                    id,
                    codeId: filterCodeIds.gender,
                    viewName: name
                  }
                ];
              });
          });
        }

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
      } else if (key === 'genders') {
        // 브랜드 매물 목록에만 성별 탭 존재하여 임시로 추가, 이후 다른 매물 목록에도 성별 탭이 추가될 경우 수정 필요
        if (options?.variant === 'brands') {
          (Array.isArray(genders) ? genders : [genders]).forEach((gender) => {
            selectedSearchOptions = [
              ...selectedSearchOptions,
              {
                codeId: filterCodeIds.gender,
                gender,
                viewName: filterGenders[gender as keyof typeof filterGenders].name
              }
            ];
          });
        }
      }
    }
  });

  return selectedSearchOptions;
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

export function getProductType(siteId: number, sellerType: number) {
  // TODO 추후 순수 카멜에서 등록한 매물 구분 필요
  if (
    siteId === PRODUCT_SITE.CAMEL.id ||
    SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3']
  ) {
    return 'transferred';
  }

  return 'crawled';
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
    isProductLegit: product.isProductLegit,
    productType: getProductType(product.productSeller.site.id, product.productSeller.type)
  });
}

export function getMetaDescription(product: Product) {
  const { description = '', viewCount = 0, wishCount = 0, quoteTitle, price = 0 } = product;

  if (!description) return '';

  // {조회수}명이 본 매물이에요. {찜 수}명이 찜했으니 {매물 모델} {매물 가격}으로 득템하세요! | {매물상세 내용}
  let byte = 0;
  let result = '';
  let overflow = false;

  for (let i = 0; i < description.length; i += 1) {
    if (byte > 92) {
      overflow = true;
      break;
    }

    if (description.charCodeAt(i) > 127) {
      byte += 2;
    } else {
      byte += 1;
    }

    result += description[i];
  }

  if (!result) result = description;

  return `${viewCount ? `${commaNumber(viewCount)}명이 본 매물이에요. ` : ''}${
    wishCount ? `${commaNumber(wishCount)}명이 찜했으니 ` : ''
  }${quoteTitle} ${commaNumber(getTenThousandUnitPrice(price))}만원으로 득템하세요! | ${
    result.replace(/[\n|\r]/g, ' ') + (overflow ? '...' : '')
  }`;
}

export function getProductLabelColor(name: string, theme: MrCamelTheme) {
  const {
    palette: { primary, common }
  } = theme;
  if (name === '시세이하' || name === '가품 시, 100%환불') {
    return common.ui20;
  }
  if (name === '새상품급') {
    return primary.dark;
  }
  return primary.main;
}
