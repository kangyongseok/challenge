import type { CommonPhotoGuideDetail } from '@dto/common';

export interface PhotoGuideImages {
  photoGuideId: number;
  imageUrl: string;
  id?: number;
  imageWatermark?: string;
  commonPhotoGuideDetail: CommonPhotoGuideDetail;
}

export interface CamelSellerTempData {
  title: string;
  quoteTitle: string;
  condition: { id: number; name: string; synonyms: string };
  size: { id: number; name: string; categorySizeId?: number };
  price: number;
  description: string;
  images: string[];
  brand: { id: number; name: string };
  brands: string;
  category: {
    id: number;
    parentId: number;
    parentCategoryName: string;
    subParentId: number;
    name: string;
  };
  sizes: string;
  categorySizeIds: number[];
  sizeOptionIds: number[];
  brandIds: number[];
  useDeliveryPrice: boolean;
}

export interface SaveCamelSellerProductData {
  [key: string]: {
    title: string;
    quoteTitle: string;
    brand: { id: number; name: string };
    brands: string;
    brandIds: number[];
    category: {
      id: number;
      parentId: number;
      parentCategoryName: string;
      subParentId: number;
      name: string;
    };
    size: { id: number; name: string; count?: number };
    sizes: string;
    condition: { name: string; id: number; synonyms: string };
    price: number;
    description: string;
    images: string[];
    categorySizeIds: number[];
    sizeOptionIds: number[];
    unitIds: number[];
    storeIds: number[];
    distanceIds: number[];
    colors: {
      id: number;
      name: string;
      description: string;
    }[];
    useDeliveryPrice: boolean;
    hasOpenedSurveyBottomSheet: boolean;
  };
}

export type CommonCodeId = { codeId: number; groupId?: number };

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
  sizes: string;
  brands: string;
  sizeOptionIds: number[];
  images: string[];
  modelId?: number;
  description?: string | null;
  quoteTitle?: string;
  useDeliveryPrice: boolean;
  unitIds: number[];
  storeIds: number[];
  distanceIds: number[];
}

export type SearchHistoryHookType = 'infinit' | 'condition' | 'size' | 'keyword' | null;
