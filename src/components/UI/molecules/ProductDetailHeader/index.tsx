import { MouseEvent, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { BottomSheet, Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import amplitude from 'amplitude-js';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import ProductGridCard from '@components/UI/molecules/ProductGridCard';
import { Header } from '@components/UI/molecules';

import type { ProductDetail } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_BANNER } from '@constants/localStorage';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { getProductType } from '@utils/products';
import { commaNumber } from '@utils/formats';
import { checkAgent, executedShareURl } from '@utils/common';

import type { AppBanner } from '@typings/common';
import { dialogState, toastState } from '@recoil/common';

import { CustomHeader, IconBox } from './ProductDetailHeader.styles';

interface ProductDetailHeaderProps {
  data?: ProductDetail;
  isWish?: boolean;
  onClickWish?: (isWish: boolean) => boolean;
}

function ProductDetailHeader({ data, isWish = false, onClickWish }: ProductDetailHeaderProps) {
  const {
    push,
    query: { id: redirect, isCrm }
  } = useRouter();

  const {
    theme: {
      palette: { secondary }
    }
  } = useTheme();

  const setDialogState = useSetRecoilState(dialogState);
  const setToastState = useSetRecoilState(toastState);

  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);

  const { data: relatedProducts } = useQuery(
    queryKeys.products.relatedProducts(Number(data?.product?.id || 0)),
    () => fetchRelatedProducts(Number(data?.product?.id || 0)),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, enabled: !!data?.product }
  );

  const sessionId = amplitude.getInstance().getSessionId();
  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);

  const appBanner: AppBanner = LocalStorage.get<AppBanner>(APP_BANNER) || {
    sessionId,
    counts: {},
    isInit: !!sessionId,
    lastAction: '',
    isClosed: false,
    mainCloseTime: '',
    mainType: 0,
    isTooltipView: false,
    viewProductList: []
  };

  const handleClickLogo = () => {
    push('/');
  };

  const handleClickShare = () => {
    if (data) {
      let viewPrice = data.product ? data.product.price / 10000 : 0;

      if (Number.isNaN(viewPrice)) {
        viewPrice = 0;
      }

      if (
        !executedShareURl({
          title: data.product.title,
          text: `${data.product.site.name} ${commaNumber(
            viewPrice - Math.floor(viewPrice) > 0
              ? Number(viewPrice.toFixed(1))
              : Math.floor(viewPrice)
          )}만원\r\nAi추천지수 ${data.product.scoreTotal}/10`,
          url: window.location.href,
          product: data.product
        })
      ) {
        setDialogState({ type: 'SNSShare', product: data.product });
      }
    }
  };

  const handleClickWish = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const { product } = data || {};

    logEvent(isWish ? attrKeys.products.clickWishCancel : attrKeys.products.clickWish, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.PRODUCT_DETAIL,
      id: product?.id,
      brand: product?.brand.name,
      category: product?.category.name,
      parentId: product?.category.parentId,
      line: product?.line,
      site: product?.site.name,
      price: product?.price,
      scoreTotal: product?.scoreTotal,
      cluster: product?.cluster,
      productType: getProductType(
        product?.productSeller.site.id || 0,
        product?.productSeller.type || 0
      )
    });

    if (onClickWish && onClickWish(isWish)) {
      if (isWish) {
        setToastState({ type: 'product', status: 'successRemoveWish' });
      } else {
        appBanner.counts.WISH = (appBanner.counts.WISH || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);

        setToastState({
          type: 'product',
          status: 'successAddWish',
          action: () => push('/wishes')
        });

        if ((relatedProducts?.content || []).length >= 6) {
          logEvent(attrKeys.products.VIEW_WISH_MODAL, {
            name: attrProperty.productName.PRODUCT_DETAIL
          });
          setIsOpenRelatedProductListBottomSheet(true);
          scrollDisable();
        }
      }
    }
  };

  const handleCloseRelatedProductListBottomSheet = () => {
    logEvent(attrKeys.products.CLICK_WISHMOAL_CLOSE, {
      name: attrProperty.productName.PRODUCT_DETAIL
    });

    setIsOpenRelatedProductListBottomSheet(false);
    scrollEnable();
  };

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.SWIP_X_CARD, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.WISH_MODAL
    });
  }, 300);

  if (checkAgent.isMobileApp()) {
    return (
      <>
        <Header
          showRight={!isRedirectPage}
          onClickLeft={
            isCrm ? () => push(`/products/search/${data?.product.quoteTitle || ''}`) : undefined
          }
          rightIcon={
            <Flexbox alignment="center">
              <Box
                onClick={handleClickWish}
                customStyle={{
                  padding: '16px 8px'
                }}
              >
                <Icon
                  name={isWish ? 'HeartFilled' : 'HeartOutlined'}
                  color={isWish ? secondary.red.light : undefined}
                />
              </Box>
              <Box
                onClick={handleClickShare}
                customStyle={{
                  padding: '16px 8px'
                }}
              >
                <Icon name="ShareOutlined" />
              </Box>
            </Flexbox>
          }
        />
        <BottomSheet
          open={isOpenRelatedProductListBottomSheet}
          disableSwipeable
          onClose={handleCloseRelatedProductListBottomSheet}
        >
          <Box customStyle={{ padding: '16px 20px 32px' }}>
            <Box customStyle={{ float: 'right' }}>
              <Icon name="CloseOutlined" onClick={handleCloseRelatedProductListBottomSheet} />
            </Box>
            <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 24 }}>
              같이 찜해두면 좋은 매물
            </Typography>
            <ProductCardList onScroll={handleScroll}>
              {relatedProducts?.content.map((relatedProduct, index) => (
                <ProductGridCard
                  key={`related-product-card-${relatedProduct.id}`}
                  product={relatedProduct}
                  compact
                  hideProductLabel
                  hideAreaWithDateInfo
                  name={attrProperty.productName.WISH_MODAL}
                  isRound
                  gap={8}
                  wishAtt={{
                    name: attrProperty.name.PRODUCT_DETAIL,
                    title: attrProperty.title.RELATED_LIST,
                    id: relatedProduct.id,
                    index: index + 1,
                    brand: relatedProduct.brand.name,
                    category: relatedProduct.category.name,
                    parentId: relatedProduct.category.parentId,
                    site: relatedProduct.site.name,
                    price: relatedProduct.price,
                    cluster: relatedProduct.cluster,
                    source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST,
                    sellerType: relatedProduct.sellerType
                  }}
                  productAtt={{
                    name: attrProperty.name.PRODUCT_DETAIL,
                    title: attrProperty.title.RELATED_LIST,
                    index: index + 1,
                    id: relatedProduct.id,
                    brand: relatedProduct.brand.name,
                    category: relatedProduct.category.name,
                    parentCategory: FIRST_CATEGORIES[relatedProduct.category.parentId as number],
                    site: relatedProduct.site.name,
                    price: relatedProduct.price,
                    source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST,
                    sellerType: relatedProduct.sellerType
                  }}
                  source={attrProperty.productSource.PRODUCT_RELATED_LIST}
                />
              ))}
            </ProductCardList>
          </Box>
        </BottomSheet>
      </>
    );
  }

  return (
    <>
      <Header
        customHeader={
          <CustomHeader justifyContent="space-between" alignment="center">
            <Icon name="LogoText_96_20" onClick={handleClickLogo} />
            <Flexbox alignment="center">
              <IconBox show disablePadding="right" onClick={handleClickWish}>
                <Icon
                  name={isWish ? 'HeartFilled' : 'HeartOutlined'}
                  color={isWish ? secondary.red.light : undefined}
                />
              </IconBox>
              <IconBox show disablePadding="right" onClick={handleClickShare}>
                <Icon name="ShareOutlined" />
              </IconBox>
            </Flexbox>
          </CustomHeader>
        }
      />
      <BottomSheet
        open={isOpenRelatedProductListBottomSheet}
        disableSwipeable
        onClose={handleCloseRelatedProductListBottomSheet}
      >
        <Box customStyle={{ padding: '16px 20px 32px' }}>
          <Box customStyle={{ float: 'right' }}>
            <Icon name="CloseOutlined" onClick={handleCloseRelatedProductListBottomSheet} />
          </Box>
          <Typography variant="h4" weight="bold" customStyle={{ marginBottom: 24 }}>
            같이 찜해두면 좋은 매물
          </Typography>
          <ProductCardList onScroll={handleScroll}>
            {relatedProducts?.content.map((relatedProduct, index) => (
              <ProductGridCard
                key={`related-product-card-${relatedProduct.id}`}
                product={relatedProduct}
                compact
                hideProductLabel
                hideAreaWithDateInfo
                name={attrProperty.productName.WISH_MODAL}
                isRound
                gap={8}
                wishAtt={{
                  name: attrProperty.name.PRODUCT_DETAIL,
                  title: attrProperty.title.RELATED_LIST,
                  id: relatedProduct.id,
                  index: index + 1,
                  brand: relatedProduct.brand.name,
                  category: relatedProduct.category.name,
                  parentId: relatedProduct.category.parentId,
                  site: relatedProduct.site.name,
                  price: relatedProduct.price,
                  cluster: relatedProduct.cluster,
                  source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST,
                  sellerType: relatedProduct.sellerType
                }}
                productAtt={{
                  name: attrProperty.name.PRODUCT_DETAIL,
                  title: attrProperty.title.RELATED_LIST,
                  index: index + 1,
                  id: relatedProduct.id,
                  brand: relatedProduct.brand.name,
                  category: relatedProduct.category.name,
                  parentCategory: FIRST_CATEGORIES[relatedProduct.category.parentId as number],
                  site: relatedProduct.site.name,
                  price: relatedProduct.price,
                  source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST,
                  sellerType: relatedProduct.sellerType
                }}
                source={attrProperty.productSource.PRODUCT_RELATED_LIST}
              />
            ))}
          </ProductCardList>
        </Box>
      </BottomSheet>
    </>
  );
}

const ProductCardList = styled.div`
  margin: 0 -20px;
  padding: 0 20px;
  overflow-x: auto;
  display: grid;
  grid-auto-flow: column;

  grid-auto-columns: 120px;
  column-gap: 8px;
`;

export default ProductDetailHeader;
