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
  Flexbox,
  Icon,
  Label,
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
import { Channel } from '@dto/channel';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import { logEvent } from '@library/amplitude';

import { fetchRelatedProducts } from '@api/product';

import { productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_SITE, productStatusCode } from '@constants/product';
import { APP_BANNER, IS_DONE_WISH_ON_BOARDING } from '@constants/localStorage';
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
import { productLegitToggleBottomSheetState } from '@recoil/productLegit';
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
  isPriceCrm,
  salePrice,
  isWish = false,
  isPriceDown,
  isProductLegit,
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
      palette: { secondary, common }
    }
  } = useTheme();

  const setLegitBottomSheet = useSetRecoilState(productLegitToggleBottomSheetState);
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

  const [legitTooltip, setLegitTooltip] = useState(true);
  const [isDoneWishOnBoarding, setIsDoneWishOnBoarding] = useState(true);
  const [isOpenRelatedProductListBottomSheet, setIsOpenRelatedProductListBottomSheet] =
    useState(false);
  const [{ isOpenPriceCRMTooltip, isOpenBunJangTooltip }, setOpenTooltip] = useState({
    isOpenPriceCRMTooltip: isPriceCrm,
    isOpenBunJangTooltip: false
  });
  const [pendingCreateChannel, setPendingCreateChannel] = useState(false);

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

    if (roleSeller?.userId) return { ctaText: '채팅하기', ctaBrandColor: 'primary' };

    if (isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller)
      return { ctaText: '판매자와 문자하기', ctaBrandColor: 'black' };

    return { ctaText: `${siteName}에서 거래하기`, ctaBrandColor: 'black' };
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

      const channelId = (channels || []).find(
        (channel) => channel.userId === accessUser.userId
      )?.id;

      if (channelId) {
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

  const handleScroll = debounce(() => {
    logEvent(attrKeys.products.SWIP_X_CARD, {
      name: attrProperty.productName.PRODUCT_DETAIL,
      title: attrProperty.productTitle.WISH_MODAL
    });
  }, 300);

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
        {isProductLegit &&
          !product?.productLegit &&
          product?.sellerType !== productSellerType.normal && (
            <ProductLegitCTAButton
              variant="solid"
              size="xlarge"
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
                variant="ghost"
                brandColor="primary"
                message={
                  <Flexbox gap={6} alignment="center">
                    <Label text="NEW" variant="solid" size="xsmall" />
                    <Typography weight="bold" variant="body2">
                      지금 보는 사진 그대로 실시간 정가품 의견받기
                    </Typography>
                    <Icon
                      name="CloseOutlined"
                      size="small"
                      color={common.ui20}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLegitTooltip(false);
                      }}
                    />
                  </Flexbox>
                }
                customStyle={{ left: '160%' }}
                triangleLeft={80}
              >
                사진감정
              </Tooltip>
            </ProductLegitCTAButton>
          )}
        <Button
          variant="solid"
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
            whiteSpace: 'nowrap',
            backgroundColor: ctaBrandColor === 'black' ? common.uiBlack : undefined
          }}
        >
          <Typography
            variant={['채팅하기', '차단한 사용자입니다'].includes(ctaText) ? 'h3' : 'body1'}
            weight={['채팅하기', '차단한 사용자입니다'].includes(ctaText) ? 'medium' : 'bold'}
            customStyle={{ display: 'flex', alignItems: 'center', color: common.uiWhite }}
          >
            {!roleSeller &&
              (isCamelProduct || isCamelSeller || isCamelSelfSeller || isNormalSeller) && (
                <Icon name="MessageOutlined" width={20} customStyle={{ marginRight: 8 }} />
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
                  customStyle={{ marginRight: 8 }}
                  width={20}
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

const ProductLegitCTAButton = styled(Button)`
  min-width: 81px;
  padding: 0;
  background: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.highlight};
  color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
`;

export default memo(ProductCTAButton);
