import { useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import amplitude from 'amplitude-js';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Avatar, Button, Flexbox, Typography } from '@mrcamelhub/camel-ui';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';
import { AppUpdateForChatDialog, AppUpdateForSafePayment } from '@components/UI/organisms';

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
import { loginBottomSheetState, prevChannelAlarmPopup } from '@recoil/common';
import useQueryProduct from '@hooks/useQueryProduct';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
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
  const { data: accessUser } = useQueryAccessUser();
  const { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog } = useOsAlarm();
  const { isAllOperatorProduct, isChannelProduct, isOperatorC2CProduct } = useProductType(
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

  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const prevChannelAlarm = useRecoilValue(prevChannelAlarmPopup);

  const { mutate: mutateCreateChannel, isLoading: isLoadingMutateCreateChannel } =
    useMutationCreateChannel();

  const platformId =
    (productDetail?.product?.siteUrl?.hasImage && productDetail?.product?.siteUrl?.id) ||
    (productDetail?.product?.site?.hasImage && productDetail?.product?.site?.id) ||
    '';

  const logEventProductDetailAtt = ({
    key,
    att
  }: {
    key: string;
    att?: 'CHANNEL' | 'ORDER' | 'CPPRICELOW' | 'CPSAME' | 'REDIRECT';
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

    logEventProductDetailAtt({ key: attrKeys.products.CLICK_PURCHASE, att: 'CHANNEL' });
    logEventProductDetailAtt({ key: attrKeys.channel.CLICK_CHANNEL_DETAIL });

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

    const createChannelParams = {
      targetUserId: String(productDetail.roleSeller?.userId || 0),
      productId: String(productDetail.product.id),
      productTitle: productDetail.product.title,
      productImage: productDetail.product.imageThumbnail || productDetail.product.imageMain || ''
    };

    const channelId = (productDetail.channels || []).find(
      (channel) => channel.userId === accessUser?.userId
    )?.id;

    if (!accessUser) {
      SessionStorage.set(sessionStorageKeys.savedCreateChannelParams, createChannelParams);
      // push({ pathname: '/login' });
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
      { userId: String(accessUser.userId || 0), ...createChannelParams },
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

    logEventProductDetailAtt({ key: attrKeys.products.CLICK_PURCHASE, att: 'ORDER' });

    logEvent(attrKeys.products.CLICK_ORDER_STATUS, {
      name: attrProperty.name.PRODUCT_DETAIL,
      title: attrProperty.title.PAYMENT_WAIT,
      data: {
        ...productDetail.product
      }
    });

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

    if (isAlreadyOrder) {
      setOpenAlreadyDialog(true);
      return;
    }

    if (isBlockedUser) {
      blockUserDialog();
      return;
    }

    SessionStorage.set(sessionStorageKeys.productDetailOrderEventProperties, {
      source: 'PRODUCT_DETAIL'
    });

    mutateMetaInfo({ isAddPurchaseCount: true });
    push(`/products/${id}/order`);
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

  // const handleClickOpenReservation = () => {
  //   setExhibitionOpen(true);
  // };

  // const handleClickOpenAlarm = () => {
  //   mutate(
  //     {
  //       deviceId,
  //       surveyId: 7,
  //       answer: 0,
  //       options: ''
  //     },
  //     {
  //       onSuccess() {
  //         setExhibitionOpen(false);
  //         LocalStorage.set(IS_CAMEL_BUTLER_RESERVATION, true);
  //         setReservation(true);
  //       }
  //     }
  //   );
  // };

  // useEffect(() => {
  //   if (LocalStorage.get(IS_CAMEL_BUTLER_RESERVATION)) {
  //     setReservation(true);
  //   }
  // }, []);

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

  // if (isCamelButlerProduct) {
  //   return (
  //     <>
  //       <Button
  //         fullWidth
  //         size="xlarge"
  //         variant="solid"
  //         brandColor="black"
  //         onClick={handleClickOpenReservation}
  //         disabled={isReservationDisabled}
  //       >
  //         {isReservationDisabled ? '알림 신청완료' : '오픈 알림받기'}
  //       </Button>
  //       {isCamelButlerProduct && (
  //         <Dialog open={exhibitionOpen} onClose={() => setExhibitionOpen(false)}>
  //           <Image
  //             height={114}
  //             src={getImageResizePath({
  //               imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/chanel_exhibitions.png`,
  //               h: 114
  //             })}
  //             alt="기획전 오픈알림 샤넬 커밍순"
  //             disableAspectRatio
  //           />
  //           <Typography weight="bold" variant="h3" customStyle={{ marginTop: 8 }}>
  //             기획전이 오픈되면 알려드릴까요?
  //           </Typography>
  //           <Button
  //             fullWidth
  //             size="xlarge"
  //             variant="solid"
  //             brandColor="primary"
  //             customStyle={{ marginTop: 32 }}
  //             onClick={handleClickOpenAlarm}
  //           >
  //             오픈 알림받기
  //           </Button>
  //         </Dialog>
  //       )}
  //     </>
  //   );
  // }

  if (isAllOperatorProduct) {
    return (
      <>
        <Flexbox alignment="center" gap={8} customStyle={{ width: '100%' }}>
          {!isOperatorC2CProduct && (
            <Button
              fullWidth
              size="xlarge"
              variant="outline"
              brandColor="black"
              // onClick={handleClickPlatformProduct}
              onClick={handleClickChannel}
              disabled={isDisabledState}
              customStyle={{ padding: 12, minWidth: 90 }}
            >
              구매문의
            </Button>
          )}
          <Button
            fullWidth
            size="xlarge"
            variant="solid"
            brandColor="black"
            onClick={handleClickSafePayment}
            disabled={isDisabledState}
            customStyle={{ minWidth: 'fit-content', padding: 12 }}
          >
            구매대행 요청
          </Button>
        </Flexbox>
        <AppUpdateForChatDialog open={open} />
        <AppUpdateForSafePayment open={openDialog} />
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
            채팅
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
