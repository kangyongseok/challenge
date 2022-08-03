export interface DateGroup {
  date: number;
  day: number;
  hours: number;
  minutes: number;
  month: number;
  nanos: number;
  seconds: number;
  time: number;
  timezoneOffset: number;
  year: number;
}

export interface JopRuleDetail {
  deleted: boolean;
  detail: string;
  id: number;
  keyword: string;
  rulebaseId: number;
  score: string;
  synonym: string;
}

export interface Models {
  brands: string;
  categories: string;
  category: {
    dateCreated: string;
    dateUpdated: string;
    depth: number;
    groupId: number;
    id: number;
    isDeleted: boolean;
    jobRulebaseDetail: JopRuleDetail;
    name: string;
    nameEng: string;
    order: number;
    parentId: number;
    subParentId: number;
  };
  dateCreated: DateGroup;
  dateUpdated: DateGroup;
  id: number;
  imageThumbnail: string;
  isDeleted: boolean;
  level: number;
  lineBase: string;
  lines: string;
  modelDeco: string;
  modelNo: string;
  name: string;
  sort: number;
}
