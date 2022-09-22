import { HTMLAttributes, forwardRef, memo, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { ProductLabel } from '@components/UI/organisms';
import { ReservingOverlay, SoldOutOverlay } from '@components/UI/molecules';
import { Image } from '@components/UI/atoms';

import type { Product, ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

import type { WishAtt } from '@typings/product';
import { deviceIdState, toastState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductCardState from '@hooks/useProductCardState';

import { Area, MetaSocial, Title, TodayWishViewLabel, WishButton } from './ProductGridCard.styles';

interface ProductGridCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product | ProductResult;
  compact?: boolean;
  hideProductLabel?: boolean;
  hideAreaWithDateInfo?: boolean;
  hideMetaCamelInfo?: boolean;
  showNewLabel?: boolean;
  hideLegitStatusLabel?: boolean;
  showTodayWishViewLabel?: boolean;
  showCountLabel?: boolean;
  hideWishButton?: boolean;
  hidePlatformLogo?: boolean;
  productAtt?: object;
  customStyle?: CustomStyle;
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
}

const ProductGridCard = forwardRef<HTMLDivElement, ProductGridCardProps>(function ProductGridCard(
  {
    product,
    compact,
    hideProductLabel,
    hideAreaWithDateInfo,
    hideMetaCamelInfo,
    showNewLabel = false,
    hideLegitStatusLabel = false,
    showTodayWishViewLabel = false,
    showCountLabel = false,
    hideWishButton = false,
    hidePlatformLogo = false,
    productAtt,
    customStyle,
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
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);
  const setToastState = useSetRecoilState(toastState);

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

      setToastState({
        type: 'product',
        status: 'successAddWish',
        action: () => {
          logEvent(attrKeys.products.clickWishList, {
            name: wishAtt?.name || name || 'NONE_PRODUCT_LIST_CARD',
            type: 'TOAST'
          });
          router.push('/wishes');
        }
      });
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

      setToastState({ type: 'product', status: 'successRemoveWish' });
    }
  });
  const { imageUrl, isSafe, productLabels, productLegitStatusText } = useProductCardState(product);

  const [cardCustomStyle] = useState({ ...customStyle, cursor: 'pointer' });
  const [isWish, setIsWish] = useState(false);

  const imageBoxRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, productAtt);

    if (source) {
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
    }

    router.push(getProductDetailUrl({ product: product as Product }));
  };

  const handleClickWish = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }

    logEvent(isWish ? attrKeys.products.clickWishCancel : attrKeys.products.clickWish, wishAtt);

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
          variant="backgroundImage"
          src={imageUrl}
          alt={imageUrl.slice(imageUrl.lastIndexOf('/') + 1)}
          isRound={isRound}
          disableLazyLoad={false}
          disableSkeletonRender={false}
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
        {!hideWishButton && (
          <WishButton onClick={handleClickWish}>
            {isWish ? (
              <Icon name="HeartFilled" color={secondary.red.main} />
            ) : (
              <Icon name="HeartOutlined" color={common.white} />
            )}
          </WishButton>
        )}
        {!hidePlatformLogo && (
          <Avatar
            width={20}
            height={20}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
              (siteUrlHasImage && siteUrlId) || (siteHasImage && siteId) || ''
            }.png`}
            alt={`${siteUrlName || 'Platform'} Logo Img`}
            customStyle={{ position: 'absolute', top: 10, left: 10 }}
          />
        )}
        {PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] &&
          (status === 4 ? (
            <ReservingOverlay variant="h4" isRound={isRound} />
          ) : (
            <SoldOutOverlay variant="h4" isRound={isRound} />
          ))}
      </Box>
      <Flexbox direction="vertical" gap={4} customStyle={{ padding: compact ? 0 : '0 12px' }}>
        <Title variant="body2" weight="medium" customStyle={titlePriceStyle}>
          {isSafe && <span>안전결제 </span>}
          {title}
        </Title>
        <Flexbox alignment="center" gap={6} customStyle={{ marginBottom: 4, flexWrap: 'wrap' }}>
          <Typography variant="h4" weight="bold" customStyle={titlePriceStyle}>
            {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
          </Typography>
          {!hideLegitStatusLabel && productLegitStatusText && (
            <Label
              variant="outlined"
              size="xsmall"
              brandColor="black"
              text={productLegitStatusText}
            />
          )}
          {showCountLabel && (priceDownCount >= 1 || updatedCount >= 3) && (
            <Label
              variant="contained"
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
        {!hideMetaCamelInfo && (wishCount > 0 || purchaseCount > 0) && (
          <MetaSocial>
            {wishCount > 0 && (
              <Flexbox alignment="center" gap={2} customStyle={metaCamelInfoCustomStyle}>
                <Icon name="HeartOutlined" width={14} height={14} color={common.grey['60']} />
                <Typography variant="small2" weight="medium" color={common.grey['60']}>
                  {wishCount}
                </Typography>
              </Flexbox>
            )}
            {purchaseCount > 0 && (
              <Flexbox alignment="center" gap={2} customStyle={metaCamelInfoCustomStyle}>
                <Icon name="MessageOutlined" width={14} height={14} color={common.grey['60']} />
                <Typography variant="small2" weight="medium" color={common.grey['60']}>
                  {purchaseCount}
                </Typography>
              </Flexbox>
            )}
          </MetaSocial>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default memo(ProductGridCard);
