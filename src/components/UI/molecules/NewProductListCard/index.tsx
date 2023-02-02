import { useEffect, useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactElement } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Image, Label, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import type { Product, ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { SELLER_STATUS, productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { VIEW_PRODUCT_STATUS } from '@constants/product';
import { NEXT_IMAGE_BLUR_URL } from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

import type { ProductListCardVariant } from '@typings/common';
import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';
import { deviceIdState, loginBottomSheetState, toastState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { Overlay, ShopMoreButton, WishButton } from './NewProductListCard.styles';

export interface NewProductListCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductListCardVariant;
  product: Product | ProductResult;
  subText?: string;
  bottomLabel?: ReactElement;
  hideLabel?: boolean;
  hideAreaInfo?: boolean;
  hideMetaInfo?: boolean;
  hideWishButton?: boolean;
  attributes?: {
    name?: string;
    title?: string;
    source?: string;
    index?: number;
  };
  customStyle?: CustomStyle;
  showShopManageButton?: boolean;
}

function NewProductListCard({
  variant,
  product,
  subText,
  bottomLabel,
  hideLabel,
  hideAreaInfo,
  hideMetaInfo,
  hideWishButton,
  showShopManageButton = false,
  attributes: { name, title, source, index, ...attributes } = {},
  customStyle,
  ...props
}: NewProductListCardProps) {
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
    productSeller: { site: { id: siteId = 0 } = {}, type = 0 } = {},
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
    productType: getProductType(siteId, type),
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
  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setOpenState = useSetRecoilState(userShopOpenStateFamily('manage'));

  const queryClient = useQueryClient();

  const { data: accessUser } = useQueryAccessUser();
  const { data: { userWishIds = [] } = {}, refetch } = useQueryCategoryWishes({ deviceId });

  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    async onSuccess() {
      setIsWish(true);
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });

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

  useEffect(() => setIsWish(userWishIds.includes(id)), [id, userWishIds]);

  const handleClickManageProduct = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setUserShopSelectedProductState(product as Product & ProductResult);
    setOpenState(({ type: stateType }) => ({
      type: stateType,
      open: true
    }));
  };

  return (
    <Flexbox
      onClick={handleClick}
      {...props}
      gap={16}
      alignment={variant === 'listB' ? 'center' : undefined}
      css={customStyle}
    >
      <Box
        customStyle={{
          position: 'relative',
          minWidth: variant === 'listB' ? 60 : 120,
          maxWidth: variant === 'listB' ? 60 : 120
        }}
      >
        {!hideLabel && SELLER_STATUS[type as keyof typeof SELLER_STATUS] === SELLER_STATUS['3'] && (
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
          src={imageMain || imageThumbnail || NEXT_IMAGE_BLUR_URL}
          alt={`${productTitle} 이미지`}
          round={8}
          disableOnBackground={false}
        />
        {variant === 'listA' && status !== 0 && (
          <Overlay>
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
      <Box
        customStyle={{
          position: 'relative',
          flexGrow: 1
        }}
      >
        <Typography variant="body2" weight="bold">
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
        <Typography
          variant="body2"
          noWrap
          lineClamp={variant === 'listB' ? 1 : 2}
          customStyle={{
            marginTop: 2,
            color: common.ui60
          }}
        >
          {productTitle}
        </Typography>
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
        {!hideAreaInfo && (
          <Typography
            variant="small2"
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
      </Box>
      {!hideWishButton && (
        <Flexbox
          direction="vertical"
          justifyContent={variant === 'listB' ? 'center' : undefined}
          customStyle={{
            width: 24,
            height: '100%'
          }}
        >
          <WishButton onClick={handleClickWish}>
            <Icon name="HeartFilled" color={isWish ? secondary.red.light : common.ui80} />
          </WishButton>
        </Flexbox>
      )}
      {showShopManageButton && (
        <ShopMoreButton onClick={handleClickManageProduct}>
          <Icon name="MoreHorizFilled" color={common.ui80} />
        </ShopMoreButton>
      )}
    </Flexbox>
  );
}

export default NewProductListCard;
