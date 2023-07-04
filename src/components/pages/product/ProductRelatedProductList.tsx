import { memo } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Grid, Skeleton, Typography } from '@mrcamelhub/camel-ui';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import type { Product } from '@dto/product';

import { fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';

interface ProductRelatedProductListProps {
  brandId?: number;
  categoryId?: number | null;
  line?: string | null;
  prevProduct?: Product;
  quoteTitle?: string;
  price?: number;
  size?: string | null;
  productId?: number;
  parentId?: number | null;
  isSoldOut: boolean;
  isDeleted: boolean;
}

function ProductRelatedProductList({
  brandId,
  categoryId,
  line,
  prevProduct,
  quoteTitle,
  price,
  productId,
  isSoldOut,
  isDeleted,
  size,
  parentId
}: ProductRelatedProductListProps) {
  const router = useRouter();

  const params = {
    brandIds: brandId ? [brandId] : undefined,
    categoryIds: categoryId ? [categoryId] : undefined,
    line: line || undefined,
    related: 1,
    size: 12,
    quoteTitle,
    price,
    productId,
    sizes: size && [14, 45, 97, 104, 119, 282].includes(parentId || 0) ? [size] : []
  };

  const { data: searchRelatedProducts, isInitialLoading } = useQuery(
    queryKeys.products.searchRelatedProducts(params),
    () => fetchSearchRelatedProducts(params),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled: (productId && !!brandId && !!line) || (!!brandId && !line)
    }
  );

  if (
    !isInitialLoading &&
    (!searchRelatedProducts?.page?.content || !searchRelatedProducts?.page?.content?.length)
  )
    return null;

  return (
    <Box customStyle={{ margin: '32px 0' }}>
      {isInitialLoading ? (
        <Skeleton
          width="100%"
          maxWidth={144}
          height={24}
          round={8}
          disableAspectRatio
          customStyle={{
            marginBottom: 20
          }}
        />
      ) : (
        <Typography variant="h3" weight="bold" customStyle={{ marginBottom: 20 }}>
          {isSoldOut || isDeleted ? '찾던 매물과 비슷해요' : '보고 있는 매물과 비슷해요'}
        </Typography>
      )}
      <Grid
        container
        rowGap={32}
        columnGap={12}
        customStyle={{ marginLeft: -20, width: 'calc(100% + 40px)', padding: '0 10px' }}
      >
        {isInitialLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <Grid key={`related-product-skeleton-${index}`} item xs={2}>
                <NewProductGridCardSkeleton variant="gridB" />
              </Grid>
            ))
          : searchRelatedProducts?.page.content.map((product, index) => (
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
      <Button
        variant="ghost"
        brandColor="black"
        size="large"
        fullWidth
        onClick={() =>
          router.push({
            pathname: `/products/search/${prevProduct?.brand.name}`,
            query: {
              brandIds: params.brandIds,
              categoryIds: params.categoryIds,
              line: params.line,
              quoteTitle: params.quoteTitle,
              sizes: params.sizes
            }
          })
        }
        customStyle={{
          marginTop: 32
        }}
      >
        매물 더보기
      </Button>
    </Box>
  );
}

export default memo(ProductRelatedProductList);
