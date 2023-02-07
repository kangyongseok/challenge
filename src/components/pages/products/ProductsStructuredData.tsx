import { useMemo } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import type { SearchParams } from '@dto/product';

import { fetchSearchMeta } from '@api/product';

import queryKeys from '@constants/queryKeys';

import { convertQueryStringByObject, getProductDetailUrl } from '@utils/common';

import type { ProductsVariant } from '@typings/products';

interface ProductsStructuredDataProps {
  variant: ProductsVariant;
  params: Partial<SearchParams>;
}

function ProductsStructuredData({ variant, params }: ProductsStructuredDataProps) {
  const router = useRouter();
  const {
    data: {
      page: { content = [] } = {},
      baseSearchOptions: {
        keywordBrands = [],
        keywordParentCategories = [],
        keywordSubParentCategories = []
      } = {}
    } = {}
  } = useQuery(queryKeys.products.searchMeta(params), () => fetchSearchMeta(params), {
    keepPreviousData: true,
    enabled: Object.keys(params).length > 0,
    staleTime: 5 * 60 * 1000
  });

  const itemListElement = useMemo(() => {
    const baseUrl = `https://mrcamel.co.kr${router.locale === 'ko' ? '' : `/${router.locale}`}`;
    const newItemListElement = [
      {
        '@type': 'ListItem',
        position: 0,
        name: '홈',
        item: baseUrl
      }
    ];

    const [brand] = keywordBrands;
    const [parentCategory] = keywordParentCategories;
    const [subParentCategory] = keywordSubParentCategories;

    if (variant === 'categories' && parentCategory) {
      newItemListElement.push({
        '@type': 'ListItem',
        position: 0,
        name: '카테고리',
        item: `${baseUrl}/category`
      });
      newItemListElement.push({
        '@type': 'ListItem',
        position: 0,
        name: parentCategory.name,
        item: `${baseUrl}/products/${variant}/${parentCategory.name}`
      });

      if (subParentCategory) {
        newItemListElement.push({
          '@type': 'ListItem',
          position: 0,
          name: subParentCategory.name,
          item: `${baseUrl}/products/${variant}/${parentCategory.name}${convertQueryStringByObject({
            parentIds: parentCategory.id,
            subParentIds: subParentCategory.id
          })}`
        });
      }
    } else if (variant === 'brands' && brand) {
      newItemListElement.push({
        '@type': 'ListItem',
        position: 0,
        name: brand.name,
        item: `${baseUrl}/products/${variant}/${brand.name}`
      });

      if (parentCategory) {
        newItemListElement.push({
          '@type': 'ListItem',
          position: 0,
          name: parentCategory.name,
          item: `${baseUrl}/products/${variant}/${brand.name}${convertQueryStringByObject({
            parentIds: parentCategory.id
          })}`
        });
      }

      if (subParentCategory) {
        newItemListElement.push({
          '@type': 'ListItem',
          position: 0,
          name: subParentCategory.name,
          item: `${baseUrl}/products/${variant}/${brand.name}${convertQueryStringByObject({
            parentIds: parentCategory.id,
            subParentIds: subParentCategory.id
          })}`
        });
      }
    } else {
      newItemListElement.push({
        '@type': 'ListItem',
        position: 0,
        name: '검색',
        item: `${baseUrl}/search`
      });

      if (params.keyword)
        newItemListElement.push({
          '@type': 'ListItem',
          position: 0,
          name: params.keyword,
          item: `${baseUrl}/products/search/${params.keyword}`
        });
    }
    return newItemListElement.map((element, index) => ({
      ...element,
      position: index + 1
    }));
  }, [
    keywordBrands,
    keywordParentCategories,
    keywordSubParentCategories,
    variant,
    router.locale,
    params.keyword
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement
          })
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: content.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://mrcamel.co.kr${
                router.locale === 'ko' ? '' : `/${router.locale}`
              }${getProductDetailUrl({ product })}`
            }))
          })
        }}
      />
    </>
  );
}

export default ProductsStructuredData;
