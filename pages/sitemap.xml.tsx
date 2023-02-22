import { GetServerSidePropsContext } from 'next';

import { fetchSitemap } from '@api/sitemap';

function generateSiteMap(posts: { urls: { loc: string; lastmod: string }[] }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!--We manually set the two URLs we know already-->
${posts.urls
  .map(({ loc, lastmod }) => {
    return `<url>
<loc>${loc}</loc>
<lastmod>${lastmod}</lastmod>
</url>
`;
  })
  .join('')}
</urlset>
`;
}

function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  const xml = await fetchSitemap();
  const sitemap = generateSiteMap(xml);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap.replaceAll('&', '-'));
  res.end();

  return {
    props: {}
  };
}

export default Sitemap;
