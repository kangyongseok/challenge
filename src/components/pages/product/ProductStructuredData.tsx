import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import type { Product } from '@dto/product';

import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';

import { getMetaDescription } from '@utils/products';
import { convertQueryStringByObject, getProductDetailUrl } from '@utils/common';

interface ProductStructuredDataProps {
  product?: Product;
  relatedProducts?: Product[];
  url: string;
}

function ProductStructuredData({ product, relatedProducts = [], url }: ProductStructuredDataProps) {
  const { data: { parentCategories = [] } = {} } = useQuery(
    queryKeys.categories.parentCategories(),
    fetchParentCategories
  );

  const itemListElement = useMemo(() => {
    if (!product || !parentCategories || !parentCategories.length) return [];

    const { brand, category } = product;
    const baseUrl = 'https://mrcamel.co.kr';

    const newItemListElement = [
      {
        '@type': 'ListItem',
        position: 0,
        name: '홈',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 0,
        name: '브랜드',
        item: `${baseUrl}/brand`
      }
    ];

    newItemListElement.push({
      '@type': 'ListItem',
      position: 0,
      name: brand.name,
      item: `${baseUrl}/products/brands/${brand.name}`
    });

    if (category) {
      const { parentCategory, subParentCategories = [] } =
        parentCategories.find(({ parentCategory: { id } }) => id === category.parentId) || {};
      const subParentCategory = subParentCategories.find(
        ({ id, parentId }) => id === category.subParentId && parentId === category.parentId
      );

      if (parentCategory) {
        newItemListElement.push({
          '@type': 'ListItem',
          position: 0,
          name: parentCategory.name,
          item: `${baseUrl}/products/brands/${product.brand.name}${convertQueryStringByObject({
            parentIds: category.parentId
          })}`
        });
      }

      if (subParentCategory) {
        newItemListElement.push({
          '@type': 'ListItem',
          position: 0,
          name: subParentCategory.name,
          item: `${baseUrl}/products/brands/${product.brand.name}${convertQueryStringByObject({
            parentIds: category.parentId,
            subParentIds: category.subParentId
          })}`
        });
      }
    }

    return newItemListElement.map((element, index) => ({
      ...element,
      position: index + 1
    }));
  }, [product, parentCategories]);

  if (!product) return null;

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
            '@context': 'https://schema.org/',
            '@type': 'Product',
            '@id': '#product',
            name: `${product.title} | 카멜`,
            image: `${product.imageMain || product.imageThumbnail}|${product.imageDetails || ''}`
              .split('|')
              .filter((image) => image),
            description: getMetaDescription(product),
            sku: product.productSeller.id,
            mpn: product.id,
            brand: {
              '@type': 'Brand',
              name: product.brand.name
            },
            offers: {
              '@type': 'Offer',
              url,
              priceCurrency: 'KRW',
              price: product.price,
              seller: {
                '@type': 'Person',
                name: product.productSeller.name
              },
              itemCondition: 'https://schema.org/UsedCondition',
              availability: 'https://schema.org/InStock'
            }
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
            itemListElement: relatedProducts.map((relatedProduct, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `https://mrcamel.co.kr${getProductDetailUrl({ product: relatedProduct })}`
            }))
          })
        }}
      />
    </>
  );
}

export default ProductStructuredData;
