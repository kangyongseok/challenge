import type { SearchParams } from '@dto/product';

import { filterCodeIds } from '@constants/productsFilter';

import type { SelectedSearchOption } from '@typings/products';

// TODO 추후 로직 개선
export default function convertSearchParams(
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
