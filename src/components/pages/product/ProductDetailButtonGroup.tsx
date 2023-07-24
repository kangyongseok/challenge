import { useState } from 'react';

import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Avatar, Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
import {
  AppUpdateForChatDialog,
  AppUpdateForSafePayment,
  ProductPaymentMethodBottomSheet,
  PurchasingAgentBottomSheet
} from '@components/UI/organisms';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import { PRODUCT_SITE } from '@constants/product';
import { APP_BANNER } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import {
  checkAgent,
  getProductDetailUrl,
  getRandomNumber,
  needUpdateChatIOSVersion,
  needUpdateSafePaymentIOSVersion
} from '@utils/common';

import type { AppBanner } from '@typings/common';
import { productInquiryFormState, productInquiryReSendState } from '@recoil/productInquiry/atom';
import { loginBottomSheetState, prevChannelAlarmPopup } from '@recoil/common';
import useSession from '@hooks/useSession';
import useQueryProduct from '@hooks/useQueryProduct';
import useProductType from '@hooks/useProductType';
import useProductState from '@hooks/useProductState';
import useOsAlarm from '@hooks/useOsAlarm';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

function ProductDetailButtonGroup({ blockUserDialog }: { blockUserDialog: () => void }) {
  const {
    push,
    query: { id }
  } = useRouter();

  const [openAlreadyDialog, setOpenAlreadyDialog] = useState(false);
  const [pendingCreateChannel, setPendingCreateChannel] = useState(false);

  const { data: productDetail, mutateMetaInfo } = useQueryProduct();
  const { isLoggedIn, isLoggedInWithSMS, data: accessUser } = useSession();
  const { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog } = useOsAlarm();
  const { isAllOperatorProduct, isChannelProduct } = useProductType(
    productDetail?.product.sellerType
  );
  const {
    isHidden,
    isSoldOut,
    isReservation,
    isBlockedUser,
    isAdminBlockedUser,
    isDisabledState,
    isAlreadyOrder,
    isTargetProduct,
    isDuplicate,
    isPriceDown
  } = useProductState({ productDetail, product: productDetail?.product });

  const toastStack = useToastStack();

  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPurchasingAgentBottomSheet, setOpenPurchasingAgentBottomSheet] = useState(false);
  const [openPaymentMethodBottomSheet, setOpenPaymentMethodBottomSheet] = useState(false);

  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const prevChannelAlarm = useRecoilValue(prevChannelAlarmPopup);
  const resetProductInquiryFormState = useResetRecoilState(productInquiryFormState);
  const resetProductInquiryReSendState = useResetRecoilState(productInquiryReSendState);
  const { mutate: mutateCreateChannel, isLoading: isLoadingMutateCreateChannel } =
    useMutationCreateChannel();

  const platformId =
    (productDetail?.product?.siteUrl?.hasImage && productDetail?.product?.siteUrl?.id) ||
    (productDetail?.product?.site?.hasImage && productDetail?.product?.site?.id) ||
    '';

  const logEventProductDetailAtt = ({
    key,
    att,
    productId,
    channelId
  }: {
    key: string;
    att?: 'CHANNEL' | 'ORDER' | 'CPPRICELOW' | 'CPSAME' | 'REDIRECT' | 'OPERATOR';
    productId?: number;
    channelId?: number;
  }) => {
    if (!productDetail?.product) return;

    const conversionId =
      att === 'CHANNEL' ? Number(`${dayjs().format('YYMMDDHHmmss')}${getRandomNumber()}`) : 0;

    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};

    if (key === 'CLICK_PURCHASE') {
      productDetailAtt({
        key,
        product: productDetail?.product,
        source: productDetailSource || undefined,
        rest: { conversionId, att }
      });
    } else if (key === 'CLICK_CHANNEL_DETAIL') {
      productDetailAtt({
        key,
        product: productDetail?.product,
        rest: { productId, channelId }
      });
    } else {
      productDetailAtt({
        key,
        product: productDetail?.product
      });
    }
  };

  const handleClickPlatformProduct = () => {
    logEventProductDetailAtt({ key: attrKeys.products.CLICK_PURCHASE, att: 'REDIRECT' });

    if (isSoldOut) {
      toastStack({
        children: '판매완료 처리되었어요!'
      });
      return;
    }

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

    if (!isDuplicate || !isTargetProduct) {
      appBanner.counts.PURCHASE = (appBanner.counts.PURCHASE || 0) + 1;
      LocalStorage.set(APP_BANNER, appBanner);

      if (productDetail?.product?.site.id === PRODUCT_SITE.BUNJANG.id && checkAgent.isIOSApp()) {
        appBanner.counts.IOSBUNJANG = (appBanner.counts.IOSBUNJANG || 0) + 1;
        LocalStorage.set(APP_BANNER, appBanner);
      }
    }

    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    if (productDetail?.product)
      window.open(
        `${getProductDetailUrl({
          product: productDetail.product
        })}?redirect=1&userAgent=${userAgent}`,
        '_blank'
      );
  };

  const handleClickChannel = () => {
    if (!productDetail?.product || pendingCreateChannel || isLoadingMutateCreateChannel) return;

    const channelId = (productDetail.channels || []).find(
      (channel) => channel.userId === accessUser?.userId
    )?.id;

    logEventProductDetailAtt({ key: attrKeys.products.CLICK_PURCHASE, att: 'CHANNEL' });
    logEventProductDetailAtt({
      key: attrKeys.channel.CLICK_CHANNEL_DETAIL,
      productId: productDetail.product.id,
      channelId
    });

    if (isBlockedUser) {
      blockUserDialog();
      return;
    }

    if (isSoldOut) {
      toastStack({
        children: '판매완료 처리되었어요!'
      });
      return;
    }

    if (!isLoggedInWithSMS && !checkAgent.isMobileApp()) {
      logEvent(attrKeys.login.CLICK_NOLOGIN, {
        title: attrProperty.title.CHANNEL
      });

      resetProductInquiryFormState();
      resetProductInquiryReSendState();
      push(`/products/${id}/inquiry`);
      return;
    }

    const createChannelParams = {
      targetUserId: String(productDetail.roleSeller?.userId || 0),
      productId: String(productDetail.product.id),
      productTitle: productDetail.product.title,
      productImage: productDetail.product.imageThumbnail || productDetail.product.imageMain || ''
    };

    if (!isLoggedInWithSMS) {
      SessionStorage.set(sessionStorageKeys.savedCreateChannelParams, createChannelParams);
      setLoginBottomSheet({ open: true, returnUrl: '' });
      return;
    }

    if (needUpdateChatIOSVersion()) {
      setOpen(true);
      return;
    }

    checkOsAlarm();

    if (prevChannelAlarm && checkAgent.isIOSApp()) return;

    if (channelId) {
      push(`/channels/${channelId}`);
      return;
    }

    setPendingCreateChannel(true);

    mutateCreateChannel(
      { userId: String(accessUser?.userId || 0), ...createChannelParams },
      {
        onSettled() {
          setPendingCreateChannel(false);
          mutateMetaInfo({ isAddPurchaseCount: true });
        }
      }
    );
  };

  const handleClickSafePayment = () => {
    if (!productDetail?.product) return;

    if (!isAllOperatorProduct) {
      logEventProductDetailAtt({ key: attrKeys.products.CLICK_PURCHASE, att: 'ORDER' });

      logEvent(attrKeys.products.CLICK_ORDER_STATUS, {
        name: attrProperty.name.PRODUCT_DETAIL,
        title: attrProperty.title.PAYMENT_WAIT,
        data: {
          ...productDetail.product
        }
      });
    }

    if (isSoldOut) {
      toastStack({
        children: '판매완료 처리되었어요!'
      });
      return;
    }

    if (needUpdateSafePaymentIOSVersion()) {
      setOpenDialog(true);
      return;
    }

    if (isAlreadyOrder && checkAgent.isMobileApp()) {
      setOpenAlreadyDialog(true);
      return;
    }

    if (isAlreadyOrder) {
      toastStack({
        children: '이미 결제한 매물이에요.'
      });
      return;
    }

    if (isBlockedUser) {
      blockUserDialog();
      return;
    }

    if (!isLoggedInWithSMS) {
      if (openPurchasingAgentBottomSheet) {
        setOpenPurchasingAgentBottomSheet(false);
        setTimeout(() => {
          setLoginBottomSheet({
            open: true,
            returnUrl: '',
            mode: !checkAgent.isMobileApp() ? 'nonMember' : 'normal'
          });
        }, 500);
        return;
      }

      setOpenPaymentMethodBottomSheet(true);
      return;
    }

    SessionStorage.set(sessionStorageKeys.productDetailOrderEventProperties, {
      source: 'PRODUCT_DETAIL'
    });

    mutateMetaInfo({ isAddPurchaseCount: true });

    if (!isAllOperatorProduct) {
      setOpenPaymentMethodBottomSheet(true);
    } else {
      push({
        pathname: `/products/${id}/order`,
        query: {
          type: 2,
          includeLegit: LocalStorage.get('includeLegit')
        }
      });
    }
  };

  const handleClickDuplicateProduct = () => {
    if (!productDetail?.product) return;

    logEventProductDetailAtt({
      key: attrKeys.products.clickProductDetail,
      att: isPriceDown ? 'CPPRICELOW' : 'CPSAME'
    });

    if (productDetail?.product)
      push(getProductDetailUrl({ type: 'targetProduct', product: productDetail.product }));
  };

  const handleClickOperatorPayment = () => {
    if (!productDetail?.product) return;

    logEventProductDetailAtt({ key: attrKeys.products.CLICK_PURCHASE, att: 'OPERATOR' });

    logEvent(attrKeys.products.CLICK_OPERATOR_STATUS, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PAYMENT_WAIT,
      data: {
        ...productDetail.product
      }
    });
    setOpenPurchasingAgentBottomSheet(true);
  };

  if (isDisabledState) {
    return (
      <Button disabled size="xlarge" fullWidth variant="solid">
        {isAdminBlockedUser && '차단된 사용자입니다'}
        {isBlockedUser && '차단한 사용자입니다.'}
        {isHidden && '판매중지'}
        {isSoldOut && '판매완료'}
      </Button>
    );
  }

  if (isDuplicate && isTargetProduct) {
    return (
      <Button
        fullWidth
        size="xlarge"
        variant="solid"
        brandColor="black"
        onClick={handleClickDuplicateProduct}
        disabled={isDisabledState}
      >
        다시 올린 매물로 이동하기
      </Button>
    );
  }

  if (isReservation) {
    return (
      <>
        <Button
          fullWidth
          size="xlarge"
          variant="solid"
          brandColor="black"
          onClick={handleClickChannel}
          disabled={isDisabledState}
        >
          예약중
        </Button>
        <AppUpdateForChatDialog open={open} />
      </>
    );
  }

  if (isAllOperatorProduct) {
    return (
      <>
        <Flexbox alignment="center" gap={8} customStyle={{ width: '100%' }}>
          <Button
            fullWidth
            size="xlarge"
            variant="outline"
            brandColor="black"
            // onClick={handleClickPlatformProduct}
            onClick={handleClickChannel}
            disabled={isDisabledState}
            customStyle={{ padding: 12, minWidth: 63, maxWidth: 63 }}
          >
            채팅
          </Button>
          <Button
            fullWidth
            size="xlarge"
            variant="solid"
            brandColor="black"
            onClick={handleClickOperatorPayment}
            disabled={isDisabledState}
            customStyle={{ minWidth: 'fit-content', padding: 12 }}
          >
            안전결제
          </Button>
        </Flexbox>
        <AppUpdateForChatDialog open={open} />
        <AppUpdateForSafePayment open={openDialog} />
        <PurchasingAgentBottomSheet
          open={openPurchasingAgentBottomSheet}
          onClose={() => setOpenPurchasingAgentBottomSheet(false)}
          onClickPayment={handleClickSafePayment}
          logName={attrProperty.name.PRODUCT_DETAIL}
          logTitle={attrProperty.title.OPERATOR as 'OPERATOR'}
          orderInfoProps={productDetail?.orderInfo}
          isLegitType={productDetail?.product?.purchaseType === 2}
        />
      </>
    );
  }

  if (isChannelProduct) {
    return (
      <>
        <Flexbox alignment="center" gap={8} justifyContent="flex-end" customStyle={{ flexGrow: 1 }}>
          <Button
            fullWidth
            size="xlarge"
            variant="outline"
            brandColor="black"
            onClick={handleClickChannel}
            disabled={isDisabledState}
            customStyle={{ maxWidth: 64 }}
          >
            {isLoggedIn ? '채팅' : '문의'}
          </Button>
          <Button
            fullWidth
            size="xlarge"
            variant="solid"
            brandColor="black"
            onClick={handleClickSafePayment}
            disabled={isDisabledState}
          >
            안전결제
          </Button>
        </Flexbox>
        <AppUpdateForChatDialog open={open} />
        <AppUpdateForSafePayment open={openDialog} />
        <ProductPaymentMethodBottomSheet
          open={openPaymentMethodBottomSheet}
          onClose={() => setOpenPaymentMethodBottomSheet(false)}
          orderInfo={productDetail?.orderInfo}
          attributes={{
            name: attrProperty.name.PRODUCT_DETAIL,
            title: attrProperty.title.ORDER
          }}
        />
      </>
    );
  }

  return (
    <>
      <Button
        size="xlarge"
        fullWidth
        variant="solid"
        brandColor="black"
        onClick={handleClickPlatformProduct}
        disabled={isDisabledState}
      >
        <Flexbox gap={6} alignment="center">
          {platformId && (
            <Avatar
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platformId}.png`}
              alt="Platform Logo Img"
              width={16}
            />
          )}
          판매글로 이동
        </Flexbox>
      </Button>
      {isAlreadyOrder && (
        <Dialog open={openAlreadyDialog} onClose={() => setOpenAlreadyDialog(false)}>
          <Typography variant="h3" weight="bold" textAlign="center">
            이미 거래 중인 매물이에요.
          </Typography>
          <Typography
            variant="h4"
            textAlign="center"
            customStyle={{
              marginTop: 8
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
              onClick={handleClickChannel}
            >
              채팅하기
            </Button>
            <Button
              variant="ghost"
              brandColor="black"
              size="large"
              fullWidth
              onClick={() => setOpenAlreadyDialog(false)}
            >
              취소
            </Button>
          </Flexbox>
        </Dialog>
      )}
      <AppUpdateForChatDialog open={open} />
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
    </>
  );
}

export default ProductDetailButtonGroup;
