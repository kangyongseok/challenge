import { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Button, Flexbox, Skeleton, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductGridCard } from '@components/UI/molecules';

import type { Product, SearchLowerProductsParams } from '@dto/product';

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

  const handleWishAtt = (product: Product, i: number) => {
    return {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.LOWPRICE_PRODUCT,
      type: attrProperty.type.RECOMM,
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
      source: attrProperty.source.PRODUCT_DETAIL_LOWPRICE_PRODUCT,
      sellerType: product.sellerType
    };
  };

  const handleProductAtt = (product: Product, i: number) => {
    if (data?.product) {
      return {
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
        sellerType: product.sellerType,
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
    <Wrap
      disabled={
        searchRelatedProducts?.page.content ? searchRelatedProducts?.page.content.length < 8 : false
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
          searchRelatedProducts?.page.content.slice(0, 3).map((product, i) => (
            <Box customStyle={{ flex: 1 }} key={`related-product-${product.id}`}>
              <ProductGridCard
                product={product}
                wishAtt={handleWishAtt(product, i)}
                productAtt={handleProductAtt(product, i)}
                name={attrProperty.productName.PRODUCT_DETAIL}
                isRound
                compact
                gap={17}
                source={attrProperty.productSource.LIST_RELATED}
                titlePriceStyle={{ color: common.uiWhite }}
                hidePlatformLogo
                hideWishButton
                hideProductLabel
                hideAreaWithDateInfo
                hideLegitStatusLabel
                hideMetaCamelInfo
              />
            </Box>
          ))}
        {!type &&
          isLoading &&
          Array.from({ length: 5 }, (_, i) => i).map((v) => (
            <Flexbox
              direction="vertical"
              key={`skeleton-${v}`}
              customStyle={{ minWidth: 144 }}
              gap={17}
            >
              <Skeleton width={144} height={144} round={8} disableAspectRatio />
              <Flexbox direction="vertical" gap={3}>
                <Skeleton width={144} height={15} disableAspectRatio />
                <Skeleton width={144} height={15} disableAspectRatio />
                <Skeleton width={144} height={20} disableAspectRatio />
                <Skeleton width={144} height={15} disableAspectRatio />
              </Flexbox>
            </Flexbox>
          ))}
        {!type &&
          !isLoading &&
          searchRelatedProducts?.page.content.map((product, i) => (
            <Box customStyle={{ minWidth: 144 }} key={`related-product-${product.id}`}>
              <ProductGridCard
                product={product}
                wishAtt={handleWishAtt(product, i)}
                productAtt={handleProductAtt(product, i)}
                name={attrProperty.productName.PRODUCT_DETAIL}
                isRound
                compact
                gap={17}
                source={attrProperty.productSource.LIST_RELATED}
                titlePriceStyle={{ color: common.uiBlack }}
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
  );
}

const Wrap = styled.div<{ disabled: boolean }>`
  display: ${({ disabled }) => (disabled ? 'none' : 'block')};
`;

const ProductList = styled(Flexbox)`
  margin: 20px 0 20px -20px;
  width: calc(100% + 40px);
  overflow: auto;
  padding: 0 20px;
`;

export default ProductLastLowerPrice;
