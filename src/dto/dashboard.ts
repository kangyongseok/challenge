import { UserRoleLegit } from '@dto/user';
import type { ProductLegit } from '@dto/productLegit';
import type { Brand } from '@dto/brand';

export interface DashboardResults {
  collectionStatus: unknown;
  siteStatus: unknown;
  theme: {
    personalCount: number;
    productCount: number;
  };
}

export interface LegitDashboard {
  mostPopular: ProductLegit;
  realVsFake: ProductLegit;
  authenticators: UserRoleLegit[];
  caseHistories: ProductLegit[];
  targetBrands: Brand[];
}
