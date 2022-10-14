import type { CommonPhotoGuideDetail } from '@dto/common';

export interface ModelParams {
  brandIds?: number[];
  categoryIds?: number[];
  keyword: string;
}

export interface PhotoGuideImages {
  photoGuideId: number;
  imageUrl: string;
  id?: number;
  imageWatermark?: string;
}
export interface CamelSellerLocalStorage {
  title: string;
  keyword: string;
  search?: boolean;
  step?: string;
  modelSearchValue?: string;
  price?: number;
  category: {
    id: number;
    name: string;
  };
  subCategoryName?: string;
  brand?: {
    id: number;
    name: string;
    searchValue?: string;
  };
  color?: { id: number; name: string; count?: number };
  size?: { id: number; name: string; count?: number };
  platform?: { id: number; name: string; count?: number; hasImage?: boolean };
  condition?: { name: string; id: number };
  description?: string;
  photoGuideImages: PhotoGuideImages[];
  [x: string]: FilterDropItem | PhotoGuideImages[] | number | string | undefined | boolean;
}

export type CommonCodeId = { codeId: number };

export interface FilterDropItem {
  name: string;
  id: number | string;
  count?: number;
  groupId?: number;
  hasImage?: boolean;
}

export interface GroupSize {
  id?: number;
  label: string;
  data: FilterDropItem[];
}

export interface SubmitType {
  title: string;
  price: number;
  brandIds: number[];
  categoryIds: number[];
  conditionId: number;
  colorIds: number[];
  categorySizeIds: number[];
  photoGuideImages: PhotoGuideImages[];
  modelId?: number;
  description?: string | null;
  quoteTitle?: string;
}

export type MergePhotoImages = CommonPhotoGuideDetail & PhotoGuideImages;
