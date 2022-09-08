import { UIEvent, useEffect, useRef, useState } from 'react';

import { useRecoilState } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import throttle from 'lodash-es/throttle';
import styled from '@emotion/styled';

import ProductGridCard from '@components/UI/molecules/ProductGridCard';
import { ProductGridCardSkeleton } from '@components/UI/molecules';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { fetchCamelProducts } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { homeCamelProductCurationPrevScrollState } from '@recoil/home';

function HomeCamelProductCuration() {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();
  const [prevScroll, setPrevScroll] = useRecoilState(homeCamelProductCurationPrevScrollState);
  const [camelProductsParams] = useState({ page: 0, size: 8 });
  const {
    data: camelProducts,
    isLoading,
    isFetching
  } = useQuery(queryKeys.products.camelProducts(camelProductsParams), () =>
    fetchCamelProducts(camelProductsParams)
  );

  const productCurationRef = useRef<HTMLDivElement | null>(null);
  const throttleScrollProductCuration = useRef(
    throttle((e: UIEvent<HTMLDivElement>) => {
      const scrollLeft = e.currentTarget?.scrollLeft;

      if (scrollLeft) setPrevScroll(scrollLeft);
    }, 200)
  );

  const handleClickAll = () => {
    logEvent(attrKeys.home.CLICK_PRODUCT_LIST, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.CAMEL
    });
    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.CAMEL,
      type: attrProperty.productType.GUIDED
    });

    router.push('/products/camel?idFilterIds=5');
  };

  const handleWishAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.CAMEL,
      id: product.id,
      index: i + 1,
      brand: product.brand.name,
      category: product.category.name,
      parentId: product.category.parentId,
      site: product.site.name,
      price: product.price,
      cluster: product.cluster,
      source: attrProperty.productSource.MAIN_CAMEL
    };
  };

  const handleProductAtt = (product: ProductResult, i: number) => {
    return {
      name: attrProperty.productName.MAIN,
      title: attrProperty.productTitle.CAMEL,
      index: i + 1,
      id: product.id,
      brand: product.brand.name,
      category: product.category.name,
      parentCategory: FIRST_CATEGORIES[product.category.parentId as number],
      site: product.site.name,
      price: product.price,
      source: attrProperty.productSource.MAIN_CAMEL
    };
  };

  useEffect(() => {
    if (productCurationRef.current && prevScroll) {
      productCurationRef.current.scrollTo(prevScroll, 0);
    }
  }, [prevScroll]);

  return (
    <Flexbox
      component="section"
      direction="vertical"
      gap={20}
      customStyle={{
        padding: '32px 0',
        backgroundColor: palette.primary.bgLight
      }}
    >
      <Flexbox
        direction="vertical"
        justifyContent="center"
        gap={2}
        customStyle={{ padding: '0 20px' }}
      >
        <Flexbox alignment="center" justifyContent="space-between">
          <Flexbox gap={2} alignment="center">
            <Typography variant="h3" weight="bold">
              카멜 인증 판매자
            </Typography>
            <Icon name="SafeFilled" color={palette.primary.main} width={23} height={23} />
          </Flexbox>

          <Flexbox alignment="center" gap={2} onClick={handleClickAll}>
            <Typography variant="body2" weight="medium">
              전체보기
            </Typography>
            <Icon name="CaretRightOutlined" width={15} height={15} />
          </Flexbox>
        </Flexbox>
        <Typography variant="body2">카멜이 따로 인증한 판매자들이에요. 믿고 거래하세요!</Typography>
      </Flexbox>
      <ProductCuration ref={productCurationRef} onScroll={throttleScrollProductCuration.current}>
        {isLoading || isFetching || !camelProducts
          ? Array.from(new Array(8), (_, index) => (
              <ProductGridCardSkeleton
                key={`carmel-product-curation-card-skeleton-${index}`}
                isRound
                hasAreaWithDateInfo={false}
                customStyle={{ minWidth: 144, flex: 1 }}
              />
            ))
          : camelProducts?.content
              .slice(0, 8)
              .map((product, i) => (
                <ProductGridCard
                  key={`carmel-product-curation-card-${product.id}`}
                  product={product}
                  hideProductLabel
                  hideAreaWithDateInfo
                  hideLegitStatusLabel
                  wishAtt={handleWishAtt(product, i)}
                  productAtt={handleProductAtt(product, i)}
                  name={attrProperty.productName.MAIN}
                  source={attrProperty.productSource.MAIN_CAMEL}
                  compact
                  isRound
                  customStyle={{ minWidth: 144, flex: 1 }}
                />
              ))}
      </ProductCuration>
    </Flexbox>
  );
}

const ProductCuration = styled.div`
  padding: 0 20px;
  display: grid;
  grid-auto-flow: column;
  gap: 12px;
  overflow-x: auto;
`;

export default HomeCamelProductCuration;
