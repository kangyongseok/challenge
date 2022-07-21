import type { JobRuleBaseDetail } from './common';

export type Category = {
  dateCreated: string | null;
  dateUpdated: string | null;
  depth: number | null;
  groupId: number | null;
  id: number | null;
  isDeleted: boolean | null;
  jobRulebaseDetail: JobRuleBaseDetail;
  name: string;
  nameEng: string | null;
  order: number | null;
  parentId: number | null;
  subParentId: number | null;
};

export type ParentCategory = {
  id: number;
  groupId: number;
  name: string;
  nameEng: string;
  depth: number;
  order: number;
  parentId: number;
  subParentId: number;
  isDeleted: boolean;
  dateUpdated: string;
  dateCreated: string;
  jobRulebaseDetail: JobRuleBaseDetail;
  count: number;
};

export type SubParentCategory = {
  id: number;
  groupId: number;
  name: string;
  nameEng: string;
  depth: number;
  order: number;
  parentId: number;
  subParentId: number;
  isDeleted: boolean;
  dateUpdated: string;
  dateCreated: string;
  jobRulebaseDetail: JobRuleBaseDetail;
  count: number;
};

export type CategoryValue = {
  count: number;
  id: number;
  name: string;
};

export interface ParentCategories {
  parentCategory: ParentCategory;
  subParentCategories: SubParentCategory[];
}
