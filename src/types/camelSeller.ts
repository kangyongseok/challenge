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
  commonPhotoGuideDetail: CommonPhotoGuideDetail;
}

export interface EditPhotoGuideImages {
  photoGuideId: number;
  imageUrl: string;
  commonPhotoGuideDetail: { id: number };
}

export interface CamelSellerLocalStorage {
  title: string;
  quoteTitle: string;
  brand: { id: number; name: string };
  category: { id: number; name: string };
  color: { id: number; name: string; count?: number };
  size: { id: number; name: string; count?: number };
  condition: { name: string; id: number };
  price: number;
  description: string;
  photoGuideImages: PhotoGuideImages[];
  // title: string;
  // keyword: string;
  // search?: boolean;
  // step?: string;
  // modelSearchValue?: string;
  // price?: number;
  // category: {
  //   id: number;
  //   name: string;
  // };
  // subCategoryName?: string;
  // brand?: {
  //   id: number;
  //   name: string;
  //   searchValue?: string;
  // };
  // color?: { id: number; name: string; count?: number };
  // size?: { id: number; name: string; count?: number };
  // platform?: { id: number; name: string; count?: number; hasImage?: boolean };
  // condition?: { name: string; id: number };
  // description?: string;
  // photoGuideImages: PhotoGuideImages[];
  // [x: string]: FilterDropItem | PhotoGuideImages[] | number | string | undefined | boolean;
}

export interface CamelSellerTempData {
  title: string;
  quoteTitle: string;
  condition: { id: number; name: string };
  color: { id: number; name: string };
  size: { id: number; name: string };
  price: number;
  description: string;
  photoGuideImages: EditPhotoGuideImages[];
  brand: { id: number; name: string };
  category: { id: number; name: string };
  brandIds?: number[];
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
