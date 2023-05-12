import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import type {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  UseMutateFunction
} from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import type { BaseButtonProps } from '@mrcamelhub/camel-ui/dist/src/components/Button';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  Flexbox,
  Icon,
  Tooltip,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { OnBoardingSpotlight, SafePaymentGuideDialog } from '@components/UI/organisms';

import type { UserRoleSeller } from '@dto/user';
import type { ProductOffer } from '@dto/productOffer';
import type { Product, ProductDetail } from '@dto/product';
import type { Channel } from '@dto/channel';

import UserTraceRecord from '@library/userTraceRecord';
import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import { PRODUCT_SITE, productStatusCode } from '@constants/product';
import { APP_BANNER, SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE } from '@constants/localStorage';
import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import {
  checkAgent,
  commaNumber,
  getProductDetailUrl,
  getRandomNumber,
  isExtendedLayoutIOSVersion,
  needUpdateChatIOSVersion,
  needUpdateSafePaymentIOSVersion
} from '@utils/common';

import type { AppBanner } from '@typings/common';
import {
  dialogState,
  loginBottomSheetState,
  prevChannelAlarmPopup,
  userOnBoardingTriggerState
} from '@recoil/common';
import type { MetaInfoMutateParams } from '@hooks/useQueryProduct';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useOsAlarm from '@hooks/useOsAlarm';
import useMutationUserBlock from '@hooks/useMutationUserBlock';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

interface ProductCTAButtonProps {
  product?: Product;
  channels?: Channel[];
  roleSeller?: UserRoleSeller | null;
  isBlockedUser: boolean;
  isAdminBlockedUser: boolean;
  isDup: boolean;
  hasTarget: boolean;
  hasOrder?: boolean;
  isPriceCrm: boolean;
  salePrice: number;
  isPriceDown?: boolean;
  paymentsTest?: boolean;
  isProductLegit?: boolean;
  offers?: ProductOffer[];
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
  isAdminBlockedUser,
  isDup,
  hasTarget,
  hasOrder,
  isPriceCrm,
  salePrice,
  isPriceDown,
  onClickSMS,
  mutateMetaInfo,
  refetch,
  offers
}: ProductCTAButtonProps) {
  const {
    push,
    query: { id }
  } = useRouter();

  const {
    theme: {
      palette: { primary, common },
      zIndex
    }
  } = useTheme();

  const toastStack = useToastStack();

  const [open, setOpen] = useState(false);

  const setDialogState = useSetRecoilState(dialogState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const prevChannelAlarm = useRecoilValue(prevChannelAlarmPopup);
  const [
    {
      productWish: { complete: productWishComplete },
      productPriceOffer: { complete }
    },
    setUserOnBoardingTriggerState
  ] = useRecoilState(userOnBoardingTriggerState);

  const { data: accessUser } = useQueryAccessUser();
  const setOsAlarm = useOsAlarm();

  const {
    unblock: { mutate: mutateUnblock, isLoading: isLoadingMutateUnblock }
  } = useMutationUserBlock();
  const { mutate: mutateCreateChannel, isLoading: isLoadingMutateCreateChannel } =
    useMutationCreateChannel();

  const [{ isOpenPriceCRMTooltip, isOpenBunJangTooltip }, setOpenTooltip] = useState({
    isOpenPriceCRMTooltip: isPriceCrm,
    isOpenBunJangTooltip: false
  });
  const [pendingCreateChannel, setPendingCreateChannel] = useState(false);
  const [openAlreadyHasOrderDialog, setOpenAlreadyHasOrderDialog] = useState(false);
  const [openSafePaymentGuideDialog, setOpenSafePaymentGuideDialog] = useState(false);

  const [isPossibleOffer, setIsPossibleOffer] = useState(false);
  const [hasOffer, setHasOffer] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<ProductOffer | null | undefined>(null);
  const [openPriceOfferOnBoarding, setOpenPriceOfferOnBoarding] = useState(false);

  const priceOfferAreaRef = useRef<HTMLDivElement>(null);

  const {
    isCamelProduct,
    isCamelSelfSeller,
    isCamelSeller,
    isNormalSeller,
    isSoldOut,
    isReserving,
    isHiding,
    platformId,
    isOperatorProduct,
    isOperatorB2CProduct,
    isOperatorC2CProduct,
    isChannelSellerType,
    isCrawlingProduct,
    isAllOperatorType
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
        '',
      isOperatorProduct: product && product.sellerType === productSellerType.operatorProduct,
      isOperatorB2CProduct: product && product.sellerType === productSellerType.operatorB2CProduct,
      isOperatorC2CProduct: product && product.sellerType === productSellerType.operatorC2CProduct,
      isChannelSellerType: [1, 2, 3].includes(product?.sellerType || NaN),
      isAllOperatorType: [5, 6, 7].includes(product?.sellerType || NaN),
      isCrawlingProduct: product && product.sellerType === productSellerType.collection
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

    if (isAdminBlockedUser) return { ctaText: '차단된 사용자입니다.', ctaBrandColor: 'gray' };
    if (isBlockedUser) return { ctaText: '차단한 사용자입니다.', ctaBrandColor: 'gray' };

    if (isDup && hasTarget) return { ctaText: '다시 올린 매물로 이동하기', ctaBrandColor: 'black' };

    if (isReserving) return { ctaText: '예약중', ctaBrandColor: 'black' };

    if (isHiding) return { ctaText: '판매중지', ctaBrandColor: 'black' };

    if (isSoldOut) return { ctaText: '판매완료', ctaBrandColor: 'black' };

    if (isOperatorC2CProduct || isOperatorProduct) {
      return { ctaText: '보러가기', ctaBrandColor: 'black' };
    }

    if (isChannelSellerType) return { ctaText: '채팅', ctaBrandColor: 'black' };

    if (isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller)
      return { ctaText: '판매자와 문자하기', ctaBrandColor: 'black' };

    if (isCrawlingProduct) return { ctaText: '판매글로 이동', ctaBrandColor: 'black' };

    return { ctaText: '', ctaBrandColor: 'white' };
  }, [
    product,
    isAdminBlockedUser,
    isBlockedUser,
    isDup,
    hasTarget,
    isReserving,
    isHiding,
    isSoldOut,
    isOperatorC2CProduct,
    isOperatorProduct,
    isChannelSellerType,
    isCamelProduct,
    isCamelSeller,
    isCamelSelfSeller,
    isNormalSeller,
    isCrawlingProduct
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

  const attParser = () => {
    if (isChannelSellerType) return 'CHANNEL';
    if (
      product?.sellerType === productSellerType.collection ||
      isOperatorC2CProduct ||
      isOperatorProduct
    )
      return 'REDIRECT';
    if (product?.sellerType === productSellerType.certification) return 'SMS';
    return '';
  };

  const pageMovePlatform = () => {
    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    if (product)
      window.open(
        `${getProductDetailUrl({ product })}?redirect=1&userAgent=${userAgent}`,
        '_blank'
      );
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
            textAlign="center"
            customStyle={{ minWidth: 270, padding: '12px 0' }}
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

                toastStack({
                  children: `${product.productSeller.name}님을 차단 해제했어요.`
                });
              }
            });
          }
        }
      });

      return;
    }

    if (isOperatorC2CProduct) {
      pageMovePlatform();
      return;
    }

    // roleSeller.userId 존재하면 카멜 판매자로 채팅 가능
    // sellerType === 5 인경우 채팅 가능 (외부 플랫폼 판매자)
    if (isChannelSellerType) {
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
        targetUserId: String(roleSeller?.userId || 0),
        productId: String(product.id),
        productTitle: product.title,
        productImage: product.imageThumbnail || product.imageMain || ''
      };

      const channelId = (channels || []).find(
        (channel) => channel.userId === accessUser?.userId
      )?.id;

      if (!accessUser) {
        SessionStorage.set(sessionStorageKeys.savedCreateChannelParams, createChannelParams);
        // push({ pathname: '/login' });
        setLoginBottomSheet({ open: true, returnUrl: '' });
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

      setOsAlarm();

      if (prevChannelAlarm && checkAgent.isIOSApp()) return;

      if (channelId) {
        UserTraceRecord.setExitWishChannel();
        push(`/channels/${channelId}`);

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
      toastStack({
        children: '죄송합니다. 판매 완료된 매물입니다!'
      });

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

    pageMovePlatform();
  };

  const handleClickBunJangTooltip = () => {
    appBanner.counts.IOSBUNJANG = (appBanner.counts.IOSBUNJANG || 0) + 1;
    LocalStorage.set(APP_BANNER, appBanner);
    setOpenTooltip((prevState) => ({ ...prevState, isOpenBunJangTooltip: false }));
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

    if (needUpdateSafePaymentIOSVersion()) {
      setDialogState({
        type: 'requiredAppUpdateForSafePayment',
        customStyleTitle: { minWidth: 269 },
        secondButtonAction: () => {
          if (
            window.webkit &&
            window.webkit.messageHandlers &&
            window.webkit.messageHandlers.callExecuteApp
          )
            window.webkit.messageHandlers.callExecuteApp.postMessage(
              'itms-apps://itunes.apple.com/app/id1541101835'
            );
        }
      });

      return;
    }

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
                toastStack({
                  children: `${product.productSeller.name}님을 차단 해제했어요.`
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

  const handleClickTodayHide = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    LocalStorage.set(SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE, dayjs().format('YYYY-MM-DD'));
    setOpen(false);
  };

  const handleClickSafePaymentFreeBanner = () => {
    if (isAllOperatorType) return;

    logEvent(attrKeys.products.CLICK_BANNER, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.ORDER
    });

    setOpenSafePaymentGuideDialog((prevState) => !prevState);
  };

  const handleClickPriceOffer = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!product) return;

    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};

    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product,
      source: productDetailSource || undefined,
      rest: { att: 'OFFER' }
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
                toastStack({
                  children: `${product.productSeller.name}님을 차단 해제했어요.`
                });
              }
            });
          }
        }
      });

      return;
    }

    // roleSeller.userId 존재하면 카멜 판매자로 채팅 가능
    // sellerType === 5 인경우 채팅 가능 (외부 플랫폼 판매자)
    if (isChannelSellerType || isOperatorProduct) {
      // (roleSeller?.userId && roleSeller?.userId !== 111) || isCrawlingProduct 이전 조건
      const createChannelParams = {
        targetUserId: String(roleSeller?.userId || 0),
        productId: String(product.id),
        productTitle: product.title,
        productImage: product.imageThumbnail || product.imageMain || ''
      };

      const channelId = (channels || []).find(
        (channel) => channel.userId === accessUser?.userId
      )?.id;

      if (!accessUser) {
        SessionStorage.set(sessionStorageKeys.savedCreateChannelParams, createChannelParams);
        // push({ pathname: '/login' });
        setLoginBottomSheet({ open: true, returnUrl: '' });
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

      SessionStorage.set(sessionStorageKeys.productDetailOfferEventProperties, {
        source: 'PRODUCT_DETAIL'
      });

      if (channelId) {
        push({
          pathname: `/channels/${channelId}/priceOffer`,
          query: {
            from: 'productDetail'
          }
        });
        return;
      }

      setPendingCreateChannel(true);
      await mutateCreateChannel(
        { userId: String(accessUser.userId || 0), ...createChannelParams },
        {
          onSettled() {
            setPendingCreateChannel(false);
          }
        },
        undefined,
        (newChannelId?: number) => {
          if (newChannelId)
            push({
              pathname: `/channels/${newChannelId}/priceOffer`,
              query: {
                from: 'productDetail'
              }
            });
        },
        true
      );
    }
  };

  const handleClosePriceOfferOnBoarding = () => {
    setOpenPriceOfferOnBoarding(false);
    setUserOnBoardingTriggerState((prevState) => ({
      ...prevState,
      productPriceOffer: {
        complete: true,
        step: 1
      }
    }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!offers) return;

    const validOffers = offers.filter(({ status }) => [1, 2, 4].includes(status));

    setIsPossibleOffer(
      ['채팅', '보러가기'].includes(ctaText) &&
        validOffers.length < 3 &&
        !isAdminBlockedUser &&
        !isBlockedUser &&
        !isOperatorB2CProduct &&
        !isOperatorC2CProduct
    );
    setHasOffer(validOffers.length < 3 && offers.some(({ status }) => status === 0));
    setCurrentOffer(validOffers.find(({ status }) => status === 1));
  }, [
    offers,
    ctaText,
    isAdminBlockedUser,
    isBlockedUser,
    isOperatorProduct,
    isOperatorB2CProduct,
    isOperatorC2CProduct
  ]);

  useEffect(() => {
    if (checkAgent.isMobileApp() && productWishComplete && !complete && isPossibleOffer) {
      setOpenPriceOfferOnBoarding(true);
    } else if (!checkAgent.isMobileApp() && !complete && isPossibleOffer) {
      setOpenPriceOfferOnBoarding(true);
    }
  }, [complete, productWishComplete, isPossibleOffer]);

  if (!!accessUser && roleSeller?.userId === accessUser.userId) return null;

  return (
    <>
      {open &&
        (['채팅', '보러가기'].includes(ctaText) || (isAllOperatorType && !isDup && !hasTarget)) && (
          <Flexbox
            alignment="center"
            justifyContent="space-between"
            gap={4}
            onClick={handleClickSafePaymentFreeBanner}
            customStyle={{
              position: 'fixed',
              left: 0,
              bottom: `calc(76px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'})`,
              width: '100%',
              height: 44,
              padding: '12px 20px',
              backgroundColor: isAllOperatorType ? primary.light : common.ui20,
              zIndex: !openPriceOfferOnBoarding ? zIndex.button + 1 : 1
            }}
          >
            {isAllOperatorType && <Triangle />}
            <Flexbox
              gap={4}
              customStyle={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                justifyContent: isAllOperatorType ? 'center' : 'initial'
              }}
            >
              <Icon name="WonCircleFilled" width={20} height={20} color="uiWhite" />
              <Typography weight="medium" noWrap color="uiWhite">
                {isAllOperatorType
                  ? '수수료 없이, 카멜이 대신 구매해드려요.'
                  : '카멜은 안전결제 수수료 무료!'}
              </Typography>
            </Flexbox>
            {!isAllOperatorType && (
              <Box
                onClick={handleClickTodayHide}
                customStyle={{
                  minWidth: 'fit-content'
                }}
              >
                <Icon name="CloseOutlined" width={20} height={20} color="uiWhite" />
              </Box>
            )}
          </Flexbox>
        )}
      <Box
        customStyle={{
          minHeight: `calc(76px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'})`
        }}
      />
      <Wrapper>
        <OnBoardingSpotlight
          open={openPriceOfferOnBoarding}
          onClose={handleClosePriceOfferOnBoarding}
          targetRef={priceOfferAreaRef}
          customSpotlightPosition={{
            width: 4,
            left: -4
          }}
          customStyle={{
            borderRadius: 8
          }}
        />
        <Tooltip
          open={openPriceOfferOnBoarding}
          message="원하는 가격이 있다면 눈치 보지 말고 제안해보세요!"
          triangleLeft={20}
          customStyle={{
            top: 10,
            left: 125
          }}
        >
          <Flexbox
            ref={priceOfferAreaRef}
            direction="vertical"
            justifyContent="center"
            gap={2}
            customStyle={{
              width: 112,
              height: 48
            }}
          >
            {isPossibleOffer && !hasOffer && currentOffer ? (
              <Typography
                variant="h3"
                weight="bold"
                customStyle={{
                  fontSize: 20,
                  lineHeight: '26px',
                  color: primary.light
                }}
              >
                {commaNumber(getTenThousandUnitPrice(currentOffer?.price || 0))}만원
              </Typography>
            ) : (
              <Typography
                variant="h3"
                weight="bold"
                customStyle={{
                  fontSize: 20,
                  lineHeight: '26px'
                }}
              >
                {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
              </Typography>
            )}
            {isPossibleOffer &&
              !hasOffer &&
              !currentOffer &&
              !isOperatorB2CProduct &&
              !isOperatorC2CProduct && (
                <Typography
                  weight="medium"
                  onClick={handleClickPriceOffer}
                  customStyle={{
                    color: primary.light,
                    textDecorationLine: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  가격 제안하기
                </Typography>
              )}
            {isPossibleOffer && hasOffer && !currentOffer && (
              <Typography
                weight="medium"
                customStyle={{
                  color: common.ui60,
                  textDecorationLine: 'underline'
                }}
              >
                가격 제안됨
              </Typography>
            )}
            {isPossibleOffer && !hasOffer && currentOffer && (
              <Typography
                weight="medium"
                customStyle={{
                  color: common.ui60,
                  textDecorationLine: 'line-through'
                }}
              >
                {commaNumber(getTenThousandUnitPrice(product?.price || 0))}만원
              </Typography>
            )}
          </Flexbox>
        </Tooltip>
        <Flexbox
          gap={8}
          customStyle={{
            justifyContent: 'flex-end',
            flexGrow: 1
          }}
        >
          <Button
            variant={['채팅', '보러가기'].includes(ctaText) ? 'outline' : 'solid'}
            brandColor={ctaBrandColor}
            size="xlarge"
            fullWidth
            disabled={
              !product ||
              ((!isDup || !hasTarget) &&
                (product.status === productStatusCode.soldOut ||
                  product.status === productStatusCode.duplicate ||
                  product.status === productStatusCode.deleted)) ||
              isHiding
            }
            onClick={handleClickCTAButton}
            customStyle={{
              maxWidth: ['채팅'].includes(ctaText) ? 64 : undefined,
              gap: 0,
              whiteSpace: 'nowrap',
              paddingLeft: 12,
              paddingRight: 12,
              display: isOperatorB2CProduct ? 'none' : 'flex'
            }}
          >
            <Typography
              variant="h3"
              weight="medium"
              customStyle={{
                display: 'flex',
                alignItems: 'center',
                color: ['채팅', '보러가기'].includes(ctaText) ? undefined : common.uiWhite
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
                !isOperatorC2CProduct &&
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
                  {commaNumber(salePrice)}만원 내려간 지금이 바로 득템 기회🎁
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
          {(['채팅', '보러가기'].includes(ctaText) ||
            (isAllOperatorType && !isDup && !hasTarget)) && (
            <Button
              fullWidth
              variant="solid"
              brandColor="black"
              size="xlarge"
              onClick={handleClickSafePayment}
              customStyle={{
                paddingLeft: 12,
                paddingRight: 12,
                minWidth: isAllOperatorType ? 130 : 'auto'
              }}
            >
              {isAllOperatorType ? '구매대행 요청' : '안전결제'}
            </Button>
          )}
        </Flexbox>
      </Wrapper>
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
      <SafePaymentGuideDialog
        open={openSafePaymentGuideDialog}
        onClose={() => setOpenSafePaymentGuideDialog(false)}
      />
    </>
  );
}

const Wrapper = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-top: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line02};
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  padding: 12px 20px ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '12px'};
  z-index: ${({ theme: { zIndex } }) => zIndex.button};
`;

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-top: 10px solid
    ${({
      theme: {
        palette: { primary }
      }
    }) => primary.light};
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  position: absolute;
  bottom: -7px;
  right: 60px;
`;

export default ProductCTAButton;
