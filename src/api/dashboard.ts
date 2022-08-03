import type { DashboardResults, LegitDashboard } from '@dto/dashboard';

import Axios from '@library/axios';

export async function fetchDashboard() {
  const { data } = await Axios.getInstance().get<DashboardResults>('/dashboards');

  return data;
}

export async function fetchLegitDashboard() {
  const { data } = await Axios.getInstance().get<LegitDashboard>('/dashboards/legit');

  return data;
}
