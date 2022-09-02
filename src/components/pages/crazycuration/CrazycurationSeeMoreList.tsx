import { useCallback } from 'react';

import type { ParsedUrlQueryInput } from 'node:querystring';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { ProductGridCard, ProductGridCardSkeleton } from '@components/UI/molecules';
import { Skeleton } from '@components/UI/atoms';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useContentsProducts from '@hooks/useContentsProducts';

import CrazycurationWishButton from './CrazycurationWishButton';

interface CrazycurationTabListProps {
  contentsId: number;
  urlQuery: ParsedUrlQueryInput;
  onProductAtt: (product: ProductResult, index: number) => Record<string, string | number>;
  onClickProduct: (product: ProductResult, index: number) => () => void;
  handleClickWishButtonEvent: (product: ProductResult, index: number) => () => void;
  logEventTitle: string;
}

function CrazycurationSeeMoreList({
  contentsId,
  urlQuery,
  onProductAtt,
  onClickProduct,
  handleClickWishButtonEvent,
  logEventTitle
}: CrazycurationTabListProps) {
  const router = useRouter();
  const {
    theme: { palette }
  } = useTheme();

  const {
    isLoading,
    data: { products },
    refetch
  } = useContentsProducts(contentsId);

  const handleClickSeeMore = useCallback(() => {
    logEvent(attrKeys.crazycuration.clickProductList, {
      name: attrProperty.name.crazyWeek,
      title: logEventTitle
    });

    const { brandName, ...query } = urlQuery;

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.crazyWeek,
      title: attrProperty.name.list,
      type: attrProperty.type.guide
    });
    router.push({ pathname: `/products/brands/${brandName}`, query });
  }, [logEventTitle, router, urlQuery]);

  return (
    <Flexbox direction="vertical" gap={32}>
      <ProductList>
        {isLoading
          ? Array.from({ length: 8 }, (_, index) => (
              <Flexbox key={`crazycuration-card-skeleton-${index}`} direction="vertical" gap={20}>
                <ProductGridCardSkeleton
                  isRound
                  hasAreaWithDateInfo={false}
                  customStyle={{ minWidth: 144, flex: 1 }}
                />
                <Skeleton disableAspectRatio isRound height="32px" />
              </Flexbox>
            ))
          : products.map((product, index) => {
              return (
                <Flexbox key={`crazycuration-product-${product.id}`} direction="vertical" gap={20}>
                  <ProductGridCard
                    product={product}
                    hideProductLabel
                    hideLegitStatusLabel
                    showTodayWishViewLabel
                    hideWishButton
                    name={attrProperty.productName.MAIN}
                    source={attrProperty.productSource.MAIN_MYLIST}
                    productAtt={onProductAtt(product, index + 1)}
                    onClick={onClickProduct(product, index + 1)}
                    compact
                    isRound
                    customStyle={{ marginBottom: 'auto' }}
                    todayWishViewLabelColor={{
                      color: palette.common.white,
                      backgroundColor: '#507C44'
                    }}
                  />
                  <CrazycurationWishButton
                    listType="b"
                    productId={product.id}
                    isWish={product.isWish}
                    refetch={refetch}
                    handleClickWishButtonEvent={handleClickWishButtonEvent(product, index + 1)}
                  />
                </Flexbox>
              );
            })}
      </ProductList>
      <Box customStyle={{ margin: '20px 20px 0' }} onClick={handleClickSeeMore}>
        <CustomButton variant="contained" fullWidth>
          매물 더 찾아보기
        </CustomButton>
      </Box>
    </Flexbox>
  );
}

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  gap: 32px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const CustomButton = styled(Button)`
  background: #507c44;
  box-shadow: 0px 2px 8px rgba(175, 160, 118, 0.5), inset 0px -1px 4px rgba(0, 0, 0, 0.08),
    inset 0px 1px 4px rgba(255, 255, 255, 0.5);
  color: ${({ theme }) => theme.palette.common.white};
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: -0.01em;
  padding: 14px 0;
  border: none;
`;

export default CrazycurationSeeMoreList;
