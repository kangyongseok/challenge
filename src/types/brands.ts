import type { AllBrand } from '@dto/brand';

export interface NewBrands extends AllBrand {
  ko: string;
  en: string;
}

export interface ScrollStateType {
  lang: string;
  currentTitle: string;
  listScroll: number;
}

export interface SelectedHotBrand {
  id?: number;
  name?: string;
}
