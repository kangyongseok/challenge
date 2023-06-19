import { useState } from 'react';
import type { MouseEvent } from 'react';

import { useRouter } from 'next/router';
import { debounce } from 'lodash-es';
import amplitude from 'amplitude-js';
import { useQuery } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { BottomSheet, Box, Flexbox, Icon, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { SNSShareDialog } from '@components/UI/organisms';
import { Header, NewProductGridCard } from '@components/UI/molecules';

import type { ProductDetail } from '@dto/product';

import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_BANNER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { getProductType, productDetailAtt } from '@utils/products';
import { commaNumber } from '@utils/formats';
import { checkAgent, executedShareURl } from '@utils/common';

import type { AppBanner, ShareData } from '@typings/common';

import { CustomHeader, IconBox } from './ProductDetailHeader.styles';

interface ProductDetailHeaderProps {
  data?: ProductDetail;
  isWish?: boolean;
  onClickWish?: (isWish: boolean) => boolean;
}

function ProductDetailHeader({ data, isWish = false, onClickWish }: ProductDetailHeaderProps) {
  const {
    push,
    query: { id: redirect, isCrm, keyword }
  } = useRouter();

  const {
    theme: {
      palette: { secondary }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);
  const [open, setOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData>();

  const { data: relatedProducts } = useQuery(
    queryKeys.products.relatedProducts(Number(data?.product?.id || 0)),
    () => fetchRelatedProducts(Number(data?.product?.id || 0)),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, enabled: !!data?.product }
  );

  const isRedirectPage = typeof redirect !== 'undefined' && Boolean(redirect);

  const handleClickLogo = () => {
    push('/');
  };

  const handleClickShare = () => {
    if (data) {
      productDetailAtt({
        key: attrKeys.products.CLICK_SHARE,
        product: data?.product,
        source: attrProperty.productSource.PRODUCT_LIST
      });

      let viewPrice = data.product ? data.product.price / 10000 : 0;

      if (Number.isNaN(viewPrice)) {
        viewPrice = 0;
      }

      const newShareData = {
        title: data.product.title,
        description: `${data.product.site.name} ${commaNumber(
          viewPrice - Math.floor(viewPrice) > 0
            ? Number(viewPrice.toFixed(1))
            : Math.floor(viewPrice)
        )}만원\r\nAi추천지수 ${data.product.scoreTotal}/10`,
        url: window.location.href,
        product: data.product
      };

      if (
        !executedShareURl({
          url: newShareData.url,
          title: newShareData.title,
          text: newShareData.description,
          product: newShareData.product
        })
      ) {
        setOpen(true);
        setShareData(newShareData);
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
        toastStack({
          children: '찜목록에서 삭제했어요.'
        });
      } else {
        const sessionId = amplitude.getInstance().getSessionId();
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

        appBanner.counts.WISH = (appBanner.counts.WISH || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);

        toastStack({
          children: '찜목록에 추가했어요!',
          action: {
            text: '찜목록 보기',
            onClick: () => push('/wishes')
          }
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

  const handleClickLeft = () => {
    if (isCrm) {
      push(`/products/search/${data?.product.quoteTitle || ''}`);
      return;
    }
    if (keyword) {
      push(`/products/search/${keyword}`);
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
          onClickLeft={isCrm || keyword ? handleClickLeft : undefined}
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
                <NewProductGridCard
                  key={`related-product-card-${relatedProduct.id}`}
                  variant="swipeX"
                  product={relatedProduct}
                  hideAreaInfo
                  attributes={{
                    name: attrProperty.name.PRODUCT_DETAIL,
                    title: attrProperty.title.RELATED_LIST,
                    index: index + 1,
                    source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST
                  }}
                />
              ))}
            </ProductCardList>
          </Box>
        </BottomSheet>
        <SNSShareDialog
          open={open}
          onClose={() => setOpen(false)}
          shareData={shareData}
          product={data?.product}
        />
      </>
    );
  }

  return (
    <>
      <Header
        customHeader={
          <CustomHeader justifyContent="space-between" alignment="center">
            <Icon name="LogoText_96_20" width={93.28} height={20} onClick={handleClickLogo} />
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
              <NewProductGridCard
                key={`related-product-card-${relatedProduct.id}`}
                variant="swipeX"
                product={relatedProduct}
                hideAreaInfo
                attributes={{
                  name: attrProperty.name.PRODUCT_DETAIL,
                  title: attrProperty.title.RELATED_LIST,
                  index: index + 1,
                  source: attrProperty.source.PRODUCT_DETAIL_RELATED_LIST
                }}
              />
            ))}
          </ProductCardList>
        </Box>
      </BottomSheet>
      <SNSShareDialog
        open={open}
        onClose={() => setOpen(false)}
        shareData={shareData}
        product={data?.product}
      />
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
