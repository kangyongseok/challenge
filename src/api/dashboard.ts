import { DashboardResults } from '@dto/dashboard';

import Axios from '@library/axios';

export async function fetchDashboard() {
  const { data } = await Axios.getInstance().get<DashboardResults>('/dashboards');

  return data;
}
