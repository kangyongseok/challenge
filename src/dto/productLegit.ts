import type { ProductResult } from '@dto/product';
import type { Paged } from '@dto/common';

export type ProductLegit = {
  legitOpinions: LegitOpinion[];
  dateCreated: number;
  dateUpdated: number;
  dateCompleted: number;
  isWish: boolean;
  isFollow: boolean;
  isViewed: boolean;
  productId: number;
  productResult: ProductResult;
  canModified: boolean;
  result: 0 | 1 | 2 | 3;
  status: 1 | 10 | 11 | 12 | 13 | 20 | 30;
  sort?: 'lastUpdated' | 'lastCreated';
  userId: number;
  commentReal: number;
  commentFake: number;
  commentNone: number;
  additionalIds: number[];
  additionals: string;
  description: string;
  cntTargetOpinions: number;
  isLegitHead: boolean;
};

export interface ProductLegits {
  productLegits: Paged<ProductLegit>;
  cntReal: number;
  cntFake: number;
  cntAuthenticating: number;
}

export type PageProductLegit = Paged<ProductLegit>;

export type ProductLegitComment = {
  id: number;
  userId: number;
  description: string;
  result: 1 | 2 | 3;
  parentId?: number;
  replies: ProductLegitReply[];
  dateCreated: string;
  dateUpdated: string;
};

export type ProductLegitReply = {
  id: number;
  userId: number;
  description: string;
  parentId?: number;
  dateCreated: string;
  dateUpdated: string;
};

export type PageProductComment = Paged<ProductLegitComment>;

export type LegitOpinion = {
  dateCreated: string;
  dateUpdated: string;
  description: string;
  id: number;
  productId: number;
  result: 0 | 1 | 2 | 3;
  roleLegit: RoleLegit;
};

export type RoleLegit = {
  dateCreated: string;
  dateUpdated: string;
  description: string;
  image: string;
  ip: number;
  name: string;
  subTitle: string;
  title: string;
  userId: number;
};

/* ---------- Request Parameters ---------- */

export type ProductLegitsParams = {
  page?: number;
  size?: number;
  results?: number[];
  status?: number[];
  isOnlyResult?: boolean;
  sort?: 'lastUpdated' | 'lastCreated'; // default: laseCreated
};

export interface PhotoGuideImage {
  photoGuideId: number;
  imageUrl: string;
}

export type PostProductLegitData = {
  title: string;
  brandIds: number[];
  categoryIds: number[];
  modelId?: number;
  description?: string;
  photoGuideImages: PhotoGuideImage[];
  additionalIds?: (10 | 11 | 12 | 13)[]; // 10: 박스없음, 11: 대체 부속품 없음, 12: 영수증 잃어버림, 13: 구매날짜, 장소를 몰라요
};

export type PutProductLegitData = PostProductLegitData & {
  productId: number;
};

export type PostProductLegitOpinionData = {
  productId: number;
  result: 0 | 1 | 2 | 3;
  description: string;
};

export type PutProductLegitOpinionData = {
  productId: number;
  opinionId: number;
  result: 0 | 1 | 2 | 3;
  description: string;
};

export type DeleteProductLegitOpinionData = {
  productId: number;
  opinionId: number;
};

export type OpinionLegitsParams = {
  page: number;
  size: number;
  userIds: number[];
};

export type PostProductLegitCommentData = {
  productId: number;
  result: 0 | 1 | 2 | 3;
  description: string;
  parentId?: number;
};

export type PutProductLegitCommentData = {
  productId: number;
  commentId: number;
  result: 0 | 1 | 2 | 3;
  description: string;
};

export type DeleteProductLegitCommentData = {
  productId: number;
  commentId: number;
};

export type PostProductLegitPreConfirmData = {
  productId: number;
  photoGuideIds?: number[];
};

export type ProductLegitCommentsParams = {
  productId: number;
  page: number;
  size: number;
};
