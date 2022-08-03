import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Alert,
  Avatar,
  Box,
  CtaButton,
  CustomStyle,
  Dialog,
  Flexbox,
  Icon,
  Label,
  Toast,
  Typography,
  useTheme
} from 'mrcamel-ui';

import { ProductLabel } from '@components/UI/organisms';
import { ReservingOverlay, SoldOutOverlay } from '@components/UI/molecules';
import { Image, Skeleton } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import commaNumber from '@utils/commaNumber';

import type { WishAtt } from '@typings/product';
import { deviceIdState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductCardState from '@hooks/useProductCardState';

import {
  Area,
  Content,
  MetaSocial,
  SkeletonWrapper,
  Title,
  WishButton
} from './ProductListCard.styles';

interface ProductListCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product;
  hideProductLabel?: boolean;
  hideAreaWithDateInfo?: boolean;
  hideMetaSocialInfo?: boolean;
  hideAlert?: boolean;
  productAtt?: object;
  wishAtt?: WishAtt;
  index?: number;
  onWishAfterChangeCallback?: () => void;
  customStyle?: CustomStyle;
  isRound?: boolean;
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
    productAtt,
    index,
    onWishAfterChangeCallback,
    customStyle,
    name,
    wishAtt,
    source,
    isRound = false,
    ...props
  },
  ref
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    id,
    title,
    site: { id: siteId } = {},
    siteUrl,
    targetProductId,
    brand: { name: brandName } = {},
    category: { name: categoryName } = {},
    line,
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
  const deviceId = useRecoilValue(deviceIdState);
  const { data: { userWishIds = [] } = {}, refetch: refetchCategoryWishes } =
    useQueryCategoryWishes({
      deviceId
    });
  const { data: accessUser } = useQueryAccessUser();
  const { mutate: mutatePostProductsAdd } = useMutation(postProductsAdd);
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

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const [loaded, setLoaded] = useState(false);
  const [isWish, setIsWish] = useState(false);
  const [{ openRemoveWishToast, openAddWishToast }, setOpenToast] = useState({
    openRemoveWishToast: false,
    openAddWishToast: false
  });
  const [openRemoveWishDialog, setOpenRemoveWishDialog] = useState(false);
  const loggedEventRef = useRef(false);
  const isDup = useMemo(() => !product.targetProductStatus, [product.targetProductStatus]);

  const hasTarget = useMemo(() => !!product.targetProductId, [product.targetProductId]);

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
    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, productAtt);
    if (source) {
      SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
    }
    router.push(`/products/${id}`);
  };

  const handleClickWish = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
      return;
    }

    if (router.pathname === '/wishes' && isWish && router.query.tab !== 'history') {
      setOpenRemoveWishDialog(true);
      return;
    }

    logEvent(isWish ? attrKeys.home.CLICK_WISH_CANCEL : attrKeys.home.CLICK_WISH, wishAtt);

    if (isWish) {
      mutatePostProductsRemove(
        {
          productId: id,
          deviceId
        },
        {
          async onSuccess() {
            await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
              exact: true
            });
            await refetchCategoryWishes();
            setOpenToast((prevState) => ({
              ...prevState,
              openAddWishToast: false,
              openRemoveWishToast: true
            }));
          }
        }
      );
    } else {
      mutatePostProductsAdd(
        {
          productId: id,
          deviceId
        },
        {
          async onSuccess() {
            await queryClient.removeQueries(queryKeys.products.product({ productId: id }), {
              exact: true
            });
            await refetchCategoryWishes();
            setOpenToast((prevState) => ({
              ...prevState,
              openAddWishToast: true,
              openRemoveWishToast: false
            }));
          }
        }
      );
    }
  };

  const handleClickAlert = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    logEvent('CLICK_PRODUCT_DETAIL', {
      name: 'WISH_LIST',
      att: isPriceDown ? 'PRICELOW' : 'SAME',
      index,
      id: targetProductId,
      brand: brandName,
      category: categoryName,
      line,
      site: siteName,
      price: targetProductPrice,
      scoreTotal
    });

    if (!showDuplicateUploadAlert && showDuplicateWithPriceDownAlert) {
      logEvent(attrKeys.products.CLICK_CLOSE, {
        name: 'MAIN',
        title: 'WISHPRICE_TOOLTIP'
      });
    }

    router.push(`/products/${targetProductId}`);
  };

  const handleClickRemoveWishConfirm = () => {
    logEvent(attrKeys.wishes.CLICK_WISH_CANCEL, wishAtt);

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
          setOpenToast((prevState) => ({
            ...prevState,
            openRemoveWishToast: true
          }));
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

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
  }, [imageUrl]);

  return (
    <>
      <Box customStyle={customStyle}>
        <Flexbox
          ref={ref}
          gap={12}
          onClick={handleClick}
          {...props}
          customStyle={{ cursor: 'pointer' }}
        >
          <Content isRound={isRound}>
            <Image
              variant="backgroundImage"
              src={imageUrl}
              alt={imageUrl.slice(imageUrl.lastIndexOf('/') + 1)}
              isRound={isRound}
            />
            {!loaded && (
              <SkeletonWrapper>
                <Skeleton isRound={isRound} customStyle={{ height: '100%' }} />
              </SkeletonWrapper>
            )}
            <WishButton onClick={handleClickWish}>
              {isWish ? (
                <Icon name="HeartFilled" color={secondary.red.main} size="large" />
              ) : (
                <Icon name="HeartOutlined" color={common.white} size="large" />
              )}
            </WishButton>
            <Avatar
              width={20}
              height={20}
              src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
                (siteUrl || {}).id || siteId
              }.png`}
              alt="Platform Img"
              customStyle={{ position: 'absolute', top: 10, left: 10 }}
            />
            {PRODUCT_STATUS[status as keyof typeof PRODUCT_STATUS] !== PRODUCT_STATUS['0'] &&
              (status === 4 ? <ReservingOverlay variant="h4" /> : <SoldOutOverlay variant="h4" />)}
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
                {isSafe && <span>안전결제 </span>}
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
                    variant="outlined"
                    size="xsmall"
                    brandColor="black"
                    text={productLegitStatusText}
                  />
                )}
                {isPopular && (
                  <Label variant="contained" size="xsmall" brandColor="black" text="인기" />
                )}
                {showPriceDown && (
                  <Label
                    variant="outlined"
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
                      <Icon name="HeartOutlined" width={14} height={14} color={common.grey['60']} />
                      <Typography
                        variant="small2"
                        weight="medium"
                        customStyle={{ color: common.grey['60'] }}
                      >
                        {wishCount}
                      </Typography>
                    </Flexbox>
                  )}
                  {purchaseCount > 0 && (
                    <Flexbox alignment="center" gap={3}>
                      <Icon
                        name="MessageOutlined"
                        width={14}
                        height={14}
                        color={common.grey['60']}
                      />
                      <Typography
                        variant="small2"
                        weight="medium"
                        customStyle={{ color: common.grey['60'] }}
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
                brandColor="primary-highlight"
                onClick={handleClickAlert}
                customStyle={{
                  marginTop: 8,
                  padding: '10px 20px'
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
                brandColor="primary-highlight"
                onClick={handleClickAlert}
                customStyle={{
                  marginTop: 8,
                  padding: '10px 20px'
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
      <Toast
        open={openRemoveWishToast}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, openRemoveWishToast: false }))}
      >
        <Typography variant="body1" weight="medium" customStyle={{ color: common.white }}>
          찜목록에서 삭제했어요.
        </Typography>
      </Toast>
      <Toast
        open={openAddWishToast}
        onClose={() => setOpenToast((prevState) => ({ ...prevState, openAddWishToast: false }))}
      >
        <Flexbox gap={8} alignment="center" justifyContent="space-between">
          <Typography variant="body1" weight="medium" customStyle={{ color: common.white }}>
            찜목록에 추가했어요!
          </Typography>
          <Typography
            variant="body1"
            weight="medium"
            customStyle={{
              color: common.white,
              textDecoration: 'underline',
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              logEvent(attrKeys.products.CLICK_WISH_LIST, {
                name,
                type: 'TOAST'
              });
            }}
          >
            <Link href="/wishes">
              <a>찜목록 보기</a>
            </Link>
          </Typography>
        </Flexbox>
      </Toast>
      <Dialog open={openRemoveWishDialog} onClose={() => setOpenRemoveWishDialog(false)}>
        <Box
          customStyle={{
            width: 285
          }}
        >
          <Typography
            weight="medium"
            customStyle={{
              textAlign: 'center',
              padding: '24px 0'
            }}
          >
            찜을 취소하시겠어요?
          </Typography>
          <Flexbox gap={8}>
            <CtaButton
              fullWidth
              variant="ghost"
              brandColor="primary"
              customStyle={{ marginTop: 10 }}
              onClick={() => setOpenRemoveWishDialog(false)}
            >
              취소
            </CtaButton>
            <CtaButton
              fullWidth
              variant="contained"
              brandColor="primary"
              customStyle={{ marginTop: 10 }}
              onClick={handleClickRemoveWishConfirm}
            >
              확인
            </CtaButton>
          </Flexbox>
        </Box>
      </Dialog>
    </>
  );
});

export default memo(ProductListCard);
