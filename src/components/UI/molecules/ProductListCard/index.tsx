import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import {
  Alert,
  Avatar,
  Box,
  CustomStyle,
  Flexbox,
  Icon,
  Image,
  Label,
  Typography,
  useTheme
} from 'mrcamel-ui';

import { ProductLabel } from '@components/UI/organisms';
import { ReservingOverlay, SoldOutOverlay } from '@components/UI/molecules';
import { Badge } from '@components/UI/atoms';
import { ProductWishCancelDialog } from '@components/pages/product';

import type { Product } from '@dto/product';
import { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import { IMG_CAMEL_PLATFORM_NUMBER } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

import type { WishAtt } from '@typings/product';
import { deviceIdState, loginBottomSheetState, toastState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductCardState from '@hooks/useProductCardState';

import { Area, Content, MetaSocial, Title, WishButton } from './ProductListCard.styles';

interface ProductListCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product | ProductResult;
  hideProductLabel?: boolean;
  hideAreaWithDateInfo?: boolean;
  hideMetaSocialInfo?: boolean;
  hideAlert?: boolean;
  hideNewLegitBadge?: boolean;
  productAtt?: object;
  wishAtt?: WishAtt;
  index?: number;
  onWishAfterChangeCallback?: () => void;
  customStyle?: CustomStyle;
  isRound?: boolean;
  isLegitViewed?: boolean;
  name?: string;
  source?: string;
}

const ProductListCard = forwardRef<HTMLDivElement, ProductListCardProps>(function ProductListCard(
  {
    product,
    hideProductLabel,
    hideAreaWithDateInfo,
    hideMetaSocialInfo = true,
    hideAlert = true,
    hideNewLegitBadge = true,
    productAtt,
    index,
    onWishAfterChangeCallback,
    customStyle,
    name,
    wishAtt,
    source,
    isRound = false,
    isLegitViewed = true,
    ...props
  },
  ref
) {
  const {
    id,
    title,
    site: { id: siteId = 0, hasImage: siteHasImage = false } = {},
    siteUrl,
    targetProductId,
    brand: { name: brandName } = {},
    category: { name: categoryName } = {},
    site: { name: siteName } = {},
    targetProductPrice,
    scoreTotal,
    price = 0,
    wishCount = 0,
    purchaseCount = 0,
    area,
    status,
    datePosted,
    dateFirstPosted
  } = product;
  const {
    id: siteUrlId = 0,
    hasImage: siteUrlHasImage = false,
    name: siteUrlName = ''
  } = siteUrl || {};

  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    theme: {
      palette: { primary, secondary, common }
    }
  } = useTheme();

  const deviceId = useRecoilValue(deviceIdState);
  const setToastState = useSetRecoilState(toastState);

  const { data: accessUser } = useQueryAccessUser();
  const setLoginBottomSheet = useSetRecoilState(loginBottomSheetState);
  const { data: { userWishIds = [] } = {}, refetch: refetchCategoryWishes } =
    useQueryCategoryWishes({ deviceId });
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd, {
    async onSuccess() {
      await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
        exact: true
      });
      await refetchCategoryWishes();

      setToastState({
        type: 'product',
        status: 'successAddWish',
        action: () => {
          logEvent(attrKeys.products.clickWishList, { name: wishAtt?.name || name, type: 'TOAST' });
          router.push('/wishes');
        }
      });
    }
  });
  const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove);

  const {
    imageUrl,
    isSafe,
    productLabels,
    showPriceDown,
    showDuplicateUploadAlert,
    showDuplicateWithPriceDownAlert,
    isPopular,
    isPriceDown,
    salePrice,
    productLegitStatusText
  } = useProductCardState(product);

  const [isWish, setIsWish] = useState(false);
  const [openRemoveWishDialog, setOpenRemoveWishDialog] = useState(false);
  const loggedEventRef = useRef(false);
  const isDup = useMemo(() => !product.targetProductStatus, [product.targetProductStatus]);

  const hasTarget = useMemo(() => !!product.targetProductId, [product.targetProductId]);

  const isNormalseller =
    (product?.site.id === 34 || product?.productSeller.type === 4) &&
    product?.productSeller.type !== 3;

  useEffect(() => {
    if (showPriceDown) return;
    if (isPopular && name === 'WISH_LIST') {
      logEvent(attrKeys.wishes.VIEW_HOTPRODUCT_TOOLTIP, {
        name: attrProperty.productName.WISH_LIST
      });
    }
  }, [isPopular, name, showPriceDown]);

  useEffect(() => {
    if (product && isWish && isDup && hasTarget && !loggedEventRef.current) {
      loggedEventRef.current = true;
      if (!isPriceDown || salePrice < 1) {
        logEvent(attrKeys.wishes.VIEW_PRODUCT_DETAIL_TOOLTIP, {
          name,
          att: 'SAME'
        });
      } else {
        logEvent(attrKeys.wishes.VIEW_PRODUCT_DETAIL_TOOLTIP, {
          name,
          att: 'PRICELOW'
        });
      }
    }
  }, [isPriceDown, isWish, salePrice, name, product, hasTarget, isDup]);

  const handleClick = () => {
    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
      ...productAtt,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type)
    });

    if (source) {
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
    }

    router.push(getProductDetailUrl({ product: product as Product }));
  };

  const handleClickWish = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!accessUser) {
      setLoginBottomSheet(true);
      return;
    }

    if (router.pathname === '/wishes' && isWish && router.query.tab !== 'history') {
      setOpenRemoveWishDialog(true);
      return;
    }

    if (Number(product.productSeller.account) === accessUser.userId) {
      logEvent(attrKeys.products.CLICK_WISH_SELF, {
        ...wishAtt
      });

      setToastState({
        type: 'product',
        status: 'selfCamelProduct'
      });
      return;
    }

    logEvent(isWish ? attrKeys.products.clickWishCancel : attrKeys.home.CLICK_WISH, {
      ...wishAtt,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type)
    });

    if (isWish) {
      mutatePostProductsRemove(
        { productId: id, deviceId },
        {
          async onSuccess() {
            await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
              exact: true
            });
            await refetchCategoryWishes();
            setToastState({ type: 'product', status: 'successRemoveWish' });
          }
        }
      );
    } else {
      mutatePostProductsAdd({ productId: id, deviceId });
    }
  };

  const handleClickAlert = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, {
      name: 'WISH_LIST',
      att: isPriceDown ? 'PRICELOW' : 'SAME',
      index,
      id: targetProductId,
      brand: brandName,
      category: categoryName,
      line: (product as Product)?.line || '',
      site: siteName,
      price: targetProductPrice,
      scoreTotal,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type)
    });

    if (!showDuplicateUploadAlert && showDuplicateWithPriceDownAlert) {
      logEvent(attrKeys.products.CLICK_CLOSE, {
        name: 'MAIN',
        title: 'WISHPRICE_TOOLTIP'
      });
    }

    router.push(getProductDetailUrl({ type: 'targetProduct', product }));
  };

  const handleClickRemoveWishConfirm = () => {
    logEvent(attrKeys.wishes.CLICK_WISH_CANCEL, {
      ...wishAtt,
      productType: getProductType(product.productSeller.site.id, product.productSeller.type)
    });

    mutatePostProductsRemove(
      {
        productId: id,
        deviceId
      },
      {
        onSettled() {
          setOpenRemoveWishDialog(false);
        },
        async onSuccess() {
          await queryClient.refetchQueries(queryKeys.products.product({ productId: id }));
          await refetchCategoryWishes();
          setToastState({ type: 'product', status: 'successRemoveWish' });

          if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
            onWishAfterChangeCallback();
          }
        }
      }
    );
  };

  useEffect(() => {
    setIsWish(userWishIds.includes(id));
  }, [id, userWishIds]);

  useEffect(() => {
    if (!hideAlert && !showDuplicateUploadAlert && showDuplicateWithPriceDownAlert) {
      logEvent(attrKeys.products.VIEW_WISHPRICE_TOOLTIP, { name: 'WISH_LIST', att: 'CARD' });
    }
  }, [hideAlert, showDuplicateUploadAlert, showDuplicateWithPriceDownAlert]);

  return (
    <>
      <Box customStyle={{ ...customStyle, position: 'relative' }}>
        <Flexbox
          ref={ref}
          gap={12}
          onClick={handleClick}
          {...props}
          customStyle={{ cursor: 'pointer' }}
        >
          <Badge
            brandColor="red"
            type="alone"
            width={8}
            height={8}
            open={!hideNewLegitBadge && !isLegitViewed}
            customStyle={{ position: 'absolute', top: 12, left: -12 }}
          />
          <Content isRound={isRound}>
            <Image
              src={imageUrl}
              alt={imageUrl.slice(imageUrl.lastIndexOf('/') + 1)}
              round={isRound ? 8 : 0}
              disableLazyLoad={false}
              disableOnBackground={false}
            />
            <WishButton onClick={handleClickWish}>
              {isWish ? (
                <Icon name="HeartFilled" color={secondary.red.main} size="large" />
              ) : (
                <Icon name="HeartOutlined" color={common.cmnW} size="large" />
              )}
            </WishButton>
            <Avatar
              width={20}
              height={20}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                isNormalseller
                  ? IMG_CAMEL_PLATFORM_NUMBER
                  : (siteUrlHasImage && siteUrlId) || (siteHasImage && siteId) || ''
              }.png`}
              alt={`${siteUrlName || 'Platform'} Logo Img`}
              customStyle={{ position: 'absolute', top: 10, left: 10 }}
            />
            {PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] &&
              (status === 4 ? (
                <ReservingOverlay card variant="small1" />
              ) : (
                <SoldOutOverlay card variant="small1" />
              ))}
          </Content>
          <div>
            {!hideProductLabel && productLabels.length > 0 && (
              <Flexbox customStyle={{ marginBottom: 8 }}>
                {productLabels.map(({ description }, childIndex) => (
                  <ProductLabel
                    key={`product-label-${description}`}
                    showDivider={childIndex !== 0}
                    text={description}
                    isSingle={productLabels.length === 1}
                  />
                ))}
              </Flexbox>
            )}
            <Flexbox direction="vertical" gap={4}>
              <Title variant="body2" weight="medium">
                {!isNormalseller && isSafe && <span>안전결제 </span>}
                {title}
              </Title>
              <Flexbox
                alignment="center"
                gap={6}
                customStyle={{ marginBottom: 4, flexWrap: 'wrap' }}
              >
                <Typography variant="h4" weight="bold">
                  {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
                </Typography>
                {productLegitStatusText && (
                  <Label
                    variant="outline"
                    size="xsmall"
                    brandColor="black"
                    text={productLegitStatusText}
                  />
                )}
                {isPopular && (
                  <Label variant="solid" size="xsmall" brandColor="black" text="인기" />
                )}
                {showPriceDown && (
                  <Label
                    variant="outline"
                    size="xsmall"
                    brandColor="red"
                    text="가격하락"
                    customStyle={{ marginLeft: isPopular ? 4 : 0 }}
                  />
                )}
              </Flexbox>
              {!hideAreaWithDateInfo && (
                <Area variant="small2" weight="medium">
                  <Box component="span">
                    {`${datePosted > dateFirstPosted ? '끌올 ' : ''}${getFormattedDistanceTime(
                      new Date(datePosted)
                    )}${area ? ` · ${getProductArea(area)}` : ''}`}
                  </Box>
                </Area>
              )}
              {!hideMetaSocialInfo && (wishCount > 0 || purchaseCount > 0) && (
                <MetaSocial>
                  {wishCount > 0 && (
                    <Flexbox alignment="center" gap={3}>
                      <Icon name="HeartOutlined" width={14} height={14} color={common.ui60} />
                      <Typography
                        variant="small2"
                        weight="medium"
                        customStyle={{ color: common.ui60 }}
                      >
                        {wishCount}
                      </Typography>
                    </Flexbox>
                  )}
                  {purchaseCount > 0 && (
                    <Flexbox alignment="center" gap={3}>
                      <Icon name="MessageOutlined" width={14} height={14} color={common.ui60} />
                      <Typography
                        variant="small2"
                        weight="medium"
                        customStyle={{ color: common.ui60 }}
                      >
                        {purchaseCount}
                      </Typography>
                    </Flexbox>
                  )}
                </MetaSocial>
              )}
            </Flexbox>
          </div>
        </Flexbox>
        {!hideAlert && (
          <>
            {showDuplicateUploadAlert && (
              <Alert
                onClick={handleClickAlert}
                customStyle={{
                  marginTop: 8,
                  padding: '10px 20px',
                  backgroundColor: primary.highlight
                }}
              >
                <Flexbox justifyContent="space-between" alignment="center">
                  <Typography variant="body2" weight="medium">
                    판매자가 같은 매물을 다시 올렸어요
                  </Typography>
                  <Icon name="CaretRightOutlined" size="small" />
                </Flexbox>
              </Alert>
            )}
            {!showDuplicateUploadAlert && showDuplicateWithPriceDownAlert && (
              <Alert
                onClick={handleClickAlert}
                customStyle={{
                  marginTop: 8,
                  padding: '10px 20px',
                  backgroundColor: primary.highlight
                }}
              >
                <Flexbox justifyContent="space-between" alignment="center">
                  <Typography variant="body2" weight="medium">
                    {commaNumber(Math.round(salePrice / 10000))}만원 할인! 판매자가 가격을 내려서
                    다시 올렸어요
                  </Typography>
                  <Icon name="CaretRightOutlined" size="small" />
                </Flexbox>
              </Alert>
            )}
          </>
        )}
      </Box>
      <ProductWishCancelDialog
        open={openRemoveWishDialog}
        setOpenRemoveWishDialog={() => setOpenRemoveWishDialog(false)}
        submit={handleClickRemoveWishConfirm}
      />
    </>
  );
});

export default memo(ProductListCard);
