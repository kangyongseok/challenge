import Axios from '@library/axios';

const BASE_PATH = '/commons';

export async function fetchSitemap() {
  const { data } = await Axios.getInstance().get(`${BASE_PATH}/sitemap/mobile`);
  return data;
}
