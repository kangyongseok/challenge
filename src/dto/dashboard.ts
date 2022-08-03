import { Brand } from '@dto/brand';

export interface DashboardResults {
  collectionStatus: unknown;
  siteStatus: unknown;
  theme: {
    personalCount: number;
    productCount: number;
  };
}

export interface LegitDashboard {
  resultReal: number;
  resultFake: number;
  resultNone: number;
  targetBrands: Brand[];
}
