import Head from 'next/head';

import type { Product } from '@dto/product';

import { getTenThousandUnitPrice } from '@utils/formats';

interface PageHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  product?: Product;
}

function PageHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
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
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="Mr.Camel" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content={ogUrl} />
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
      <title>{title}</title>
    </Head>
  );
}

export default PageHead;
