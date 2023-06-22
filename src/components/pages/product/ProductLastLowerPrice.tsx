import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Flexbox, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { NewProductGridCard, NewProductGridCardSkeleton } from '@components/UI/molecules';

import type { SearchLowerProductsParams } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchSearchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryProduct from '@hooks/useQueryProduct';

function ProductLastLowerPrice({ type }: { type?: 'lastImage' }) {
  const { push } = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { data, isSuccess } = useQueryProduct();
  const [isDisplay, setIsDisplay] = useState(true);
  const [searchRelatedProductsParams, setSearchRelatedProductsParams] =
    useState<SearchLowerProductsParams | null>(null);
  const { data: searchRelatedProducts, isLoading } = useQuery(
    queryKeys.products.searchRelatedProducts(
      searchRelatedProductsParams as SearchLowerProductsParams
    ),
    () => fetchSearchRelatedProducts(searchRelatedProductsParams as SearchLowerProductsParams),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      enabled: !!searchRelatedProductsParams
    }
  );

  useEffect(() => {
    if (searchRelatedProducts && !isLoading) {
      if (searchRelatedProducts.page.content.length < 8) {
        setIsDisplay(false);
      }
    }
  }, [isLoading, searchRelatedProducts]);

  useEffect(() => {
    if (isSuccess && data && data.product) {
      setSearchRelatedProductsParams({
        brandIds: data.product.brandId ? [data.product.brandId] : [],
        categoryIds: data.product.categoryId ? [data.product.categoryId] : [],
        line: data.product.line || undefined,
        related: 1,
        size: 8,
        idFilterIds: 30,
        scorePriceAvg: data.product.scorePriceAvg,
        quoteTitle: data.product.quoteTitle,
        productId: data.product.id
      });
    }
  }, [data, isSuccess]);

  const handleClickProductList = () => {
    logEvent(attrKeys.products.CLICK_PRODUCT_LIST, {
      name: attrProperty.name.productDetail,
      title: attrProperty.title.LOWPRICE_PRODUCT,
      type: 'RECOMM'
    });
    push(`/products/search/${data?.product.quoteTitle}`);
  };

  if (!isDisplay) return null;

  return (
    <>
      {!type && <Divider />}
      <Wrap
        disabled={
          searchRelatedProducts?.page.content
            ? searchRelatedProducts?.page.content.length < 8
            : false
        }
      >
        <Typography
          weight="bold"
          variant="h3"
          customStyle={{ color: type ? common.uiWhite : common.uiBlack }}
        >
          최저가 매물만 모았어요
        </Typography>
        <ProductList alignment="flex-start" gap={12}>
          {type &&
            searchRelatedProducts?.page.content.slice(0, 3)?.map((product, i) => (
              <CardListWrap key={`related-product-${product.id}`}>
                <NewProductGridCard
                  variant="swipeX"
                  product={product}
                  hideMetaInfo
                  hideAreaInfo
                  attributes={{
                    name: attrProperty.name.PRODUCT_DETAIL,
                    title: attrProperty.title.LOWPRICE_PRODUCT,
                    type: attrProperty.type.RECOMM,
                    index: i + 1,
                    id: data?.product.id,
                    brand: data?.product.brand.name,
                    category: data?.product.category.name,
                    parentCategory: FIRST_CATEGORIES[data?.product.category.parentId as number],
                    line: data?.product.line,
                    site: data?.product.site.name,
                    price: data?.product.price,
                    scoreTotal: data?.product.scoreTotal,
                    scoreStatus: data?.product.scoreStatus,
                    scoreSeller: data?.product.scoreSeller,
                    scorePrice: data?.product.scorePrice,
                    scorePriceAvg: data?.product.scorePriceAvg,
                    scorePriceCount: data?.product.scorePriceCount,
                    scorePriceRate: data?.product.scorePriceRate,
                    source: attrProperty.source.PRODUCT_DETAIL_LOWPRICE_PRODUCT,
                    nextId: product.id,
                    nextBrand: product.brand.name,
                    nextCategory: product.category.name,
                    nextParentId: product.category.parentId,
                    nextLine: product.line,
                    nextPrice: product.price,
                    nextScoreTotal: product.scoreTotal
                  }}
                />
              </CardListWrap>
            ))}
          {!type &&
            isLoading &&
            Array.from({ length: 5 }, (_, i) => i).map((v) => (
              <Box customStyle={{ minWidth: 144 }} key={`related-product-${v}-skeleton`}>
                <NewProductGridCardSkeleton variant="swipeX" />
              </Box>
            ))}
          {!type &&
            !isLoading &&
            searchRelatedProducts?.page.content?.map((product, i) => (
              <Box customStyle={{ minWidth: 144 }} key={`related-product-${product.id}`}>
                <NewProductGridCard
                  variant="swipeX"
                  product={product}
                  attributes={{
                    name: attrProperty.name.PRODUCT_DETAIL,
                    title: attrProperty.title.LOWPRICE_PRODUCT,
                    type: attrProperty.type.RECOMM,
                    index: i + 1,
                    id: data?.product.id,
                    brand: data?.product.brand.name,
                    category: data?.product.category.name,
                    parentCategory: FIRST_CATEGORIES[data?.product.category.parentId as number],
                    line: data?.product.line,
                    site: data?.product.site.name,
                    price: data?.product.price,
                    scoreTotal: data?.product.scoreTotal,
                    scoreStatus: data?.product.scoreStatus,
                    scoreSeller: data?.product.scoreSeller,
                    scorePrice: data?.product.scorePrice,
                    scorePriceAvg: data?.product.scorePriceAvg,
                    scorePriceCount: data?.product.scorePriceCount,
                    scorePriceRate: data?.product.scorePriceRate,
                    source: attrProperty.source.PRODUCT_DETAIL_LOWPRICE_PRODUCT,
                    nextId: product.id,
                    nextBrand: product.brand.name,
                    nextCategory: product.category.name,
                    nextParentId: product.category.parentId,
                    nextLine: product.line,
                    nextPrice: product.price,
                    nextScoreTotal: product.scoreTotal
                  }}
                />
              </Box>
            ))}
        </ProductList>
        <Button
          fullWidth
          variant="solid"
          size="large"
          customStyle={{
            background: type ? 'rgba(0, 0, 0, 0.4)' : common.ui95,
            color: type ? common.uiWhite : common.ui20
          }}
          onClick={handleClickProductList}
        >
          매물 전체보기
        </Button>
      </Wrap>
    </>
  );
}

const Wrap = styled.div<{ disabled: boolean }>`
  display: ${({ disabled }) => (disabled ? 'none' : 'block')};
  margin-top: 32px;
  width: 100%;
`;

const CardListWrap = styled.div`
  width: 30%;
  * {
    color: white !important;
  }
`;

const ProductList = styled(Flexbox)`
  margin: 20px 0 20px -20px;
  width: calc(100% + 40px);
  overflow: auto;
  padding: 0 20px;
`;

const Divider = styled.div`
  margin-top: 32px;
  border-bottom: 8px solid ${({ theme: { palette } }) => palette.common.bg02};
  margin-left: -20px;
  width: calc(100% + 40px);
`;

export default ProductLastLowerPrice;
