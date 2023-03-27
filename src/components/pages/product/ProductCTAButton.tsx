import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import type { BaseButtonProps } from 'mrcamel-ui/dist/components/Button';
import {
  Avatar,
  BottomSheet,
  Box,
  Button,
  Dialog,
  Flexbox,
  Icon,
  Tooltip,
  Typography,
  useTheme
} from 'mrcamel-ui';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  UseMutateFunction
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import { OnBoardingSpotlight } from '@components/UI/organisms';
import ProductGridCard from '@components/UI/molecules/ProductGridCard';

import type { UserRoleSeller } from '@dto/user';
import type { Product, ProductDetail } from '@dto/product';
import type { Channel } from '@dto/channel';

import UserTraceRecord from '@library/userTraceRecord';
import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedProducts } from '@api/product';

import { productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE, productStatusCode } from '@constants/product';
import {
  APP_BANNER,
  IS_DONE_WISH_ON_BOARDING,
  SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE
} from '@constants/localStorage';
import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { scrollDisable, scrollEnable } from '@utils/scroll';
import { getProductType, productDetailAtt } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import {
  checkAgent,
  commaNumber,
  getProductDetailUrl,
  getRandomNumber,
  isExtendedLayoutIOSVersion,
  needUpdateChatIOSVersion
} from '@utils/common';

import type { AppBanner } from '@typings/common';
import { dialogState, toastState } from '@recoil/common';
import type { MetaInfoMutateParams } from '@hooks/useQueryProduct';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMutationUserBlock from '@hooks/useMutationUserBlock';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

interface ProductCTAButtonProps {
  product?: Product;
  channels?: Channel[];
  roleSeller?: UserRoleSeller | null;
  isBlockedUser: boolean;
  isDup: boolean;
  hasTarget: boolean;
  hasOrder?: boolean;
  isPriceCrm: boolean;
  salePrice: number;
  isWish?: boolean;
  isPriceDown?: boolean;
  paymentsTest?: boolean;
  isProductLegit?: boolean;
  onClickWish: (isWish: boolean) => boolean;
  onClickSMS: ({
    siteId,
    sellerType,
    id,
    sellerPhoneNumber,
    conversionId
  }: {
    siteId?: number;
    sellerType?: number;
    id?: number;
    sellerPhoneNumber: string | null;
    conversionId?: number;
  }) => void;
  mutateMetaInfo: UseMutateFunction<
    ProductDetail | undefined,
    unknown,
    MetaInfoMutateParams,
    unknown
  >;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<ProductDetail, unknown>>;
}

function ProductCTAButton({
  product,
  channels,
  roleSeller,
  isBlockedUser,
  isDup,
  hasTarget,
  hasOrder,
  isPriceCrm,
  salePrice,
  isWish = false,
  isPriceDown,
  onClickWish,
  onClickSMS,
  mutateMetaInfo,
  refetch
}: ProductCTAButtonProps) {
  const {
    push,
    query: { id, source }
  } = useRouter();

  const {
    theme: {
      palette: { secondary, common },
      zIndex
    }
  } = useTheme();

  const [open, setOpen] = useState(false);

  const setToastState = useSetRecoilState(toastState);
  const setDialogState = useSetRecoilState(dialogState);

  const { data: accessUser } = useQueryAccessUser();
  const { data: relatedProducts } = useQuery(
    queryKeys.products.relatedProducts(Number(product?.id || 0)),
    () => fetchRelatedProducts(Number(product?.id || 0)),
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, enabled: !!product }
  );

  const {
    unblock: { mutate: mutateUnblock, isLoading: isLoadingMutateUnblock }
  } = useMutationUserBlock();
  const { mutate: mutateCreateChannel, isLoading: isLoadingMutateCreateChannel } =
    useMutationCreateChannel();

  const [isDoneWishOnBoarding, setIsDoneWishOnBoarding] = useState(true);
  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);
  const [{ isOpenPriceCRMTooltip, isOpenBunJangTooltip }, setOpenTooltip] = useState({
    isOpenPriceCRMTooltip: isPriceCrm,
    isOpenBunJangTooltip: false
  });
  const [pendingCreateChannel, setPendingCreateChannel] = useState(false);
  const [openAlreadyHasOrderDialog, setOpenAlreadyHasOrderDialog] = useState(false);

  const wishButtonRef = useRef<HTMLButtonElement>(null);

  const {
    isCamelProduct,
    isCamelSelfSeller,
    isCamelSeller,
    isNormalSeller,
    isSoldOut,
    isReserving,
    isHiding,
    platformId
  } = useMemo(
    () => ({
      isCamelProduct: product?.productSeller.site.id === PRODUCT_SITE.CAMEL.id,
      isCamelSelfSeller: product?.productSeller.site.id === PRODUCT_SITE.CAMELSELLER.id,
      isCamelSeller: product && product.sellerType === productSellerType.certification,
      isNormalSeller: product && product.sellerType === productSellerType.normal,
      isSoldOut: product && product.status === productStatusCode.soldOut,
      isReserving: product && product.status === productStatusCode.reservation,
      isHiding: product && product.status === productStatusCode.hidden,
      platformId:
        (product?.siteUrl?.hasImage && product?.siteUrl.id) ||
        (product?.site.hasImage && product?.site?.id) ||
        ''
    }),
    [product]
  );

  const {
    ctaText,
    ctaBrandColor
  }: { ctaText: string; ctaBrandColor: BaseButtonProps['brandColor'] } = useMemo(() => {
    const siteName =
      (product?.siteUrl.hasImage && product?.siteUrl.name) ||
      (product?.site.hasImage && product?.site.name) ||
      '';

    if (!product || !siteName) return { ctaText: '', ctaBrandColor: 'black' };

    if (isBlockedUser) return { ctaText: '차단한 사용자입니다.', ctaBrandColor: 'gray' };

    if (isDup && hasTarget) return { ctaText: '다시 올린 매물로 이동하기', ctaBrandColor: 'black' };

    if (isReserving) return { ctaText: '예약중', ctaBrandColor: 'black' };

    if (isHiding) return { ctaText: '판매중지', ctaBrandColor: 'black' };

    if (isSoldOut) return { ctaText: '판매완료', ctaBrandColor: 'black' };

    if (roleSeller?.userId) return { ctaText: '채팅하기', ctaBrandColor: 'black' };

    if (isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller)
      return { ctaText: '판매자와 문자하기', ctaBrandColor: 'black' };

    return { ctaText: '판매글로 이동', ctaBrandColor: 'black' };
  }, [
    product,
    isBlockedUser,
    isDup,
    hasTarget,
    isReserving,
    isHiding,
    isSoldOut,
    roleSeller?.userId,
    isCamelProduct,
    isCamelSeller,
    isCamelSelfSeller,
    isNormalSeller
  ]);

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

  const handleClickWish = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

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

    if (onClickWish(isWish)) {
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

  const attParser = () => {
    if (product?.sellerType === productSellerType.normal || roleSeller?.userId) return 'CHANNEL';
    if (product?.sellerType === productSellerType.collection) return 'REDIRECT';
    if (product?.sellerType === productSellerType.certification) return 'SMS';
    return '';
  };

  const handleClickCTAButton = async () => {
    if (isLoadingMutateCreateChannel || pendingCreateChannel || !product) return;
    let conversionId = 0;
    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};

    if (product.sellerType === productSellerType.normal) {
      conversionId = Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`);
    }

    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product,
      source: productDetailSource || undefined,
      rest: { conversionId, att: attParser() }
    });
    if (isBlockedUser) {
      setDialogState({
        type: 'unblockBlockedUser',
        content: (
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{ minWidth: 270, padding: '12px 0', textAlign: 'center' }}
          >
            회원님이 차단한 사용자에요.
            <br />
            차단을 해제할까요?
          </Typography>
        ),
        async firstButtonAction() {
          if (isLoadingMutateUnblock) return;

          if (roleSeller?.userId && !!product) {
            await mutateUnblock(roleSeller.userId, {
              onSuccess() {
                refetch();
                setToastState({
                  type: 'user',
                  status: 'unBlockWithRole',
                  params: { role: '판매자', userName: product.productSeller.name }
                });
              }
            });
          }
        }
      });

      return;
    }

    // roleSeller.userId 존재하면 카멜 판매자로 채팅 가능
    if (roleSeller?.userId) {
      productDetailAtt({
        key: attrKeys.channel.CLICK_CHANNEL_DETAIL,
        product
      });
      // logEvent(attrKeys.channel.CLICK_CHANNEL_DETAIL, {
      //   name: attrProperty.name.productDetail,
      //   sellerType: product.sellerType,
      //   productSellerId: product.productSeller.id,
      //   productSellerType: product.productSeller.type,
      //   productSellerAccount: product.productSeller.account
      // });

      const createChannelParams = {
        targetUserId: String(roleSeller.userId || 0),
        productId: String(product.id),
        productTitle: product.title,
        productImage: product.imageThumbnail || product.imageMain || ''
      };

      const channelId = (channels || []).find(
        (channel) => channel.userId === accessUser?.userId
      )?.id;

      if (!accessUser) {
        SessionStorage.set(sessionStorageKeys.savedCreateChannelParams, createChannelParams);
        push({ pathname: '/login' });

        return;
      }

      if (needUpdateChatIOSVersion()) {
        setDialogState({
          type: 'requiredAppUpdateForChat',
          customStyleTitle: { minWidth: 270 },
          disabledOnClose: true,
          secondButtonAction: () => {
            window.webkit?.messageHandlers?.callExecuteApp?.postMessage?.(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
          }
        });

        return;
      }

      if (channelId) {
        UserTraceRecord.setExitWishChannel();
        if (checkAgent.isIOSApp()) {
          window.webkit?.messageHandlers?.callChannel?.postMessage?.(`/channels/${channelId}`);
        } else {
          push(`/channels/${channelId}`);
        }

        return;
      }

      setPendingCreateChannel(true);
      await mutateCreateChannel(
        { userId: String(accessUser.userId || 0), ...createChannelParams },
        {
          onSettled() {
            setPendingCreateChannel(false);
          }
        }
      );

      return;
    }

    if (isSoldOut && !isReserving && (!isDup || !hasTarget)) {
      setToastState({ type: 'product', status: 'soldout' });

      return;
    }

    if (product && (isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller)) {
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
        key: attrKeys.products.clickProductDetail,
        product,
        rest: {
          att: isPriceDown ? 'CPPRICELOW' : 'CPSAME'
        }
      });
      if (product) push(getProductDetailUrl({ type: 'targetProduct', product }));
      return;
    }

    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    if (product)
      window.open(
        `${getProductDetailUrl({ product })}?redirect=1&userAgent=${userAgent}`,
        '_blank'
      );
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

  const handleClickSafePayment = () => {
    if (!product) return;

    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};

    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product,
      source: productDetailSource || undefined,
      rest: { att: 'ORDER' }
    });

    logEvent(attrKeys.products.CLICK_ORDER_STATUS, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PAYMENT_WAIT,
      data: {
        ...product
      }
    });

    if (hasOrder) {
      setOpenAlreadyHasOrderDialog(true);
      return;
    }
    if (isBlockedUser) {
      setDialogState({
        type: 'unblockBlockedUser',
        content: (
          <Typography
            variant="h3"
            weight="bold"
            customStyle={{ minWidth: 270, padding: '12px 0', textAlign: 'center' }}
          >
            회원님이 차단한 사용자에요.
            <br />
            차단을 해제할까요?
          </Typography>
        ),
        async firstButtonAction() {
          if (isLoadingMutateUnblock) return;

          if (roleSeller?.userId && !!product) {
            await mutateUnblock(roleSeller.userId, {
              onSuccess() {
                refetch();
                setToastState({
                  type: 'user',
                  status: 'unBlockWithRole',
                  params: { role: '판매자', userName: product.productSeller.name }
                });
              }
            });
          }
        }
      });

      return;
    }

    SessionStorage.set(sessionStorageKeys.productDetailOrderEventProperties, {
      source: 'PRODUCT_DETAIL'
    });

    push(`/products/${id}/order`);
  };

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.SWIP_X_CARD, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.WISH_MODAL
    });
  }, 300);

  const handleClickTodayHide = () => {
    LocalStorage.set(SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
  };

  useEffect(() => {
    const hideDate = LocalStorage.get<string>(SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE);

    if (hideDate) {
      if (dayjs().diff(hideDate, 'days') >= 1) {
        LocalStorage.remove(SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE);
        setOpen(true);
      }
    } else {
      setOpen(true);
    }
  }, []);

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

  if (!!accessUser && roleSeller?.userId === accessUser.userId) return null;

  return (
    <>
      {open && ['채팅하기'].includes(ctaText) && (
        <Flexbox
          alignment="center"
          justifyContent="space-between"
          gap={4}
          onClick={handleClickTodayHide}
          customStyle={{
            position: 'fixed',
            left: 0,
            bottom: `calc(76px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'})`,
            width: '100%',
            height: 44,
            padding: '12px 20px',
            backgroundColor: common.ui20,
            zIndex: zIndex.button
          }}
        >
          <Flexbox
            gap={4}
            customStyle={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <Icon name="WonCircleFilled" width={20} height={20} color={common.uiWhite} />
            <Typography
              weight="medium"
              noWrap
              customStyle={{
                color: common.uiWhite
              }}
            >
              지금 카멜은 안전결제 수수료 무료!
            </Typography>
          </Flexbox>
          <Box
            customStyle={{
              minWidth: 'fit-content'
            }}
          >
            <Icon name="CloseOutlined" width={20} height={20} color={common.uiWhite} />
          </Box>
        </Flexbox>
      )}
      <Box
        customStyle={{
          minHeight: `calc(76px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'})`
        }}
      />
      <Wrapper>
        {!isBlockedUser && (
          <>
            <Tooltip
              open={!isDoneWishOnBoarding}
              variant="ghost"
              brandColor="primary"
              message={
                <Typography variant="body2" weight="bold">
                  찜하면 가격이 내려갔을 때 알려드려요!🛎
                </Typography>
              }
              triangleLeft={18}
              customStyle={{ left: 110, bottom: 5, top: 'auto', zIndex: 1000000 }}
            >
              <WishButton
                ref={wishButtonRef}
                onClick={handleClickWish}
                isWish={isWish}
                disabled={!product || !ctaText}
              >
                {isWish ? (
                  <Icon name="HeartFilled" color={secondary.red.main} width={24} height={24} />
                ) : (
                  <Icon name="HeartOutlined" width={24} height={24} />
                )}
              </WishButton>
            </Tooltip>
            <OnBoardingSpotlight
              targetRef={wishButtonRef}
              open={!isDoneWishOnBoarding}
              onClose={handleClickWishOnBoarding}
              customStyle={{
                borderRadius: 8
              }}
            />
          </>
        )}
        <Button
          variant={['채팅하기'].includes(ctaText) ? 'ghost' : 'solid'}
          brandColor={ctaBrandColor}
          size="xlarge"
          fullWidth
          disabled={
            !product ||
            ((!isDup || !hasTarget) &&
              (product.status === productStatusCode.soldOut ||
                product.status === productStatusCode.duplicate ||
                product.status === productStatusCode.deleted)) ||
            isHiding ||
            isLoadingMutateCreateChannel ||
            pendingCreateChannel
          }
          onClick={handleClickCTAButton}
          customStyle={{
            maxWidth: ['채팅하기'].includes(ctaText) ? 93 : undefined,
            gap: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <Typography
            variant="h3"
            weight="medium"
            customStyle={{
              display: 'flex',
              alignItems: 'center',
              color: ['채팅하기'].includes(ctaText) ? undefined : common.uiWhite
            }}
          >
            {!roleSeller &&
              (isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller) && (
                <Icon
                  name="MessageOutlined"
                  width={16}
                  customStyle={{
                    marginRight: 6
                  }}
                />
              )}
            {!roleSeller &&
              !isCamelProduct &&
              !isCamelSeller &&
              !isCamelSelfSeller &&
              !isNormalSeller &&
              platformId && (
                <Avatar
                  src={
                    isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller
                      ? `https://${process.env.IMAGE_DOMAIN}/assets/images/new_icon/message-white.png`
                      : `https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platformId}.png`
                  }
                  alt="Platform Logo Img"
                  width={16}
                  customStyle={{
                    marginRight: 6
                  }}
                />
              )}
            {ctaText}
          </Typography>
          <Tooltip
            open={isOpenPriceCRMTooltip}
            variant="ghost"
            brandColor="primary"
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
                <Typography variant="body1" weight="medium" customStyle={{ color: common.cmnW }}>
                  번개장터 홈으로 이동했나요? 다시 클릭!
                </Typography>
                <Typography variant="body2" customStyle={{ color: common.ui60 }}>
                  (번개장터 App이 켜져 있어야 해요)
                </Typography>
              </Box>
            }
            customStyle={{ marginTop: -27, marginLeft: -70, '&:after': { left: '80%' } }}
          />
        </Button>
        {['채팅하기'].includes(ctaText) && (
          <Button
            fullWidth
            variant="solid"
            brandColor="black"
            size="xlarge"
            onClick={handleClickSafePayment}
          >
            안전하게 결제하기
          </Button>
        )}
      </Wrapper>
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
      <Dialog
        open={openAlreadyHasOrderDialog}
        onClose={() => setOpenAlreadyHasOrderDialog(false)}
        fullWidth
        customStyle={{
          maxWidth: 311,
          padding: '32px 20px 20px'
        }}
      >
        <Typography
          variant="h3"
          weight="bold"
          customStyle={{
            textAlign: 'center'
          }}
        >
          이미 거래 중인 매물이에요.
        </Typography>
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 8,
            textAlign: 'center'
          }}
        >
          채팅방에서 거래내역을 확인해주세요.
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 32
          }}
        >
          <Button
            variant="solid"
            brandColor="black"
            size="large"
            fullWidth
            onClick={handleClickCTAButton}
          >
            채팅하기
          </Button>
          <Button
            variant="ghost"
            brandColor="black"
            size="large"
            fullWidth
            onClick={() => setOpenAlreadyHasOrderDialog(false)}
          >
            취소
          </Button>
        </Flexbox>
      </Dialog>
    </>
  );
}

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  padding: 12px 20px ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '12px'};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

const WishButton = styled.button<{ isWish: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  padding: 10px;
  background-color: ${({
    theme: {
      palette: { primary }
    },
    isWish
  }) => isWish && primary.bgLight};
  border-radius: ${({ theme }) => theme.box.round['4']};
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

export default memo(ProductCTAButton);
