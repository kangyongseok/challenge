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
import styled from '@emotion/styled';

import OsAlarmDialog from '@components/UI/organisms/OsAlarmDialog';

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
import useSession from '@hooks/useSession';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useProductType from '@hooks/useProductType';
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
  const { checkOsAlarm, openOsAlarmDialog, handleCloseOsAlarmDialog } = useOsAlarm();
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);

  const queryClient = useQueryClient();

  const { isLoggedIn, data: accessUser } = useSession();
  const { data: { userWishIds = [] } = {}, refetch } = useQueryCategoryWishes({ deviceId });
  const { isAllOperatorProduct } = useProductType(product.sellerType);

  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    async onSuccess() {
      setIsWish(true);
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });

      if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
        await onWishAfterChangeCallback(product, true);
      }

      checkOsAlarm();

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

    if (!isLoggedIn) {
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
    <>
      <Flexbox onClick={handleClick} {...props} direction="vertical" customStyle={customStyle}>
        <Box
          customStyle={{
            position: 'relative'
          }}
        >
          {!hideLabel && !isAuthProduct && isAuthSeller && (
            <Flexbox
              alignment="center"
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
              <LabelText
                text="인증판매자"
                variant="solid"
                brandColor="black"
                customStyle={{ marginLeft: -5 }}
              />
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
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: common.ui20
                    }}
                  >
                    <CamelLogoIcon />
                  </Flexbox>
                ) : (
                  <Avatar
                    width={20}
                    height={20}
                    src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                      (siteUrlHasImage && siteUrlId) || (siteHasImage && siteId) || ''
                    }.png`}
                    alt={`${siteUrlName || 'Platform'} Logo Img`}
                    disableSkeleton
                  />
                )}
                {isAuthProduct ||
                  (isAllOperatorProduct && (
                    <LabelText
                      variant="solid"
                      brandColor="black"
                      text={isAuthProduct ? '정품의견' : '구매대행'}
                    />
                  ))}
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
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: common.ui20
                  }}
                >
                  <CamelLogoIcon />
                </Flexbox>
                {isAuthProduct && <LabelText variant="solid" brandColor="black" text="정품의견" />}
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
              <Icon
                name="HeartFilled"
                width={20}
                height={20}
                color={isWish ? 'red-light' : 'ui80'}
              />
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
            <WishButtonB variant={variant}>
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
              marginTop: 2,
              wordBreak: 'keep-all'
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
      <OsAlarmDialog open={openOsAlarmDialog} onClose={handleCloseOsAlarmDialog} />
    </>
  );
}

const LabelText = styled(Label)`
  font-weight: 700;
  font-family: NanumSquareNeo;
  font-size: 11px;
  height: 20px;
  padding: 3px 4px;
`;

// TODO 추후 UI 라이브러리 추가?
function CamelLogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_490_7686)">
        <rect width="20" height="20" rx="4" fill="#313438" />
        <path
          d="M2.97253 13.595L4.88253 8.34499C5.00056 8.02076 5.24254 7.7567 5.55526 7.61089C5.86797 7.46508 6.22581 7.44947 6.55003 7.56749C6.87426 7.68551 7.13832 7.92749 7.28413 8.24021C7.42994 8.55293 7.44555 8.91076 7.32753 9.23499L5.75003 13.595H2.97253ZM9.47253 13.595H6.69503L8.60503 8.34499C8.72306 8.02076 8.96504 7.7567 9.27776 7.61089C9.59048 7.46508 9.94831 7.44947 10.2725 7.56749C10.5968 7.68551 10.8608 7.92749 11.0066 8.24021C11.1524 8.55293 11.1681 8.91076 11.05 9.23499L9.47253 13.595ZM16.05 8.96749L14.75 9.30249L13.185 13.595H10.415L12.7725 7.12249L15.4025 6.44749C15.7367 6.36162 16.0913 6.41203 16.3883 6.58761C16.6853 6.76319 16.9004 7.04956 16.9863 7.38374C17.0721 7.71791 17.0217 8.0725 16.8462 8.36952C16.6706 8.66653 16.3842 8.88162 16.05 8.96749Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_490_7686">
          <rect width="20" height="20" rx="4" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default NewProductGridCard;
