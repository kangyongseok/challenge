import { useCallback } from 'react';

import { useRouter } from 'next/router';
import { Box, Button, CustomStyle, Flexbox, Typography, useTheme } from 'mrcamel-ui';
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

interface CrazycurationMultiListProps {
  contentsId: number;
  showMainImage: boolean;
  logEventTitle: string;
  buttonColor?: string;
  infoStyle?: {
    titleStyle: CustomStyle;
    highlightColor: string;
  };
  imageCardStyle?: CustomStyle;
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

function CrazycurationMultiList({
  contentsId,
  showMainImage,
  logEventTitle,
  buttonColor,
  infoStyle,
  imageCardStyle,
  productCardStyle: {
    todayWishViewLabelCustomStyle,
    areaWithDateInfoCustomStyle,
    metaCamelInfoCustomStyle
  },
  wishButtonStyle,
  onProductAtt,
  onClickProduct,
  handleClickWishButtonEvent
}: CrazycurationMultiListProps) {
  const {
    theme: { palette }
  } = useTheme();
  const router = useRouter();

  const {
    isLoading,
    data: { contents: { contentsDetails = [] } = {} },
    refetch
  } = useContentsProducts(contentsId);

  const handleClickSeeMore = useCallback(
    (url: string) => () => {
      logEvent(attrKeys.crazycuration.clickProductList, {
        name: attrProperty.name.crazyWeek,
        title: logEventTitle
      });
      SessionStorage.set(sessionStorageKeys.productsEventProperties, {
        name: attrProperty.name.crazyWeek,
        title: attrProperty.name.list,
        type: attrProperty.type.guide
      });
      router.push(url);
    },
    [logEventTitle, router]
  );

  return (
    <Flexbox direction="vertical" gap={84}>
      {isLoading ? (
        <Flexbox direction="vertical" gap={32}>
          <Flexbox direction="vertical" alignment="center" gap={8}>
            <Skeleton disableAspectRatio isRound height="24px" width="200px" />
            <Skeleton disableAspectRatio isRound height="42px" width="335px" />
          </Flexbox>
          <ProductList>
            {showMainImage && <Skeleton disableAspectRatio isRound />}
            {Array.from({ length: 8 }, (_, index) => (
              <Flexbox key={`crazycuration-card-skeleton-${index}`} direction="vertical" gap={20}>
                <ProductGridCardSkeleton
                  isRound
                  hasAreaWithDateInfo={false}
                  customStyle={{ minWidth: 144, flex: 1 }}
                />
                <Skeleton disableAspectRatio isRound height="32px" />
              </Flexbox>
            ))}
          </ProductList>
        </Flexbox>
      ) : (
        contentsDetails.map(({ title, subTitle, imageTitle, imageMain, products, url }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Flexbox key={`crazycuration-grouped-product-${index}`} direction="vertical" gap={32}>
            <Flexbox direction="vertical" alignment="center" gap={8}>
              <Typography
                variant="h3"
                customStyle={{ textAlign: 'center', ...infoStyle?.titleStyle }}
                dangerouslySetInnerHTML={{ __html: title }}
              />
              <SubTitle
                highlightColor={infoStyle?.highlightColor}
                dangerouslySetInnerHTML={{ __html: subTitle }}
              />
            </Flexbox>
            <ProductList>
              {showMainImage && (
                <Flexbox customStyle={{ position: 'relative' }}>
                  <MainTitle variant="h2" dangerouslySetInnerHTML={{ __html: imageTitle }} />
                  <MainImage imageUrl={imageMain} customStyle={imageCardStyle} />
                </Flexbox>
              )}
              {products.map((product, innerIndex) => {
                const productIndex =
                  contentsDetails
                    .slice(0, index)
                    .map((contentsDetail) => contentsDetail.products.length)
                    .reduce((a, b) => a + b, 0) +
                  innerIndex +
                  1;

                return (
                  <Flexbox
                    key={`crazycuration-product-${product.id}`}
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
                      productAtt={onProductAtt(product, productIndex)}
                      onClick={onClickProduct(product, productIndex)}
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
                );
              })}
            </ProductList>
            <Box customStyle={{ margin: '20px 20px 0' }} onClick={handleClickSeeMore(url)}>
              <CustomButton variant="contained" fullWidth buttonColor={buttonColor}>
                매물 더 찾아보기
              </CustomButton>
            </Box>
          </Flexbox>
        ))
      )}
    </Flexbox>
  );
}

const SubTitle = styled(Typography)<{ highlightColor?: string }>`
  text-align: center;
  font-style: normal;
  font-weight: 900;
  font-size: 32px;
  line-height: 42px;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.palette.common.black};

  & > b {
    color: ${({ highlightColor }) => highlightColor};
  }
`;

const ProductList = styled.div`
  padding: 0 20px;
  display: grid;
  gap: 32px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

const MainTitle = styled(Typography)`
  position: absolute;
  top: 24px;
  left: 16px;
  z-index: 1;
  font-weight: 900;
  color: ${({ theme }) => theme.palette.common.black};
`;

const MainImage = styled.div<{ imageUrl: string; customStyle?: CustomStyle }>`
  width: 100%;
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  background-image: url(${({ imageUrl }) => imageUrl});

  ${({ customStyle }) => customStyle};
`;

const CustomButton = styled(Button)<{ buttonColor?: string }>`
  color: ${({ theme }) => theme.palette.common.white};
  background-color: ${({ buttonColor }) => buttonColor};
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

export default CrazycurationMultiList;
