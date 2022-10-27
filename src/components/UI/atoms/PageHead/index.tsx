import Head from 'next/head';

import type { Product } from '@dto/product';

import { getTenThousandUnitPrice } from '@utils/formats';

interface PageHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  product?: Product;
}

function PageHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  canonical,
  product
}: PageHeadProps) {
  const {
    category: { name: categoryName = '' } = {},
    price = 0,
    siteUrl: { name = '' } = {},
    brand: { name: brandName = '', nameEng: brandNameEng = '' } = {}
  } = product || {};

  return (
    <Head>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="카멜" />
      <meta property="og:locale" content="ko_KR" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <meta name="twitter:card" content="summary" />
      {ogUrl && <meta name="twitter:url" content={ogUrl} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {product && (
        <>
          <meta name="twitter:label1" content="가격" />
          <meta name="twitter:data1" content={`${getTenThousandUnitPrice(price)}만원`} />
          <meta name="twitter:label2" content="플랫폼" />
          <meta name="twitter:data2" content={name} />
          <meta property="product:brand" content={brandName || brandNameEng} />
          <meta property="product:category" content={categoryName} />
          <meta property="product:availability" content="in stock" />
          <meta property="product:condition" content="new" />
          <meta property="product:price:amount" content={String(price)} />
          <meta property="product:price:currency" content="KRW" />
        </>
      )}
      {title && <title>{title}</title>}
    </Head>
  );
}

export default PageHead;
