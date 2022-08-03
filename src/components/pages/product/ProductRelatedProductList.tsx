import { memo, useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { Box, Grid, Typography } from 'mrcamel-ui';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';

import type { Product, SearchRelatedProductsParams } from '@dto/product';

import { fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

interface ProductRelatedProductListProps {
  brandId?: number;
  categoryId?: number | null;
  line?: string;
  prevProduct?: Product;
}

function ProductRelatedProductList({
  brandId,
  categoryId,
  line,
  prevProduct
}: ProductRelatedProductListProps) {
  const [searchRelatedProductsParams, setSearchRelatedProductsParams] =
    useState<SearchRelatedProductsParams>({
      brandIds: brandId ? [brandId] : undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      line: line || undefined,
      related: 1,
      size: 8
    });

  const { data: searchRelatedProducts, isLoading } = useQuery(
    queryKeys.products.searchRelatedProducts(searchRelatedProductsParams),
    () => fetchSearchRelatedProducts(searchRelatedProductsParams),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled:
        (!!searchRelatedProductsParams.brandIds && !!searchRelatedProductsParams.line) ||
        (!!searchRelatedProductsParams.brandIds && !searchRelatedProductsParams.line)
    }
  );

  useEffect(() => {
    setSearchRelatedProductsParams({
      brandIds: brandId ? [brandId] : undefined,
      categoryIds: categoryId ? [categoryId] : undefined,
      line: line || undefined,
      related: 1,
      size: 8
    });
  }, [brandId, categoryId, line]);

  const handleWishAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.RELATED,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      line: product.line,
      site: product.site.name,
      price: product.price,
      scoreTotal: product.scoreTotal,
      cluster: product.cluster,
      source: attrProperty.productSource.LIST_RELATED
    };
  };

  const handleProductAtt = (product: Product, i: number) => {
    if (prevProduct) {
      return {
        name: attrProperty.productName.PRODUCT_DETAIL,
        title: attrProperty.productTitle.RELATED,
        index: i + 1,
        id: prevProduct.id,
        brand: prevProduct.brand.name,
        category: prevProduct.category.name,
        parentCategory: FIRST_CATEGORIES[prevProduct.category.parentId as number],
        line: prevProduct.line,
        site: prevProduct.site.name,
        price: prevProduct.price,
        scoreTotal: prevProduct.scoreTotal,
        scoreStatus: prevProduct.scoreStatus,
        scoreSeller: prevProduct.scoreSeller,
        scorePrice: prevProduct.scorePrice,
        scorePriceAvg: prevProduct.scorePriceAvg,
        scorePriceCount: prevProduct.scorePriceCount,
        scorePriceRate: prevProduct.scorePriceRate,
        source: attrProperty.productSource.LIST_RELATED,
        nextId: product.id,
        nextBrand: product.brand.name,
        nextCategory: product.category.name,
        nextParentId: product.category.parentId,
        nextLine: product.line,
        nextPrice: product.price,
        nextScoreTotal: product.scoreTotal
      };
    }
    return {};
  };

  return (
    <Box customStyle={{ margin: '32px 0 112px' }}>
      <Typography variant="h4" weight="bold">
        이런 매물은 어때요?
      </Typography>
      <Grid container rowGap={32} columnGap={7} customStyle={{ marginTop: 16 }}>
        {isLoading
          ? Array.from(new Array(4), (_, index) => (
              <Grid key={`related-product-skeleton-${index}`} item xs={2}>
                <ProductGridCardSkeleton isRound />
              </Grid>
            ))
          : searchRelatedProducts?.page.content.map((product, i) => (
              <Grid key={`related-product-${product.id}`} item xs={2}>
                <ProductGridCard
                  product={product}
                  wishAtt={handleWishAtt(product, i)}
                  productAtt={handleProductAtt(product, i)}
                  name={attrProperty.productName.PRODUCT_DETAIL}
                  isRound
                  compact
                  gap={17}
                />
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}

export default memo(ProductRelatedProductList);
