import type { productType } from '@constants/user';

export interface WishAtt {
  name: string;
  title?: string;
  id?: number;
  index?: number;
  brand?: string;
  category?: string;
  parentId?: number | null;
  line?: string;
  site?: string;
  price?: number;
  scoreTotal?: number;
  cluster?: number;
  source?: string;
  att?: string;
  att2?: string;
  sellerType?: (typeof productType)[keyof typeof productType];
}

export interface SavedLegitDataProps {
  savedLegitRequest: {
    state: SavedLegitState;
    params: {
      title: string;
      categoryIds: number[];
      brandIds: number[];
      photoGuideImages: string[];
      modelId: number;
    };
    showToast: boolean;
  };
}

export interface SavedLegitState {
  brandId: number;
  brandName: string;
  brandLogo: string;
  categoryId: number;
  categoryName: string;
  modelImage: string;
  isCompleted: boolean;
  isViewedSampleGuide: boolean;
  productId: number;
  sellerType?: (typeof productType)[keyof typeof productType];
}
