import { useRouter } from 'next/router';
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
  canonical,
  product
}: PageHeadProps) {
  const router = useRouter();

  const {
    category: { name: categoryName = '' } = {},
    price = 0,
    siteUrl: { name = '' } = {},
    brand: { name: brandName = '', nameEng: brandNameEng = '' } = {}
  } = product || {};

  const isNormalseller =
    (product?.site.id === 34 || product?.productSeller.type === 4) &&
    product?.productSeller.type !== 3;

  return (
    <Head>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta
        property="og:url"
        content={decodeURI(
          `https://mrcamel.co.kr${router.locale === 'ko' ? '' : `/${router.locale}`}${
            router.asPath === '/' ? '' : router.asPath
          }`
        )}
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="카멜" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <meta name="twitter:card" content="summary" />
      <meta
        name="twitter:url"
        content={decodeURI(
          `https://mrcamel.co.kr${router.locale === 'ko' ? '' : `/${router.locale}`}${
            router.asPath === '/' ? '' : router.asPath
          }`
        )}
      />
      {canonical && <link rel="canonical" href={canonical} />}
      {product && (
        <>
          <meta name="twitter:label1" content="가격" />
          <meta name="twitter:data1" content={`${getTenThousandUnitPrice(price)}만원`} />
          <meta name="twitter:label2" content="플랫폼" />
          <meta name="twitter:data2" content={isNormalseller ? '카멜' : name} />
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
