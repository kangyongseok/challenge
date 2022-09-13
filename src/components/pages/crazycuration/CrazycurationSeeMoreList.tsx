import { useCallback } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, Flexbox, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
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

interface CrazycurationSeeMoreListProps {
  contentsId: number;
  logEventTitle: string;
  buttonColor?: string;
  productCardStyle: {
    todayWishViewLabelCustomStyle?: CustomStyle;
    areaWithDateInfoCustomStyle?: CustomStyle;
    metaCamelInfoCustomStyle?: CustomStyle;
  };
  wishButtonStyle: {
    button: CustomStyle;
    selectedButton: CustomStyle;
  };
  onProductAtt: (product: ProductResult, index: number) => Record<string, string | number>;
  onClickProduct: (product: ProductResult, index: number) => () => void;
  handleClickWishButtonEvent: (product: ProductResult, index: number) => () => void;
}

function CrazycurationSeeMoreList({
  contentsId,
  logEventTitle,
  buttonColor,
  productCardStyle: {
    todayWishViewLabelCustomStyle,
    areaWithDateInfoCustomStyle,
    metaCamelInfoCustomStyle
  },
  wishButtonStyle,
  onProductAtt,
  onClickProduct,
  handleClickWishButtonEvent
}: CrazycurationSeeMoreListProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();

  const {
    isLoading,
    data: { contents: { contentsDetails: [contentsDetail] = [] } = {} },
    refetch
  } = useContentsProducts(contentsId);

  const handleClickSeeMore = useCallback(() => {
    if (!contentsDetail) return;

    logEvent(attrKeys.crazycuration.clickProductList, {
      name: attrProperty.name.crazyWeek,
      title: logEventTitle
    });

    SessionStorage.set(sessionStorageKeys.productsEventProperties, {
      name: attrProperty.name.crazyWeek,
      title: attrProperty.name.list,
      type: attrProperty.type.guide
    });
    router.push(contentsDetail.url);
  }, [contentsDetail, logEventTitle, router]);

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
          : contentsDetail?.products?.map((product, index) => (
              <Flexbox
                // eslint-disable-next-line react/no-array-index-key
                key={`crazycuration-product-${product.id}-${index}`}
                direction="vertical"
                gap={20}
              >
                <ProductGridCard
                  product={product}
                  hideProductLabel
                  hideLegitStatusLabel
                  showTodayWishViewLabel
                  hideWishButton
                  hidePlatformLogo
                  name={attrProperty.productName.MAIN}
                  source={attrProperty.productSource.MAIN_MYLIST}
                  productAtt={onProductAtt(product, index + 1)}
                  onClick={onClickProduct(product, index + 1)}
                  compact
                  isRound
                  customStyle={{ marginBottom: 'auto' }}
                  titlePriceStyle={{ color: palette.common.black, opacity: 0.8 }}
                  todayWishViewLabelCustomStyle={todayWishViewLabelCustomStyle}
                  areaWithDateInfoCustomStyle={areaWithDateInfoCustomStyle}
                  metaCamelInfoCustomStyle={metaCamelInfoCustomStyle}
                />
                <CrazycurationWishButton
                  productId={product.id}
                  isWish={product.isWish}
                  refetch={refetch}
                  handleClickWishButtonEvent={handleClickWishButtonEvent(product, index + 1)}
                  buttonStyle={wishButtonStyle}
                />
              </Flexbox>
            ))}
      </ProductList>
      <Box customStyle={{ margin: '20px 20px 0' }} onClick={handleClickSeeMore}>
        <CustomButton variant="contained" fullWidth buttonColor={buttonColor}>
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

const CustomButton = styled(Button)<{ buttonColor?: string }>`
  color: ${({ theme }) => theme.palette.common.white};
  background-color: ${({ buttonColor }) => buttonColor};
  box-shadow: 0px 2px 8px rgba(175, 160, 118, 0.5), inset 0px -1px 4px rgba(0, 0, 0, 0.08),
    inset 0px 1px 4px rgba(255, 255, 255, 0.5);
  padding: 14px 0;
  border: none;
  min-height: 52px;

  ${({ theme: { typography } }) => ({
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight.medium,
    lineHeight: typography.h3.lineHeight,
    letterSpacing: typography.h3.letterSpacing
  })};
`;

export default CrazycurationSeeMoreList;
