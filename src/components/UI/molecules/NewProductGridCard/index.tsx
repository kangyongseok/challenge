import type { HTMLAttributes, MouseEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Image, Label, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Product, ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { SELLER_STATUS, productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { VIEW_PRODUCT_STATUS } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

import type { ProductGridCardVariant } from '@typings/common';
import { deviceIdState, loginBottomSheetState, toastState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { Content, Overlay, WishButtonA, WishButtonB } from './NewProductGridCard.styles';

export interface NewProductGridCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductGridCardVariant;
  product: Product | ProductResult;
  // TODO A/B 테스트 이후 제거 예정
  wishButtonType?: 'A' | 'B';
  subText?: string;
  bottomLabel?: ReactElement;
  hideLabel?: boolean;
  hidePrice?: boolean;
  hideAreaInfo?: boolean;
  hideMetaInfo?: boolean;
  hideWishButton?: boolean;
  attributes?: {
    [key: string]: string | string[] | number | boolean | null | undefined;
  };
  onWishAfterChangeCallback?: (product: Product | ProductResult, isWish: boolean) => void;
  measure?: () => void;
  customStyle?: CustomStyle;
}

function NewProductGridCard({
  variant = 'gridA',
  product,
  wishButtonType = 'A',
  subText,
  bottomLabel,
  hideLabel,
  hidePrice,
  hideAreaInfo,
  hideMetaInfo,
  hideWishButton,
  attributes: { name, title, source, index, ...attributes } = {},
  onWishAfterChangeCallback,
  measure,
  customStyle,
  ...props
}: NewProductGridCardProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const {
    id,
    title: productTitle = '',
    imageMain,
    imageThumbnail,
    brand: { name: brandName = '', nameEng = '' } = {},
    category: { name: categoryName = '', parentId = 0 } = {},
    status,
    site: { name: siteName = '' } = {},
    productSeller: { site: { id: siteId = 0 } = {}, type: sellerType = 0 } = {},
    wishCount = 0,
    purchaseCount = 0,
    datePosted,
    dateFirstPosted,
    area,
    price,
    cluster
  } = product || {};
  const eventParams = {
    id,
    index,
    name,
    title,
    source,
    brand: brandName,
    category: categoryName,
    parentId,
    parentCategory: FIRST_CATEGORIES[parentId as keyof typeof FIRST_CATEGORIES],
    site: siteName,
    price,
    cluster,
    productType: getProductType(siteId, sellerType),
    sellerType: product.sellerType,
    productSellerId: product.productSeller.id,
    productSellerType: product.productSeller.type,
    productSellerAccount: product.productSeller.account,
    useChat: product.sellerType !== productSellerType.collection,
    ...attributes
  };
  const [isWish, setIsWish] = useState(false);

  const deviceId = useRecoilValue(deviceIdState);
  const setToastState = useSetRecoilState(toastState);
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const queryClient = useQueryClient();

  const { data: accessUser } = useQueryAccessUser();
  const { data: { userWishIds = [] } = {}, refetch } = useQueryCategoryWishes({ deviceId });

  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    async onSuccess() {
      setIsWish(true);
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });

      if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
        await onWishAfterChangeCallback(product, true);
      }

      setToastState({
        type: 'product',
        status: 'successAddWish',
        action: () => {
          logEvent(attrKeys.products.clickWishList, {
            name: name || 'NONE_PRODUCT_LIST_CARD',
            type: 'TOAST'
          });
          router.push('/wishes');
        }
      });
      await refetch();
    }
  });
  const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove, {
    async onSuccess() {
      setIsWish(false);
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });

      if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
        await onWishAfterChangeCallback(product, false);
      }

      setToastState({ type: 'product', status: 'successRemoveWish' });
      await refetch();
    }
  });

  const handleClick = () => {
    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, eventParams);

    if (source) {
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
        source
      });
    }

    router.push(getProductDetailUrl({ product: product as Product }));
  };

  const handleClickWish = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!accessUser) {
      setLoginBottomSheet(true);
      return;
    }

    if (Number(product.productSeller.account) === accessUser?.userId) {
      logEvent(attrKeys.products.CLICK_WISH_SELF, eventParams);

      setToastState({
        type: 'product',
        status: 'selfCamelProduct'
      });
      return;
    }

    logEvent(isWish ? attrKeys.products.clickWishCancel : attrKeys.products.clickWish, eventParams);

    if (isWish) {
      mutatePostProductsRemove({ productId: id, deviceId });
    } else {
      mutatePostProductsAdd({ productId: id, deviceId });
    }
  };

  useEffect(() => {
    if (measure && typeof measure === 'function') {
      measure();
    }
  }, [measure]);

  useEffect(() => setIsWish(userWishIds.includes(id)), [id, userWishIds]);

  return (
    <Flexbox onClick={handleClick} {...props} direction="vertical" customStyle={customStyle}>
      <Box
        customStyle={{
          position: 'relative'
        }}
      >
        {!hideLabel &&
          SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3'] && (
            <Label
              variant="solid"
              brandColor="black"
              size="xsmall"
              startIcon={<Icon name="ShieldFilled" />}
              text="인증판매자"
              customStyle={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 1
              }}
            />
          )}
        <Image
          ratio="5:6"
          src={imageMain || imageThumbnail}
          alt={`${productTitle} 이미지`}
          round={variant === 'gridA' ? 0 : 8}
        />
        {!hideWishButton && !['gridC', 'swipeX'].includes(variant) && wishButtonType === 'A' && (
          <WishButtonA variant={variant} onClick={handleClickWish}>
            <Icon
              name="HeartFilled"
              width={20}
              height={20}
              color={isWish ? secondary.red.light : common.ui80}
            />
          </WishButtonA>
        )}
        {status > 0 && (
          <Overlay isRound={variant !== 'gridA'}>
            <Typography
              variant="h4"
              weight="bold"
              customStyle={{
                color: common.cmnW
              }}
            >
              {VIEW_PRODUCT_STATUS[status as keyof typeof VIEW_PRODUCT_STATUS]}
            </Typography>
          </Overlay>
        )}
      </Box>
      <Content variant={variant}>
        {!hideMetaInfo && (['gridC', 'swipeX'].includes(variant) || wishButtonType === 'B') && (
          <WishButtonB variant={variant} onClick={handleClickWish}>
            <Icon
              name={isWish ? 'HeartFilled' : 'HeartOutlined'}
              width={20}
              height={20}
              color={isWish ? secondary.red.light : common.ui80}
            />
          </WishButtonB>
        )}
        <Flexbox>
          <Typography variant="body2" weight="bold" noWrap>
            {nameEng
              .split(' ')
              .map(
                (splitNameEng) =>
                  `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(
                    1,
                    splitNameEng.length
                  )}`
              )
              .join(' ')}
          </Typography>
          <Box customStyle={{ minWidth: 36, height: 'fit-content' }} />
        </Flexbox>
        <Typography
          variant="body2"
          noWrap
          lineClamp={2}
          customStyle={{
            marginTop: 2,
            color: common.ui60
          }}
        >
          {productTitle}
        </Typography>
        {!hidePrice && (
          <Flexbox
            gap={4}
            alignment="baseline"
            customStyle={{
              marginTop: 4
            }}
          >
            <Typography variant="h3" weight="bold">
              {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
            </Typography>
            {subText && (
              <Typography
                variant="body2"
                weight="medium"
                customStyle={{
                  color: secondary.red.light
                }}
              >
                {subText}
              </Typography>
            )}
          </Flexbox>
        )}
        {!hideAreaInfo && (
          <Typography
            variant="small2"
            noWrap
            customStyle={{
              marginTop: 8,
              color: common.ui60
            }}
          >
            {`${datePosted > dateFirstPosted ? '끌올 ' : ''}${getFormattedDistanceTime(
              new Date(datePosted)
            )}${area ? ` · ${getProductArea(area)}` : ''}`}
          </Typography>
        )}
        {!hideMetaInfo && (wishCount > 0 || purchaseCount > 0) && (
          <Flexbox
            gap={12}
            customStyle={{
              marginTop: 6
            }}
          >
            {wishCount > 0 && (
              <Flexbox gap={2}>
                <Icon name="HeartFilled" width={12} height={12} color={common.ui80} />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: common.ui80
                  }}
                >
                  {commaNumber(wishCount)}
                </Typography>
              </Flexbox>
            )}
            {purchaseCount > 0 && (
              <Flexbox gap={2}>
                <Icon name="MessageFilled" width={12} height={12} color={common.ui80} />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: common.ui80
                  }}
                >
                  {commaNumber(purchaseCount)}
                </Typography>
              </Flexbox>
            )}
          </Flexbox>
        )}
        {bottomLabel && (
          <Flexbox
            gap={2}
            customStyle={{
              marginTop: 12
            }}
          >
            {bottomLabel}
          </Flexbox>
        )}
      </Content>
    </Flexbox>
  );
}

export default NewProductGridCard;
