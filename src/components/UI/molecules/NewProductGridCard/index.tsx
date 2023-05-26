import type { HTMLAttributes, MouseEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStack } from '@mrcamelhub/camel-ui-toast';
import {
  Avatar,
  Box,
  Flexbox,
  Icon,
  Image,
  Label,
  Typography,
  useTheme
} from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import type { Product, ProductResult } from '@dto/product';

import UserTraceRecord from '@library/userTraceRecord';
import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import { SELLER_STATUS, productType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { VIEW_PRODUCT_STATUS } from '@constants/product';
import { FIRST_CATEGORIES } from '@constants/category';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductCardImageResizePath, getProductDetailUrl } from '@utils/common';

import type { ProductGridCardVariant } from '@typings/common';
import { deviceIdState, loginBottomSheetState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useOsAlarm from '@hooks/useOsAlarm';

import { Content, Overlay, WishButtonA, WishButtonB } from './NewProductGridCard.styles';

export interface NewProductGridCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ProductGridCardVariant;
  product: Product | ProductResult;
  subText?: string;
  bottomLabel?: ReactElement;
  hideLabel?: boolean;
  hidePrice?: boolean;
  hideAreaInfo?: boolean;
  hideMetaInfo?: boolean;
  hideWishButton?: boolean;
  butlerExhibition?: boolean;
  hideSize?: boolean;
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
  subText,
  bottomLabel,
  hideLabel,
  hidePrice,
  hideAreaInfo,
  hideMetaInfo,
  hideWishButton,
  hideSize,
  attributes: { name, title, source, index, ...attributes } = {},
  onWishAfterChangeCallback,
  measure,
  customStyle,
  butlerExhibition,
  ...props
}: NewProductGridCardProps) {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const toastStack = useToastStack();

  const {
    id,
    title: productTitle = '',
    imageMain,
    imageThumbnail,
    brand: { name: brandName = '', nameEng = '' } = {},
    category: { name: categoryName = '', parentId = 0 } = {},
    status,
    site: { name: siteName = '', hasImage: siteHasImage = false } = {},
    siteUrl,
    productSeller: { site: { id: siteId = 0 } = {}, type: sellerType = 0 } = {},
    wishCount = 0,
    purchaseCount = 0,
    datePosted,
    dateFirstPosted,
    area,
    price,
    cluster,
    size,
    productLegit
  } = product || {};
  const {
    id: siteUrlId = 0,
    hasImage: siteUrlHasImage = false,
    name: siteUrlName = ''
  } = siteUrl || {};
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
    useChat: product.sellerType !== productType.collection,
    ...attributes
  };
  const [isWish, setIsWish] = useState(false);
  const [sizeText, setSizeText] = useState('');
  const [isAuthSeller, setIsAuthSeller] = useState(false);
  const [isAuthProduct, setIsAuthProduct] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const deviceId = useRecoilValue(deviceIdState);
  const setOsAlarm = useOsAlarm();
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

      setOsAlarm();

      toastStack({
        children: '찜목록에 추가했어요!',
        action: {
          text: '찜목록 보기',
          onClick: () => {
            logEvent(attrKeys.products.clickWishList, {
              name: name || 'NONE_PRODUCT_LIST_CARD',
              type: 'TOAST'
            });
            router.push('/wishes');
          }
        }
      });

      await refetch();

      UserTraceRecord.setExitWishChannel();
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

      toastStack({
        children: '찜목록에서 삭제했어요.'
      });
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
    if (UserTraceRecord.getPageViewCount('exitSearch')) {
      UserTraceRecord.setExitWishChannel();
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

      toastStack({
        children: '내 매물은 찜할 수 없어요.'
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

  useEffect(() => {
    if (!size) return;

    const sizes = size.split('|');

    setSizeText(`${sizes.slice(0, 3).join(', ')}${sizes.length > 3 ? '...' : ''}`);
  }, [size]);

  useEffect(() => {
    if (!sellerType) return;

    setIsAuthSeller(SELLER_STATUS[sellerType as keyof typeof SELLER_STATUS] === SELLER_STATUS['3']);
  }, [sellerType]);

  useEffect(() => {
    if (!productLegit) return;

    const { status: legitStatus, result } = productLegit || {};

    setIsAuthProduct(legitStatus === 30 && result === 1);
  }, [productLegit]);

  return (
    <Flexbox onClick={handleClick} {...props} direction="vertical" customStyle={customStyle}>
      <Box
        customStyle={{
          position: 'relative'
        }}
      >
        {!hideLabel && !isAuthProduct && isAuthSeller && (
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
              color="uiWhite"
              customStyle={{
                padding: '3px 4px 3px 2px'
              }}
            >
              인증판매자
            </Typography>
          </Flexbox>
        )}
        {!hideLabel &&
          (!isAuthSeller || isAuthProduct) &&
          product.productSeller.type !== 4 &&
          siteId !== 34 && (
            <Flexbox gap={4} customStyle={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
              {isAuthSeller ? (
                <Flexbox
                  alignment="center"
                  justifyContent="center"
                  customStyle={{
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: common.ui20
                  }}
                >
                  <CamelLogoIcon />
                </Flexbox>
              ) : (
                <Avatar
                  width={18}
                  height={18}
                  src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                    (siteUrlHasImage && siteUrlId) || (siteHasImage && siteId) || ''
                  }.png`}
                  alt={`${siteUrlName || 'Platform'} Logo Img`}
                  disableSkeleton
                />
              )}
              {isAuthProduct && (
                <Label variant="solid" brandColor="black" size="xsmall" text="정품의견" />
              )}
            </Flexbox>
          )}
        {!hideLabel &&
          (!isAuthSeller || isAuthProduct) &&
          (product.productSeller.type === 4 ||
            siteId === 34 ||
            product.productSeller.type === 3) && (
            <Flexbox
              gap={4}
              customStyle={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 1
              }}
            >
              <Flexbox
                alignment="center"
                justifyContent="center"
                customStyle={{
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: common.ui20
                }}
              >
                <CamelLogoIcon />
              </Flexbox>
              {isAuthProduct && (
                <Label variant="solid" brandColor="black" size="xsmall" text="정품의견" />
              )}
            </Flexbox>
          )}
        <Image
          ratio="5:6"
          src={
            loadFailed
              ? imageMain || imageThumbnail
              : getProductCardImageResizePath(
                  imageMain || imageThumbnail,
                  butlerExhibition ? 1000 : 0
                )
          }
          alt={`${productTitle} 이미지`}
          round={variant === 'gridA' ? 0 : 8}
          onError={() => setLoadFailed(true)}
        />
        {!hideWishButton && !['gridC', 'swipeX'].includes(variant) && (
          <WishButtonA variant={variant} onClick={handleClickWish}>
            <Icon name="HeartFilled" width={20} height={20} color={isWish ? 'red-light' : 'ui80'} />
          </WishButtonA>
        )}
        {status > 0 && (
          <Overlay isRound={variant !== 'gridA'}>
            <Typography variant="h4" weight="bold" color="cmnW">
              {VIEW_PRODUCT_STATUS[status as keyof typeof VIEW_PRODUCT_STATUS]}
            </Typography>
          </Overlay>
        )}
      </Box>
      <Content variant={variant}>
        {!hideWishButton && !hideMetaInfo && ['gridC', 'swipeX'].includes(variant) && (
          <WishButtonB variant={variant} onClick={handleClickWish}>
            <Icon
              name={isWish ? 'HeartFilled' : 'HeartOutlined'}
              width={20}
              height={20}
              color={isWish ? 'red-light' : 'ui80'}
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
          color="ui60"
          customStyle={{
            marginTop: 2
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
            <Typography
              variant="h3"
              weight="bold"
              customStyle={{
                minWidth: 'fit-content'
              }}
            >
              {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
            </Typography>
            {hideSize && subText && (
              <Typography variant="body2" weight="medium" noWrap color="red-light">
                {subText}
              </Typography>
            )}
            {!hideSize && (
              <Typography variant="body2" weight="medium" noWrap color="ui60">
                {sizeText}
              </Typography>
            )}
          </Flexbox>
        )}
        {!hideAreaInfo && (
          <Typography
            variant="small2"
            noWrap
            color="ui60"
            customStyle={{
              marginTop: 8
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
                <Icon name="HeartFilled" width={12} height={12} color="ui80" />
                <Typography variant="small2" weight="medium" color="ui80">
                  {commaNumber(wishCount)}
                </Typography>
              </Flexbox>
            )}
            {purchaseCount > 0 && (
              <Flexbox gap={2}>
                <Icon name="MessageFilled" width={12} height={12} color="ui80" />
                <Typography variant="small2" weight="medium" color="ui80">
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

// TODO 추후 UI 라이브러리 추가?
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

export default NewProductGridCard;
