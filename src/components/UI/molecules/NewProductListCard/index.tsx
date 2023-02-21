import { useEffect, useState } from 'react';
import type { HTMLAttributes, MouseEvent, ReactElement } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Image, Label, Typography, useTheme } from 'mrcamel-ui';
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
import { NEXT_IMAGE_BLUR_URL } from '@constants/common';
import { FIRST_CATEGORIES } from '@constants/category';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

import type { ProductListCardVariant } from '@typings/common';
import { deviceIdState, loginBottomSheetState, toastState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

import { Overlay, ShopMoreButton, WishButton } from './NewProductListCard.styles';

export interface NewProductListCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductListCardVariant;
  product: Product | ProductResult;
  subText?: string;
  bottomLabel?: ReactElement;
  // TODO A/B 테스트 이후 제거 예정
  camelAuthLabelType?: 'B';
  hidePrice?: boolean;
  hideLabel?: boolean;
  hidePlatformLogo?: boolean;
  hideAreaInfo?: boolean;
  hideMetaInfo?: boolean;
  hideWishButton?: boolean;
  attributes?: {
    name?: string;
    title?: string;
    source?: string;
    index?: number;
  };
  showShopManageButton?: boolean;
  measure?: () => void;
  customStyle?: CustomStyle;
  onClickManageProduct?: () => void;
}

function NewProductListCard({
  variant,
  product,
  subText,
  bottomLabel,
  camelAuthLabelType,
  hidePrice,
  hideLabel,
  hidePlatformLogo = true,
  hideAreaInfo,
  hideMetaInfo,
  hideWishButton,
  attributes: { name, title, source, index, ...attributes } = {},
  showShopManageButton = false,
  onClickManageProduct,
  measure,
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
    site: { name: siteName = '', hasImage: siteHasImage = false } = {},
    siteUrl: { name: siteUrlName = '' } = {},
    productSeller: { site: { id: siteId = 0 } = {}, type: sellerType = 0 } = {},
    wishCount = 0,
    purchaseCount = 0,
    datePosted,
    dateFirstPosted,
    area,
    price,
    cluster,
    productLegit
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
  const [isAuthSeller, setIsAuthSeller] = useState(false);
  const [isAuthProduct, setIsAuthProduct] = useState(false);
  const [authOpinionCount, setAuthOpinionCount] = useState(0);

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
      setLoginBottomSheet({ open: true, returnUrl: '' });
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

  const handleClickManageProduct = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onClickManageProduct && showShopManageButton) {
      onClickManageProduct();
    }
  };

  useEffect(() => setIsWish(userWishIds.includes(id)), [id, userWishIds]);

  useEffect(() => {
    if (measure && typeof measure === 'function') {
      measure();
    }
  }, [measure]);

  useEffect(() => {
    setIsAuthSeller(SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3']);
  }, [sellerType]);

  useEffect(() => {
    if (!productLegit) return;

    const { status: legitStatus, result, legitOpinions = [] } = productLegit || {};

    setIsAuthProduct(legitStatus === 30 && result === 1);
    setAuthOpinionCount(
      legitOpinions.filter(({ result: legitResult }) => legitResult === 1).length
    );
  }, [productLegit]);

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
        {!hideLabel && !isAuthProduct && isAuthSeller && !camelAuthLabelType && (
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
        {!hideLabel && !isAuthProduct && isAuthSeller && camelAuthLabelType === 'B' && (
          <Flexbox
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1,
              borderRadius: 4,
              backgroundColor: common.ui20
            }}
          >
            <CamelLogoIcon />
            <Typography
              variant="small2"
              weight="bold"
              customStyle={{
                padding: '3px 4px 3px 2px',
                color: common.uiWhite
              }}
            >
              인증판매자
            </Typography>
          </Flexbox>
        )}
        {!hideLabel && isAuthProduct && (
          <Label
            variant="solid"
            brandColor="black"
            size="xsmall"
            text={`정품의견 ${authOpinionCount}개`}
            customStyle={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1
            }}
          />
        )}
        {!hidePlatformLogo && (
          <Avatar
            width={18}
            height={18}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
              (siteHasImage && siteId) || ''
            }.png`}
            alt={`${siteUrlName || 'Platform'} Logo Img`}
            customStyle={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
          />
        )}
        <Image
          ratio="5:6"
          src={imageMain || imageThumbnail || NEXT_IMAGE_BLUR_URL}
          alt={`${productTitle} 이미지`}
          round={8}
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
            <Icon
              name={isWish ? 'HeartFilled' : 'HeartOutlined'}
              color={isWish ? secondary.red.light : common.ui80}
            />
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

function CamelLogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.67529 12.2355L4.39429 7.51046C4.50051 7.21865 4.7183 6.981 4.99974 6.84977C5.28119 6.71854 5.60324 6.70449 5.89504 6.81071C6.18685 6.91693 6.4245 7.13471 6.55573 7.41616C6.68696 7.69761 6.70101 8.01965 6.59479 8.31146L5.17504 12.2355H2.67529ZM8.52529 12.2355H6.02554L7.74454 7.51046C7.85076 7.21865 8.06855 6.981 8.34999 6.84977C8.63144 6.71854 8.95349 6.70449 9.24529 6.81071C9.5371 6.91693 9.77475 7.13471 9.90598 7.41616C10.0372 7.69761 10.0513 8.01965 9.94504 8.31146L8.52529 12.2355ZM14.445 8.07071L13.275 8.37221L11.8665 12.2355H9.37354L11.4953 6.41021L13.8623 5.80271C14.163 5.72543 14.4822 5.77079 14.7495 5.92882C15.0168 6.08684 15.2104 6.34458 15.2877 6.64533C15.3649 6.94609 15.3196 7.26522 15.1616 7.53253C15.0035 7.79984 14.7458 7.99343 14.445 8.07071Z"
        fill="white"
      />
    </svg>
  );
}

export default NewProductListCard;
