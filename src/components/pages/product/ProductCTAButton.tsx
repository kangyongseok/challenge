import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
// import dayjs from 'dayjs';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import Dialog from '@mrcamelhub/camel-ui-dialog';
import { Box, Button, Flexbox, Tooltip, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import {
  AppUpdateForChatDialog,
  OnBoardingSpotlight
  // SafePaymentGuideDialog
} from '@components/UI/organisms';

import type { ProductOffer } from '@dto/productOffer';

import SessionStorage from '@library/sessionStorage';
// import LocalStorage from '@library/localStorage';
// import { logEvent } from '@library/amplitude';

import sessionStorageKeys from '@constants/sessionStorageKeys';
// import { SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE } from '@constants/localStorage';
import { IOS_SAFE_AREA_BOTTOM } from '@constants/common';
// import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { productDetailAtt } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import {
  checkAgent,
  commaNumber,
  getProductDetailUrl,
  isExtendedLayoutIOSVersion,
  needUpdateChatIOSVersion
} from '@utils/common';

import { loginBottomSheetState, userOnBoardingTriggerState } from '@recoil/common';
import useQueryProduct from '@hooks/useQueryProduct';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductType from '@hooks/useProductType';
import useProductState from '@hooks/useProductState';
import useMutationUserBlock from '@hooks/useMutationUserBlock';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

import ProductDetailButtonGroup from './ProductDetailButtonGroup';

function ProductCTAButton() {
  const { push } = useRouter();

  // const {
  //   theme: {
  //     palette: { common }
  //   }
  // } = useTheme();

  const toastStack = useToastStack();

  // const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const [
    {
      productWish: { complete: productWishComplete },
      productPriceOffer: { complete }
    },
    setUserOnBoardingTriggerState
  ] = useRecoilState(userOnBoardingTriggerState);

  const { data: accessUser } = useQueryAccessUser();
  const { data: productDetail, refetch } = useQueryProduct(); // mutateMetaInfo

  const { isOperatorProduct, isChannelProduct, isOperatorC2CProduct } = useProductType(
    productDetail?.product.sellerType
  );

  const {
    isDuplicate,
    isBlockedUser,
    isTargetProduct,
    // isSafePayment,
    isPriceOffer,
    isSoldOut,
    isDisabledState
  } = useProductState({ productDetail, product: productDetail?.product });

  const {
    unblock: { mutate: mutateUnblock, isLoading: isLoadingMutateUnblock }
  } = useMutationUserBlock();
  const { mutate: mutateCreateChannel } = useMutationCreateChannel(); // isLoadingMutateCreateChannel

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setPendingCreateChannel] = useState(false); // pendingCreateChannel
  // const [openSafePaymentGuideDialog, setOpenSafePaymentGuideDialog] = useState(false);

  const [isPossibleOffer, setIsPossibleOffer] = useState(false);
  const [hasOffer, setHasOffer] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<ProductOffer | null | undefined>(null);
  const [openPriceOfferOnBoarding, setOpenPriceOfferOnBoarding] = useState(false);
  const [openChatRequiredUpdateDialog, setOpenChatRequiredUpdateDialog] = useState(false);

  const priceOfferAreaRef = useRef<HTMLDivElement>(null);

  const pageMovePlatform = () => {
    if (!productDetail?.product) return;
    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};
    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product: productDetail?.product,
      source: productDetailSource || undefined,
      rest: { att: 'REDIRECT' }
    });

    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    if (productDetail.product)
      window.open(
        `${getProductDetailUrl({
          product: productDetail.product
        })}?redirect=1&userAgent=${userAgent}`,
        '_blank'
      );
  };

  // const handleClickSafePaymentFreeBanner = () => {
  //   if (isAllOperatorProduct) return;

  //   logEvent(attrKeys.products.CLICK_BANNER, {
  //     name: attrProperty.name.PRODUCT_DETAIL,
  //     title: attrProperty.title.ORDER
  //   });

  //   setOpenSafePaymentGuideDialog((prevState) => !prevState);
  // };

  const handleClickPriceOffer = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (!productDetail?.product) return;

    const { source: productDetailSource } =
      SessionStorage.get<{ source?: string }>(sessionStorageKeys.productDetailEventProperties) ||
      {};

    productDetailAtt({
      key: attrKeys.products.CLICK_PURCHASE,
      product: productDetail?.product,
      source: productDetailSource || undefined,
      rest: { att: 'OFFER' }
    });

    if (isBlockedUser) {
      setOpenDialog(true);
      return;
    }

    // roleSeller.userId 존재하면 카멜 판매자로 채팅 가능
    // sellerType === 5 인경우 채팅 가능 (외부 플랫폼 판매자)
    if (isChannelProduct || isOperatorProduct) {
      // (roleSeller?.userId && roleSeller?.userId !== 111) || isCrawlingProduct 이전 조건
      const createChannelParams = {
        targetUserId: String(productDetail?.roleSeller?.userId || 0),
        productId: String(productDetail?.product.id),
        productTitle: productDetail?.product.title,
        productImage:
          productDetail?.product.imageThumbnail || productDetail?.product.imageMain || ''
      };

      const channelId = (productDetail?.channels || []).find(
        (channel) => channel.userId === accessUser?.userId
      )?.id;

      if (!accessUser) {
        SessionStorage.set(sessionStorageKeys.savedCreateChannelParams, createChannelParams);
        // push({ pathname: '/login' });
        setLoginBottomSheet({ open: true, returnUrl: '' });
        return;
      }

      if (needUpdateChatIOSVersion()) {
        setOpenChatRequiredUpdateDialog(true);
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

  // useEffect(() => {
  //   const hideDate = LocalStorage.get<string>(SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE);

  //   if (hideDate) {
  //     if (dayjs().diff(hideDate, 'days') >= 1) {
  //       LocalStorage.remove(SAFE_PAYMENT_COMMISSION_FREE_BANNER_HIDE_DATE);
  //       setOpen(true);
  //     }
  //   } else {
  //     setOpen(true);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (isDiscountCrm) {
  //     logEvent(attrKeys.products.VIEW_PURCHASE_TOOLTIP, {
  //       name: 'PRODUCT_DETAIL',
  //       att: 'PRICELOW'
  //     });
  //     setTimeout(
  //       () => setOpenTooltip((prevState) => ({ ...prevState, isOpenPriceCRMTooltip: false })),
  //       6000
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (!productDetail?.offers) return;

    const validOffers = productDetail.offers.filter(({ status }) => [1, 2, 4].includes(status));

    setIsPossibleOffer(isPriceOffer);
    setHasOffer(validOffers.length < 3 && productDetail.offers.some(({ status }) => status === 0));
    setCurrentOffer(validOffers.find(({ status }) => status === 1));
  }, [productDetail?.offers, isPriceOffer]);

  useEffect(() => {
    if (
      checkAgent.isMobileApp() &&
      productWishComplete &&
      !complete &&
      isPossibleOffer &&
      isChannelProduct
    ) {
      setOpenPriceOfferOnBoarding(true);
    } else if (!checkAgent.isMobileApp() && !complete && isPossibleOffer && isChannelProduct) {
      setOpenPriceOfferOnBoarding(true);
    }
  }, [complete, productWishComplete, isPossibleOffer, isChannelProduct]);

  if (!!accessUser && productDetail?.roleSeller?.userId === accessUser.userId) return null;

  return (
    <>
      {/* {open && isSafePayment && !isDisabledState && !isDuplicate && !isTargetProduct && (
        <PaymentLabelWrap
          alignment="center"
          justifyContent="space-between"
          gap={4}
          onClick={handleClickSafePaymentFreeBanner}
          isAllOperatorProduct={isAllOperatorProduct}
          openPriceOfferOnBoarding={openPriceOfferOnBoarding}
        >
          {isAllOperatorProduct && <Triangle />}
          <PaymentLabelContents gap={4} alignment="center" justifyContent="center">
            <Icon name="WonCircleFilled" width={20} height={20} color={common.uiWhite} />
            <Typography weight="medium" noWrap variant="body2" color="uiWhite">
              {isAllOperatorProduct
                ? '수수료 없이, 카멜이 대신 구매해드려요.'
                : '카멜은 안전결제 수수료 무료!'}
            </Typography>
          </PaymentLabelContents>
        </PaymentLabelWrap>
      )} */}
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
                color="primary-light"
                customStyle={{
                  fontSize: 20,
                  lineHeight: '26px'
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
                {commaNumber(getTenThousandUnitPrice(productDetail?.product?.price || 0))}만원
              </Typography>
            )}
            {isPossibleOffer &&
              !isDisabledState &&
              !isDuplicate &&
              !isTargetProduct &&
              isChannelProduct && (
                <>
                  {!hasOffer && !currentOffer && (
                    <Typography
                      weight="medium"
                      onClick={handleClickPriceOffer}
                      color="primary-light"
                      customStyle={{
                        textDecorationLine: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      가격 제안하기
                    </Typography>
                  )}
                  {hasOffer && !currentOffer && (
                    <Typography
                      weight="medium"
                      color="ui60"
                      customStyle={{
                        textDecorationLine: 'underline'
                      }}
                    >
                      가격 제안됨
                    </Typography>
                  )}
                  {!hasOffer && currentOffer && (
                    <Typography
                      weight="medium"
                      color="ui60"
                      customStyle={{
                        textDecorationLine: 'line-through'
                      }}
                    >
                      {commaNumber(getTenThousandUnitPrice(productDetail?.product?.price || 0))}만원
                    </Typography>
                  )}
                </>
              )}
            {(isOperatorProduct || isOperatorC2CProduct) && !isSoldOut && (
              <Flexbox alignment="center" gap={5}>
                <Typography
                  weight="medium"
                  onClick={() => pageMovePlatform()}
                  color="primary-light"
                  customStyle={{
                    textDecorationLine: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  보러가기
                </Typography>
                <Outlink />
              </Flexbox>
            )}
          </Flexbox>
        </Tooltip>
        <ProductDetailButtonGroup blockUserDialog={() => setOpenDialog(true)} />
      </Wrapper>
      {/* <SafePaymentGuideDialog
        open={openSafePaymentGuideDialog}
        onClose={() => setOpenSafePaymentGuideDialog(false)}
      /> */}
      <AppUpdateForChatDialog open={openChatRequiredUpdateDialog} />
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <Typography variant="h3" weight="bold">
          회원님이 차단한 사용자에요.
          <br />
          차단을 해제할까요?
        </Typography>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            marginTop: 20
          }}
        >
          <Button
            fullWidth
            variant="solid"
            brandColor="primary"
            size="large"
            onClick={async () => {
              if (isLoadingMutateUnblock) return;

              if (productDetail?.roleSeller?.userId && !!productDetail?.product) {
                await mutateUnblock(productDetail?.roleSeller.userId, {
                  async onSuccess() {
                    await refetch();
                    toastStack({
                      children: `${productDetail.product.productSeller.name}님을 차단 해제했어요.`
                    });
                    setOpenDialog(false);
                  }
                });
              }
            }}
          >
            차단 해제하기
          </Button>
          <Button fullWidth variant="ghost" brandColor="black" size="large">
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

// const Triangle = styled.div`
//   width: 0;
//   height: 0;
//   border-top: 10px solid
//     ${({
//       theme: {
//         palette: { primary }
//       }
//     }) => primary.light};
//   border-left: 10px solid transparent;
//   border-right: 10px solid transparent;
//   position: absolute;
//   bottom: -7px;
//   right: 80px;
// `;

// const PaymentLabelWrap = styled(Flexbox)<{
//   isAllOperatorProduct: boolean;
//   openPriceOfferOnBoarding: boolean;
// }>`
//   position: fixed;
//   width: 100%;
//   height: 32px;
//   padding: 12px 20px;
//   left: 0;
//   bottom: calc(76px + ${isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_BOTTOM : '0px'});
//   z-index: ${({ openPriceOfferOnBoarding, theme: { zIndex } }) =>
//     openPriceOfferOnBoarding ? 1 : zIndex.button + 1};
//   background: ${({
//     isAllOperatorProduct,
//     theme: {
//       palette: { common, primary }
//     }
//   }) => (isAllOperatorProduct ? primary.light : common.ui20)};
// `;

// const PaymentLabelContents = styled(Flexbox)`
//   flex: 1;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   white-space: nowrap;
// `;

function Outlink() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 1.5C0 0.671573 0.671573 0 1.5 0H3V1.5H1.5V10.5H10.5V9H12V10.5C12 11.3284 11.3284 12 10.5 12H1.5C0.671573 12 0 11.3284 0 10.5V1.5Z"
        fill="#425BFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0H12V6H10.5V2.56066L5.25 7.81066L4.18934 6.75L9.43934 1.5H6V0Z"
        fill="#425BFF"
      />
    </svg>
  );
}

export default ProductCTAButton;
