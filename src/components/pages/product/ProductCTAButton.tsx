import { memo, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { UseMutateFunction, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Avatar,
  BottomSheet,
  Box,
  CtaButton,
  Flexbox,
  Icon,
  Label,
  Toast,
  Tooltip,
  Typography,
  useTheme
} from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import styled from '@emotion/styled';

import ProductGridCard from '@components/UI/molecules/ProductGridCard';

import type { Product, ProductDetail } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedProducts } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE, PRODUCT_STATUS } from '@constants/product';
import { APP_BANNER, IS_DONE_WISH_ON_BOARDING } from '@constants/localStorage';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { productDetailAtt } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getRandomNumber } from '@utils/common';
import checkAgent from '@utils/checkAgent';

import type { AppBanner } from '@typings/common';
import { productLegitToggleBottomSheetState } from '@recoil/productLegit';
import type { MetaInfoMutateParams } from '@hooks/useQueryProduct';

interface ProductCTAButtonProps {
  product?: Product;
  isDup: boolean;
  hasTarget: boolean;
  isPriceCrm: boolean;
  salePrice: number;
  isWish?: boolean;
  isPriceDown?: boolean;
  isProductLegit?: boolean;
  onClickWish: (isWish: boolean) => boolean;
  onClickSMS: ({
    siteId,
    sellerType,
    id,
    sellerPhoneNumber
  }: {
    siteId?: number;
    sellerType?: number;
    id?: number;
    sellerPhoneNumber: string | null;
  }) => void;
  mutateMetaInfo: UseMutateFunction<
    ProductDetail | undefined,
    unknown,
    MetaInfoMutateParams,
    unknown
  >;
}

function ProductCTAButton({
  product,
  isDup,
  hasTarget,
  isPriceCrm,
  salePrice,
  isWish = false,
  isPriceDown,
  isProductLegit,
  onClickWish,
  onClickSMS,
  mutateMetaInfo
}: ProductCTAButtonProps) {
  const {
    push,
    query: { id, source }
  } = useRouter();

  const {
    theme: { palette }
  } = useTheme();

  const setLegitBottomSheet = useSetRecoilState(productLegitToggleBottomSheetState);
  const { data: relatedProducts } = useQuery(
    queryKeys.products.relatedProducts(Number(product?.id || 0)),
    () => fetchRelatedProducts(Number(product?.id || 0)),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, enabled: !!product }
  );
  const [legitTooltip, setLegitTooltip] = useState(true);

  const [isDoneWishOnBoarding, setIsDoneWishOnBoarding] = useState(true);
  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);
  const [{ isOpenPriceCRMTooltip, isOpenBunJangTooltip }, setOpenTooltip] = useState({
    isOpenPriceCRMTooltip: isPriceCrm,
    isOpenBunJangTooltip: false
  });
  const [{ isOpenSoldOutToast, isOpenRemoveWishToast, isOpenAddWishToast }, setOpenToast] =
    useState({
      isOpenSoldOutToast: false,
      isOpenRemoveWishToast: false,
      isOpenAddWishToast: false
    });
  const isCamelProduct = product?.productSeller.site.id === PRODUCT_SITE.CAMEL.id;
  const isCamelSeller =
    product &&
    SELLER_STATUS[product.productSeller.type as keyof typeof SELLER_STATUS] === SELLER_STATUS['3'];
  const isSoldOut =
    product &&
    PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'];
  const isReserving =
    product &&
    PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] === PRODUCT_STATUS['4'];
  const ctaText = useMemo(() => {
    const siteName =
      (product?.siteUrl.hasImage && product?.siteUrl.name) ||
      (product?.site.hasImage && product?.site.name) ||
      '';

    if (!product || !siteName) return '';

    if (isDup && hasTarget) {
      return '다시 올린 매물로 이동하기';
    }

    if (isReserving) {
      return '예약중';
    }

    if (isSoldOut) {
      return '판매완료';
    }

    if (isCamelProduct || isCamelSeller) {
      return '판매자에게 문자 보내기';
    }

    return `${siteName}에서 거래하기`;
  }, [hasTarget, isCamelProduct, isCamelSeller, isDup, isReserving, isSoldOut, product]);

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
  const platformId =
    (product?.siteUrl?.hasImage && product?.siteUrl.id) ||
    (product?.site.hasImage && product?.site?.id) ||
    '';

  useEffect(() => {
    if (isPriceCrm) {
      logEvent(attrKeys.products.VIEW_PURCHASE_TOOLTIP, {
        name: 'PRODUCT_DETAIL',
        att: 'PRICELOW'
      });
      setTimeout(
        () => setOpenTooltip((prevState) => ({ ...prevState, isOpenPriceCRMTooltip: false })),
        6000
      );
    }

    if (
      !LocalStorage.get(IS_DONE_WISH_ON_BOARDING) &&
      checkAgent.isMobileApp() &&
      source !== 'WISH_LIST'
    ) {
      LocalStorage.set(IS_DONE_WISH_ON_BOARDING, true);
      setIsDoneWishOnBoarding(false);
      window.scrollTo(0, 0);
      scrollDisable();
    }

    return () => scrollEnable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsOpenRelatedProductListBottomSheet(false);
  }, [id]);

  const handleClickWish = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    logEvent(isWish ? attrKeys.products.CLICK_WISH_CANCEL : attrKeys.products.CLICK_WISH, {
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
      cluster: product?.cluster
    });

    if (onClickWish(isWish)) {
      if (isWish) {
        setOpenToast((prevState) => ({
          ...prevState,
          isOpenAddWishToast: false,
          isOpenRemoveWishToast: true
        }));
      } else {
        appBanner.counts.WISH = (appBanner.counts.WISH || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);
        setOpenToast((prevState) => ({
          ...prevState,
          isOpenAddWishToast: true,
          isOpenRemoveWishToast: false
        }));

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

  const handleClickCTAButton = () => {
    let conversionId = 0;
    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};

    if (
      product &&
      product.productSeller &&
      product.productSeller.site &&
      (product.productSeller.site.id === 24 || product.productSeller.type === 3)
    ) {
      conversionId = Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);
      productDetailAtt({
        key: attrKeys.products.CLICK_PURCHASE,
        product,
        source: productDetailSource || undefined,
        rest: { conversionId }
      });
    }

    if (isSoldOut && !isReserving && (!isDup || !hasTarget)) {
      setOpenToast((prevState) => ({ ...prevState, isOpenSoldOutToast: true }));
      return;
    }

    if (product && (isCamelProduct || isCamelSeller)) {
      onClickSMS({
        siteId: product.site?.id,
        sellerType: product.productSeller?.type,
        id: product.id,
        sellerPhoneNumber: product.productSeller.phone
      });
      return;
    }

    mutateMetaInfo({ isAddPurchaseCount: true });

    if (!isDup || !hasTarget) {
      appBanner.counts.PURCHASE = (appBanner.counts.PURCHASE || 0) + 1;
      LocalStorage.set(APP_BANNER, appBanner);

      if (product?.site.id === PRODUCT_SITE.BUNJANG.id && checkAgent.isIOSApp()) {
        appBanner.counts.IOSBUNJANG = (appBanner.counts.IOSBUNJANG || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);
      }
    }

    if (isDup && hasTarget) {
      productDetailAtt({
        key: attrKeys.products.CLICK_PRODUCT_DETAIL,
        product: product as Product,
        rest: {
          att: isPriceDown ? 'CPPRICELOW' : 'CPSAME'
        }
      });
      push(`/products/${product?.targetProductId}`);
      return;
    }
    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product: product as Product,
      source: productDetailSource || undefined,
      rest: { conversionId }
    });

    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    window.open(`/products/${product?.id}?redirect=1&userAgent=${userAgent}`, '_blank');
  };

  const handleClickWishOnBoarding = () => {
    setIsDoneWishOnBoarding(true);
    scrollEnable();
  };

  const handleClickBunJangTooltip = () => {
    appBanner.counts.IOSBUNJANG = (appBanner.counts.IOSBUNJANG || 0) + 1;
    LocalStorage.set(APP_BANNER, appBanner);
    setOpenTooltip((prevState) => ({ ...prevState, isOpenBunJangTooltip: false }));
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

  return (
    <>
      <Wrapper>
        <Tooltip
          open={!isDoneWishOnBoarding}
          brandColor="primary-highlight"
          message={
            <Typography variant="body2" weight="bold">
              찜하면 가격이 내려갔을 때 알려드려요!🛎
            </Typography>
          }
          triangleLeft={20}
          customStyle={{
            left: 115
          }}
        >
          <WishButton onClick={handleClickWish} isWish={isWish} disabled={!product || !ctaText}>
            {isWish ? (
              <Icon name="HeartFilled" color={palette.secondary.red.main} width={32} height={32} />
            ) : (
              <Icon name="HeartOutlined" width={32} height={32} />
            )}
          </WishButton>
        </Tooltip>
        {!isDoneWishOnBoarding && (
          <OnBoardingDim onClick={handleClickWishOnBoarding}>
            {' '}
            <OnBoardingWishButton>
              <Icon name="HeartFilled" color={palette.secondary.red.main} width={32} height={32} />
            </OnBoardingWishButton>{' '}
          </OnBoardingDim>
        )}
        {isProductLegit && !product?.productLegit && (
          <ProductLegitCTAButton
            variant="contained"
            size="large"
            onClick={() => {
              logEvent(attrKeys.legit.CLICK_LEGIT_BANNER, {
                name: attrProperty.productName.PRODUCT_DETAIL,
                title: attrProperty.productTitle.CTA,
                brand: product?.brand.name,
                category: product?.category.name,
                parentCategory: FIRST_CATEGORIES[product?.category.parentId as number],
                site: product?.site.name,
                price: product?.price,
                imageCount: product?.imageCount,
                legitStatus: product?.productLegit?.status,
                legitResult: product?.productLegit?.result
              });
              setLegitBottomSheet(true);
            }}
          >
            <Tooltip
              open={legitTooltip && isDoneWishOnBoarding && !isOpenPriceCRMTooltip}
              brandColor="primary-highlight"
              message={
                <Flexbox gap={6} alignment="center">
                  <Label text="NEW" variant="contained" size="xsmall" />
                  <Typography weight="bold" variant="small1">
                    지금 보는 사진 그대로 실시간 정가품 의견받기
                  </Typography>
                  <Icon
                    name="CloseOutlined"
                    size="small"
                    color={palette.common.grey['20']}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLegitTooltip(false);
                    }}
                  />
                </Flexbox>
              }
              customStyle={{ left: '160%' }}
              triangleLeft={90}
            >
              사진감정
            </Tooltip>
          </ProductLegitCTAButton>
        )}
        <CtaButton
          variant="contained"
          brandColor="black"
          fullWidth
          disabled={
            !product ||
            ((!isDup || !hasTarget) &&
              (PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] ===
                PRODUCT_STATUS['1'] ||
                PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] ===
                  PRODUCT_STATUS['3'] ||
                PRODUCT_STATUS[product.status as keyof typeof PRODUCT_STATUS] ===
                  PRODUCT_STATUS['2']))
          }
          onClick={handleClickCTAButton}
          customStyle={{
            height: 48,
            whiteSpace: 'nowrap',
            backgroundColor: palette.common.black
          }}
        >
          <Typography variant="body1" weight="bold" customStyle={{ color: palette.common.white }}>
            {platformId && (
              <Avatar
                src={
                  isCamelProduct || isCamelSeller
                    ? `https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/message-white.png`
                    : `https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platformId}.png`
                }
                customStyle={{ marginRight: 8 }}
              />
            )}
            {ctaText}
          </Typography>
          <Tooltip
            open={isOpenPriceCRMTooltip}
            brandColor="primary-highlight"
            disableShadow
            message={
              <Typography variant="body2" weight="bold">
                {commaNumber(getTenThousandUnitPrice(salePrice))}만원 내려간 지금이 바로 득템 기회🎁
              </Typography>
            }
            customStyle={{ marginTop: -19, marginLeft: -80 }}
          />
          <Tooltip
            open={isOpenBunJangTooltip}
            message={
              <Box onClick={handleClickBunJangTooltip}>
                <Typography
                  variant="body1"
                  weight="medium"
                  customStyle={{ color: palette.common.white }}
                >
                  번개장터 홈으로 이동했나요? 다시 클릭!
                </Typography>
                <Typography variant="body2" customStyle={{ color: palette.common.grey['60'] }}>
                  (번개장터 App이 켜져 있어야 해요)
                </Typography>
              </Box>
            }
            customStyle={{ marginTop: -27, marginLeft: -70, '&:after': { left: '80%' } }}
          />
        </CtaButton>
      </Wrapper>
      <Toast
        open={isOpenSoldOutToast}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, isOpenSoldOutToast: false }))}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
          죄송합니다. 판매 완료된 매물입니다!
        </Typography>
      </Toast>
      <Toast
        open={isOpenAddWishToast}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, isOpenAddWishToast: false }))}
      >
        <Flexbox gap={8} alignment="center" justifyContent="space-between">
          <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
            찜목록에 추가했어요!
          </Typography>
          <Typography
            variant="body1"
            weight="medium"
            customStyle={{
              color: palette.common.white,
              textDecoration: 'underline',
              whiteSpace: 'nowrap'
            }}
          >
            <Link href="/wishes">
              <a>찜목록 보기</a>
            </Link>
          </Typography>
        </Flexbox>
      </Toast>
      <Toast
        open={isOpenRemoveWishToast}
        onClose={() =>
          setOpenToast((prevState) => ({ ...prevState, isOpenRemoveWishToast: false }))
        }
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: palette.common.white }}>
          찜목록에서 삭제했어요.
        </Typography>
      </Toast>
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
            {relatedProducts?.content.map((relatedProduct) => (
              <ProductGridCard
                key={`related-product-card-${relatedProduct.id}`}
                product={relatedProduct}
                compact
                hideProductLabel
                hideAreaWithDateInfo
                name={attrProperty.productName.WISH_MODAL}
                isRound
                gap={8}
                source={attrProperty.productSource.PRODUCT_RELATED_LIST}
              />
            ))}
          </ProductCardList>
        </Box>
      </BottomSheet>
    </>
  );
}

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 92px;
  background-color: ${({ theme }) => theme.palette.common.white};
  padding: 20px;
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
  box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.1);
`;

const WishButton = styled.button<{ isWish: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  padding: 8px 12px;
  background-color: ${({ theme, isWish }) => isWish && theme.palette.primary.bgLight};
  border-radius: ${({ theme }) => theme.box.round['4']};
`;

const OnBoardingDim = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 1};
  background: rgba(0, 0, 0, 0.5);
`;

const OnBoardingWishButton = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 20px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.box.round['4']};
  background-color: ${({ theme }) => theme.palette.primary.bgLight};
  z-index: ${({ theme: { zIndex } }) => zIndex.button + 1};
`;

const ProductCardList = styled.div`
  margin: 0 -20px;
  padding: 0 20px;
  overflow-x: auto;
  display: grid;
  grid-auto-flow: column;

  grid-auto-columns: 120px;
  column-gap: 8px;
`;

const ProductLegitCTAButton = styled(CtaButton)`
  min-width: 81px;
  padding: 0;
  background: ${({ theme: { palette } }) => palette.primary.highlight};
  color: ${({ theme: { palette } }) => palette.primary.main};
`;

export default memo(ProductCTAButton);
