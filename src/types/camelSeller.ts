export interface ModelParams {
  brandId?: number;
  categoryId?: number;
  keyword: string;
}

export interface CamelSellerLocalStorage {
  title?: string;
  name?: boolean;
  step?: string;
  modelSearchValue?: string;
  category: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
    searchValue: string;
  };
}

export type CommonCodeId = { codeId: number };
