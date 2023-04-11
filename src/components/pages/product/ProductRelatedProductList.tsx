import { memo, useEffect, useState } from 'react';

import { Box, Grid, Typography } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import type { Product, SearchRelatedProductsParams } from '@dto/product';

import { fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { productStatusCode } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

interface ProductRelatedProductListProps {
  brandId?: number;
  categoryId?: number | null;
  line?: string | null;
  prevProduct?: Product;
  quoteTitle?: string;
  price?: number;
  productId?: number;
}

function ProductRelatedProductList({
  brandId,
  categoryId,
  line,
  prevProduct,
  quoteTitle,
  price,
  productId
}: ProductRelatedProductListProps) {
  const [searchRelatedProductsParams, setSearchRelatedProductsParams] =
    useState<SearchRelatedProductsParams>({
      brandIds: brandId ? [brandId] : undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      line: line || undefined,
      related: 1,
      size: 8,
      quoteTitle,
      price
    });

  const { data: searchRelatedProducts, isLoading } = useQuery(
    queryKeys.products.searchRelatedProducts(searchRelatedProductsParams),
    () => fetchSearchRelatedProducts(searchRelatedProductsParams),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled:
        (searchRelatedProductsParams.productId &&
          !!searchRelatedProductsParams.brandIds &&
          !!searchRelatedProductsParams.line) ||
        (!!searchRelatedProductsParams.brandIds && !searchRelatedProductsParams.line)
    }
  );

  useEffect(() => {
    setSearchRelatedProductsParams({
      brandIds: brandId ? [brandId] : undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      line: line || undefined,
      related: 1,
      size: 8,
      quoteTitle,
      price,
      productId
    });
  }, [brandId, categoryId, line, price, quoteTitle, productId]);

  if (!searchRelatedProducts?.page?.content?.length) return <Box customStyle={{ marginTop: -1 }} />;

  return (
    <Box customStyle={{ margin: '32px 0' }}>
      <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
        {prevProduct?.status === productStatusCode.deleted
          ? '이런 매물은 어때요?'
          : '보고 있는 매물과 비슷해요'}
      </Typography>
      <Grid container rowGap={32} columnGap={12}>
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <Grid key={`related-product-skeleton-${index}`} item xs={2}>
                <NewProductGridCardSkeleton variant="gridB" />
              </Grid>
            ))
          : searchRelatedProducts?.page?.content?.map((product, index) => (
              <Grid key={`related-product-${product.id}`} item xs={2}>
                <NewProductGridCard
                  variant="gridB"
                  product={product}
                  attributes={{
                    name: attrProperty.name.PRODUCT_DETAIL,
                    title: attrProperty.title.LIST_RELATED,
                    source: attrProperty.source.PRODUCT_DETAIL_LIST_RELATED,
                    id: prevProduct?.id,
                    brand: prevProduct?.brand.name,
                    category: prevProduct?.category.name,
                    parentCategory: FIRST_CATEGORIES[prevProduct?.category.parentId as number],
                    line: prevProduct?.line,
                    site: prevProduct?.site.name,
                    price: prevProduct?.price,
                    scoreTotal: prevProduct?.scoreTotal,
                    scoreStatus: prevProduct?.scoreStatus,
                    scoreSeller: prevProduct?.scoreSeller,
                    scorePrice: prevProduct?.scorePrice,
                    scorePriceAvg: prevProduct?.scorePriceAvg,
                    scorePriceCount: prevProduct?.scorePriceCount,
                    scorePriceRate: prevProduct?.scorePriceRate,
                    index: index + 1,
                    nextId: product.id,
                    nextBrand: product.brand.name,
                    nextCategory: product.category.name,
                    nextParentId: product.category.parentId,
                    nextLine: product.line,
                    nextPrice: product.price,
                    nextScoreTotal: product.scoreTotal
                  }}
                />
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}

export default memo(ProductRelatedProductList);
