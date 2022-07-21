export type ProductLabel = '카멜인증' | '새상품급' | '시세이하';

export interface WishAtt {
  name: string;
  title?: string;
  id: number;
  index: number;
  brand: string;
  category: string;
  parentId?: number | null;
  line: string;
  site: string;
  price: number;
  scoreTotal: number;
  cluster: number;
  source: string;
}
