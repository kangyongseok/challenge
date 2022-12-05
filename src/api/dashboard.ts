import type { DashboardResults, LegitDashboard, LegitDashboardParams } from '@dto/dashboard';

import Axios from '@library/axios';

const BASE_PATH = '/dashboards';

export async function fetchDashboard() {
  const { data } = await Axios.getInstance().get<DashboardResults>(BASE_PATH);

  return data;
}

export async function fetchLegit(params?: LegitDashboardParams) {
  const { data } = await Axios.getInstance().get<LegitDashboard>(`${BASE_PATH}/legit`, {
    params
  });

  return data;
}
