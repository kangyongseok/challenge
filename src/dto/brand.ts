import type { JobRuleBaseDetail } from './common';

export type Brand = {
  dateCreated: string;
  dateUpdated: string;
  groupId: number;
  id: number;
  isAll: boolean;
  isDeleted: boolean;
  isUse: boolean;
  jobRulebaseDetail: JobRuleBaseDetail;
  name: string;
  nameEng: string;
  parentId: number;
  usePriceAvgGroups: string;
  viewName: string | null;
  count: number;
  subParentId: number | null;
};

export interface AllBrand {
  brandIds: number[];
  collaboIds: number[];
  groupId: number;
  id: number;
  name: string;
  nameEng: string;
  nameLogo: string;
  parentId: number;
  count: number;
  [x: string]: number[] | string | number;
}

export interface SuggestParams {
  keyword: string;
  useCollabo?: boolean;
}
