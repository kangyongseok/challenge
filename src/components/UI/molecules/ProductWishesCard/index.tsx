import { HTMLAttributes, MouseEvent, forwardRef, useEffect, useState } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { Alert, Avatar, Box, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';

import { ReservingOverlay, SoldOutOverlay } from '@components/UI/molecules';
import { Image } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { PRODUCT_STATUS } from '@constants/product';
import attrKeys from '@constants/attrKeys';

import { commaNumber, getTenThousandUnitPrice } from '@utils/formats';
import { getProductDetailUrl } from '@utils/common';

import type { WishAtt } from '@typings/product';
import { openDeleteToastState, removeIdState } from '@recoil/wishes';
import { deviceIdState, toastState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductCardState from '@hooks/useProductCardState';

import { Content, PriceDownLabel, Title } from './ProductWishesCard.styles';

interface ProductWishesCardProps extends HTMLAttributes<HTMLDivElement> {
  product: Product;
  index?: number;
  iconType?: string;
  wishAtt?: WishAtt;
  name?: string;
  source?: string;
  productAtt?: object;
  onWishAfterChangeCallback?: () => void;
}

const ProductWishesCard = forwardRef<HTMLDivElement, ProductWishesCardProps>(
  function ProductWishesCard(
    {
      product,
      index,
      iconType,
      wishAtt,
      name,
      source,
      productAtt,
      onWishAfterChangeCallback,
      ...props
    },
    ref
  ) {
    const {
      theme: {
        palette: { common, primary, secondary }
      }
    } = useTheme();
    const queryClient = useQueryClient();
    const { data: accessUser } = useQueryAccessUser();
    const [isWish, setIsWish] = useState(false);
    const setDeleteToast = useSetRecoilState(openDeleteToastState);
    const setRemoveId = useSetRecoilState(removeIdState);
    const router = useRouter();
    const deviceId = useRecoilValue(deviceIdState);
    const setToastState = useSetRecoilState(toastState);
    const { data: { userWishIds = [] } = {}, refetch: refetchCategoryWishes } =
      useQueryCategoryWishes({ deviceId });
    const { mutate: mutatePostProductsRemove } = useMutation(postProductsRemove);
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
            logEvent(attrKeys.products.clickWishList, { name, type: 'TOAST' });
            router.push('/wishes');
          }
        });
      }
    });
    const {
      imageUrl,
      isSafe,
      showPriceDown,
      showDuplicateUploadAlert,
      showDuplicateWithPriceDownAlert,
      isPopular,
      isPriceDown,
      salePrice,
      productLegitStatusText,
      discountedPrice
    } = useProductCardState(product);
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
      status
    } = product as Product;

    useEffect(() => {
      setIsWish(userWishIds.includes(id));
    }, [id, userWishIds]);

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

      router.push(getProductDetailUrl({ type: 'targetProduct', product }));
    };

    const handleClickWish = async (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!accessUser) {
        router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
        return;
      }

      if (router.pathname === '/wishes' && isWish && router.query.tab !== 'history') {
        handleClickRemoveWishConfirm();
        return;
      }

      logEvent(isWish ? attrKeys.home.CLICK_WISH_CANCEL : attrKeys.home.CLICK_WISH, wishAtt);

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

    const handleClickRemoveWishConfirm = () => {
      logEvent(attrKeys.wishes.CLICK_WISH_CANCEL, productAtt);
      setRemoveId(id);
      mutatePostProductsRemove(
        {
          productId: id,
          deviceId
        },
        {
          async onSuccess() {
            await queryClient.refetchQueries(queryKeys.products.product({ productId: id }));
            await refetchCategoryWishes();
            setDeleteToast(true);
            if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
              onWishAfterChangeCallback();
            }
          }
        }
      );
    };

    const handleClickProductDetail = () => {
      logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, productAtt);
      if (source) {
        SessionStorage.set(sessionStorageKeys.productDetailEventProperties, { source });
      }

      router.push(getProductDetailUrl({ product }));
    };

    return (
      <>
        <Flexbox
          alignment="flex-start"
          gap={12}
          customStyle={{ position: 'relative' }}
          ref={ref}
          onClick={handleClickProductDetail}
          {...props}
        >
          <Content size={100} isTimeline={router.query.tab === 'history'}>
            <Image
              variant="backgroundImage"
              src={imageUrl}
              alt={imageUrl.slice(imageUrl.lastIndexOf('/') + 1)}
              disableLazyLoad={false}
              disableSkeletonRender={false}
              customStyle={{ borderRadius: 8 }}
            />
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
              (status === 4 ? (
                <ReservingOverlay card variant="small1" />
              ) : (
                <SoldOutOverlay card variant="small1" />
              ))}
          </Content>
          <Flexbox
            alignment="flex-start"
            justifyContent="space-between"
            customStyle={{ flex: 1, marginTop: 5 }}
            gap={10}
          >
            <Box>
              <Title variant="body2" weight="medium" customStyle={{ marginBottom: 4 }}>
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
                  <PriceDownLabel>
                    <Icon name="DropdownFilled" />
                    {commaNumber(Math.round(discountedPrice / 10000))}만원
                  </PriceDownLabel>
                )}
              </Flexbox>
              {(wishCount > 0 || purchaseCount > 0) && (
                <Flexbox gap={6}>
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
                </Flexbox>
              )}
            </Box>
            <Box
              onClick={handleClickWish}
              customStyle={{ padding: '0 10px 10px 10px', marginRight: -10 }}
            >
              {iconType === 'heart' && isWish && (
                <Icon name="HeartFilled" color={secondary.red.main} size="small" />
              )}
              {iconType === 'heart' && !isWish && (
                <Icon name="HeartOutlined" color={common.ui80} size="small" />
              )}
              {iconType !== 'heart' && (
                <Icon
                  name="CloseOutlined"
                  width={16}
                  height={16}
                  customStyle={{ color: common.ui80 }}
                />
              )}
            </Box>
          </Flexbox>
        </Flexbox>
        <>
          {showDuplicateUploadAlert && (
            <Alert
              brandColor="primary-bgLight"
              onClick={handleClickAlert}
              customStyle={{
                padding: '10px 20px',
                marginTop: -8
              }}
            >
              <Flexbox alignment="center" gap={20}>
                <Typography variant="body2" weight="bold" customStyle={{ color: primary.light }}>
                  중복
                </Typography>
                <Typography variant="body2" weight="bold">
                  판매자가 같은 매물을 다시 올렸어요
                </Typography>
                <Icon name="CaretRightOutlined" size="small" customStyle={{ marginLeft: 'auto' }} />
              </Flexbox>
            </Alert>
          )}
          {!showDuplicateUploadAlert && showDuplicateWithPriceDownAlert && (
            <Alert
              onClick={handleClickAlert}
              customStyle={{
                padding: '10px 20px',
                marginTop: -8,
                background: common.bg03
              }}
            >
              <Flexbox gap={20} alignment="center">
                <Typography
                  variant="body2"
                  weight="bold"
                  customStyle={{ color: secondary.red.main, minWidth: 44 }}
                >
                  가격하락
                </Typography>
                <Typography variant="body2" weight="bold">
                  {commaNumber(Math.round(salePrice / 10000))}만원 내려서 다시 올렸어요!
                </Typography>
                <Icon name="CaretRightOutlined" size="small" customStyle={{ marginLeft: 'auto' }} />
              </Flexbox>
            </Alert>
          )}
        </>
      </>
    );
  }
);

export default ProductWishesCard;
