import { forwardRef, memo, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactElement } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import { Avatar, Box, Flexbox, Icon, Image, Label, Typography } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import { ProductLabel } from '@components/UI/organisms';
import {
  HideOverlay,
  MyShopHideOverlay,
  ReservingOverlay,
  SoldOutOverlay
} from '@components/UI/molecules';

import type { Product, ProductResult } from '@dto/product';

import UserTraceRecord from '@library/userTraceRecord';
import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { productType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import { IMG_CAMEL_PLATFORM_NUMBER } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductCardImageResizePath, getProductDetailUrl } from '@utils/common';

import type { WishAtt } from '@typings/product';
import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { deviceIdState, loginBottomSheetState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductCardState from '@hooks/useProductCardState';
import useOsAlarm from '@hooks/useOsAlarm';

import {
  Area,
  MetaSocial,
  ShopMoreButton,
  Title,
  TodayWishViewLabel,
  WishButton
} from './ProductGridCard.styles';

interface ProductGridCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product | ProductResult;
  compact?: boolean;
  hideProductLabel?: boolean;
  hideAreaWithDateInfo?: boolean;
  hideMetaCamelInfo?: boolean;
  hidePrice?: boolean;
  showNewLabel?: boolean;
  hideLegitStatusLabel?: boolean;
  hidePriceDownCountLabel?: boolean;
  hideUpdatedCountLabel?: boolean;
  showTodayWishViewLabel?: boolean;
  hideOverlay?: boolean;
  showCountLabel?: boolean;
  hideWishButton?: boolean;
  hidePlatformLogo?: boolean;
  productAtt?: object;
  customStyle?: CustomStyle;
  customLabel?: ReactElement;
  wishAtt?: WishAtt;
  name?: string;
  source?: string;
  measure?: () => void;
  onWishAfterChangeCallback?: (product: Product | ProductResult, isWish: boolean) => void;
  isRound?: boolean;
  gap?: number;
  titlePriceStyle?: CustomStyle;
  areaWithDateInfoCustomStyle?: CustomStyle;
  metaCamelInfoCustomStyle?: CustomStyle;
  todayWishViewLabelCustomStyle?: CustomStyle;
  hideSafePayment?: boolean;
  showShopManageButton?: boolean;
  showHideOverlay?: boolean;
  showMyShopHideOverlay?: boolean;
}

const ProductGridCard = forwardRef<HTMLDivElement, ProductGridCardProps>(function ProductGridCard(
  {
    product,
    compact,
    hideProductLabel,
    hideAreaWithDateInfo,
    hideMetaCamelInfo,
    hidePrice,
    showNewLabel = false,
    hideLegitStatusLabel = false,
    hidePriceDownCountLabel = true,
    hideUpdatedCountLabel = true,
    showTodayWishViewLabel = false,
    showShopManageButton = false,
    showHideOverlay = false,
    showMyShopHideOverlay = false,
    hideOverlay = false,
    showCountLabel = false,
    hideWishButton = false,
    hidePlatformLogo = false,
    hideSafePayment = false,
    productAtt,
    customStyle,
    customLabel,
    wishAtt,
    name,
    source,
    measure,
    onWishAfterChangeCallback,
    isRound = false,
    gap,
    titlePriceStyle,
    areaWithDateInfoCustomStyle,
    metaCamelInfoCustomStyle,
    todayWishViewLabelCustomStyle,
    ...props
  },
  ref
) {
  const {
    id,
    title,
    site: { id: siteId = 0, hasImage: siteHasImage = false } = {},
    siteUrl,
    price = 0,
    wishCount = 0,
    purchaseCount = 0,
    viewCount = 0,
    area,
    datePosted,
    dateFirstPosted,
    status
  } = product;
  const {
    id: siteUrlId = 0,
    hasImage: siteUrlHasImage = false,
    name: siteUrlName = ''
  } = siteUrl || {};
  const {
    todayViewCount = 0,
    todayWishCount = 0,
    priceDownCount = 0,
    updatedCount = 0
  } = (product as ProductResult) || {};

  const queryClient = useQueryClient();
  const router = useRouter();

  const toastStack = useToastStack();

  const deviceId = useRecoilValue(deviceIdState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const setOpenState = useSetRecoilState(userShopOpenStateFamily('manage'));
  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setOsAlarm = useOsAlarm();

  const { data: accessUser } = useQueryAccessUser();
  const { data: { userWishIds = [] } = {}, refetch: refetchCategoryWishes } =
    useQueryCategoryWishes({ deviceId });
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    async onSuccess() {
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });
      await refetchCategoryWishes();

      if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
        await onWishAfterChangeCallback(product, isWish);
      }

      setOsAlarm();

      toastStack({
        children: '찜목록에 추가했어요!',
        action: {
          text: '찜목록 보기',
          onClick: () => {
            logEvent(attrKeys.products.clickWishList, {
              name: wishAtt?.name || name || 'NONE_PRODUCT_LIST_CARD',
              type: 'TOAST'
            });
            router.push('/wishes');
          }
        }
      });

      UserTraceRecord.setExitWishChannel();
    }
  });
  const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove, {
    async onSuccess() {
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });
      await refetchCategoryWishes();

      if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
        await onWishAfterChangeCallback(product, isWish);
      }

      toastStack({
        children: '찜목록에서 삭제했어요.'
      });
    }
  });
  const { imageUrl, isSafe, productLabels, productLegitStatusText } = useProductCardState(product);

  const [loadFailed, setLoadFailed] = useState(false);
  const [cardCustomStyle] = useState({ ...customStyle, cursor: 'pointer' });
  const [isWish, setIsWish] = useState(false);
  const [src, setSrc] = useState(getProductCardImageResizePath(imageUrl));

  const imageBoxRef = useRef<HTMLDivElement>(null);

  const isNormalseller = product?.sellerType === productType.normal;

  const handleClick = () => {
    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
      ...productAtt,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type),
      sellerType: product.sellerType,
      productSellerId: product.productSeller.id,
      productSellerType: product.productSeller.type,
      productSellerAccount: product.productSeller.account,
      useChat: product.sellerType !== productType.collection
    });

    if (source) {
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
    }

    router.push(getProductDetailUrl({ product: product as Product }));
  };

  const handleClickWish = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!accessUser) {
      setLoginBottomSheet({
        open: true,
        returnUrl: ''
      });
      return;
    }

    if (Number(product.productSeller.account) === accessUser.userId) {
      logEvent(attrKeys.products.CLICK_WISH_SELF, {
        ...wishAtt
      });

      toastStack({
        children: '내 매물은 찜할 수 없어요.'
      });
      return;
    }

    logEvent(isWish ? attrKeys.products.clickWishCancel : attrKeys.products.clickWish, {
      ...wishAtt,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type)
    });

    if (isWish) {
      mutatePostProductsRemove({ productId: id, deviceId });
    } else {
      mutatePostProductsAdd({ productId: id, deviceId });
    }
  };

  useEffect(() => {
    setIsWish(userWishIds.includes(id));
  }, [id, userWishIds]);

  useEffect(() => {
    if (measure && typeof measure === 'function') {
      measure();
    }
  }, [measure]);

  useEffect(() => {
    if (loadFailed) setSrc(imageUrl);
  }, [imageUrl, loadFailed]);

  const handleClickManageProduct = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setUserShopSelectedProductState(product as Product & ProductResult);
    setOpenState(({ type }) => ({
      type,
      open: true
    }));
  };

  return (
    <Flexbox
      ref={ref}
      direction="vertical"
      gap={gap || (compact ? 12 : 17)}
      onClick={handleClick}
      customStyle={cardCustomStyle}
      {...props}
    >
      <Box ref={imageBoxRef} customStyle={{ position: 'relative' }}>
        <Image
          src={src}
          alt={`${product.title} 이미지`}
          round={isRound ? 8 : 0}
          onError={() => setLoadFailed(true)}
        />
        {!hideProductLabel && productLabels.length > 0 && (
          <Flexbox customStyle={{ position: 'absolute', left: compact ? 0 : 12, bottom: -3 }}>
            {productLabels.map(({ description }, index) => (
              <ProductLabel
                key={`product-label-${description}`}
                showDivider={index !== 0}
                text={description}
                isSingle={productLabels.length === 1}
              />
            ))}
          </Flexbox>
        )}
        {showTodayWishViewLabel && (todayWishCount >= 2 || todayViewCount >= 10) && (
          <TodayWishViewLabel
            size="xsmall"
            variant="ghost"
            brandColor="black"
            text={
              (todayWishCount >= 2 && `오늘 ${todayWishCount}명이 찜했어요!`) ||
              (todayViewCount >= 10 && `오늘 ${todayViewCount}명이 봤어요!`) ||
              ''
            }
            compact={compact}
            customStyle={todayWishViewLabelCustomStyle}
          />
        )}
        {showShopManageButton && (
          <ShopMoreButton onClick={handleClickManageProduct}>
            <Icon name="MoreHorizFilled" color="uiWhite" />
          </ShopMoreButton>
        )}
        {!hideWishButton && (
          <WishButton onClick={handleClickWish}>
            {isWish ? (
              <Icon name="HeartFilled" color="red" />
            ) : (
              <Icon name="HeartOutlined" color="uiWhite" />
            )}
          </WishButton>
        )}
        {!hidePlatformLogo && (
          <Avatar
            width={20}
            height={20}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
              product.productSeller.type === 4 || siteId === 34 || product.productSeller.type === 3
                ? IMG_CAMEL_PLATFORM_NUMBER
                : (siteUrlHasImage && siteUrlId) || (siteHasImage && siteId) || ''
            }.png`}
            alt={`${siteUrlName || 'Platform'} Logo Img`}
            customStyle={{ position: 'absolute', top: 10, left: 10 }}
          />
        )}
        {!hideOverlay && showMyShopHideOverlay && status === 8 && (
          <MyShopHideOverlay variant="h4" isRound={isRound} />
        )}
        {!hideOverlay && showHideOverlay && status === 8 && (
          <HideOverlay variant="h4" isRound={isRound} />
        )}
        {!hideOverlay &&
          PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] &&
          status === 4 && <ReservingOverlay variant="h4" isRound={isRound} />}
        {!hideOverlay &&
          PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] &&
          status === 1 && <SoldOutOverlay variant="h4" isRound={isRound} />}
      </Box>
      <Flexbox direction="vertical" gap={4} customStyle={{ padding: compact ? 0 : '0 12px' }}>
        <Title variant="body2" weight="medium" customStyle={titlePriceStyle}>
          {!isNormalseller && isSafe && !hideSafePayment && <span>안전결제 </span>}
          {title}
        </Title>
        <Flexbox
          alignment="center"
          gap={6}
          customStyle={{
            marginBottom: 4,
            flexWrap: 'wrap',
            display: !hidePrice ? 'flex' : 'none',
            overflowY: 'hidden'
          }}
        >
          {!hidePrice && (
            <Typography variant="h4" weight="bold" customStyle={titlePriceStyle}>
              {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
            </Typography>
          )}
          {!hideLegitStatusLabel && productLegitStatusText && (
            <Label
              variant="outline"
              size="xsmall"
              brandColor="black"
              text={productLegitStatusText}
            />
          )}
          {showCountLabel && (priceDownCount >= 1 || updatedCount >= 3) && (
            <Label
              variant="solid"
              size="xsmall"
              brandColor="black"
              text={
                (priceDownCount >= 1 && `가격 ${priceDownCount}번 내림`) ||
                (updatedCount >= 3 && `끌올 ${updatedCount}회`) ||
                ''
              }
              customStyle={{ color: '#ACFF25' }}
            />
          )}
          {showNewLabel && (
            <Typography variant="small2" weight="medium" brandColor="red">
              NEW
            </Typography>
          )}
          {!hideUpdatedCountLabel && updatedCount > 0 && (
            <Label
              variant="ghost"
              brandColor="blue"
              size="xsmall"
              text={`끌올 ${commaNumber(updatedCount || 0)}회`}
            />
          )}
          {!hidePriceDownCountLabel && priceDownCount > 0 && (
            <Label
              variant="ghost"
              brandColor="blue"
              size="xsmall"
              text={`가격 ${commaNumber(priceDownCount || 0)}번 내림`}
            />
          )}
        </Flexbox>
        {!hideAreaWithDateInfo && (
          <Area variant="small2" weight="medium">
            <Box component="span" customStyle={areaWithDateInfoCustomStyle}>
              {`${datePosted > dateFirstPosted ? '끌올 ' : ''}${getFormattedDistanceTime(
                new Date(datePosted)
              )}${area ? ` · ${getProductArea(area)}` : ''}`}
            </Box>
          </Area>
        )}

        {!hideMetaCamelInfo && (wishCount > 0 || purchaseCount > 0 || viewCount > 0) && (
          <MetaSocial>
            {viewCount > 0 && (
              <Flexbox alignment="center" gap={2} customStyle={metaCamelInfoCustomStyle}>
                <Icon name="ViewOutlined" width={14} height={14} color="ui60" />
                <Typography variant="small2" weight="medium" color="ui60">
                  {viewCount}
                </Typography>
              </Flexbox>
            )}
            {wishCount > 0 && (
              <Flexbox alignment="center" gap={2} customStyle={metaCamelInfoCustomStyle}>
                <Icon name="HeartOutlined" width={14} height={14} color="ui60" />
                <Typography variant="small2" weight="medium" color="ui60">
                  {wishCount}
                </Typography>
              </Flexbox>
            )}
            {purchaseCount > 0 && (
              <Flexbox alignment="center" gap={2} customStyle={metaCamelInfoCustomStyle}>
                <Icon name="MessageOutlined" width={14} height={14} color="ui60" />
                <Typography variant="small2" weight="medium" color="ui60">
                  {purchaseCount}
                </Typography>
              </Flexbox>
            )}
          </MetaSocial>
        )}
        {customLabel}
      </Flexbox>
    </Flexbox>
  );
});

export default memo(ProductGridCard);
