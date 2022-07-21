import { HTMLAttributes, forwardRef, memo, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Avatar,
  Box,
  CustomStyle,
  Flexbox,
  Icon,
  Label,
  Toast,
  Typography,
  useTheme
} from 'mrcamel-ui';

import { Image, Skeleton, TouchIcon } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { postProductsAdd, postProductsRemove } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import commaNumber from '@utils/commaNumber';

import type { WishAtt } from '@typings/product';
import { deviceIdState } from '@recoil/common';
import useQueryCategoryWishes from '@hooks/useQueryCategoryWishes';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useProductCardState from '@hooks/useProductCardState';

import { Area, MetaSocial, SkeletonWrapper, Title, WishButton } from './ProductGridCard.styles';

interface ProductGridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  product: Product;
  compact?: boolean;
  hideProductLabel?: boolean;
  hideAreaWithDateInfo?: boolean;
  hideMetaCamelInfo?: boolean;
  hideAlert?: boolean;
  productAtt?: object;
  customStyle?: CustomStyle;
  wishAtt?: WishAtt;
  name?: string;
  measure?: () => void;
  onWishAfterChangeCallback?: (product: Product, isWish: boolean) => void;
}

const ProductGridCard = forwardRef<HTMLDivElement, ProductGridCardProps>(function ProductGridCard(
  {
    product,
    compact,
    hideProductLabel,
    hideAreaWithDateInfo,
    hideMetaCamelInfo,
    productAtt,
    customStyle,
    wishAtt,
    name,
    measure,
    onWishAfterChangeCallback,
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
    siteUrl: { id: siteUrlId, hasImage = false } = {},
    price = 0,
    wishCount = 0,
    purchaseCount = 0,
    area,
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
  const { imageUrl, isSafe, productLabels } = useProductCardState(product);

  const {
    theme: {
      palette: { secondary, common }
    }
  } = useTheme();

  const [cardCustomStyle] = useState({ ...customStyle, pointer: 'cursor' });
  const [loaded, setLoaded] = useState(false);
  const [isWish, setIsWish] = useState(false);
  const [{ openRemoveWishToast, openAddWishToast }, setOpenToast] = useState({
    openRemoveWishToast: false,
    openAddWishToast: false
  });

  const handleClick = () => {
    logEvent(attrKeys.wishes.CLICK_PRODUCT_DETAIL, productAtt);

    router.push(`/products/${id}`);
  };

  const handleClickWish = async (e: MouseEvent) => {
    e.stopPropagation();

    if (!accessUser) {
      router.push({ pathname: '/login', query: { returnUrl: router.asPath } });
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
            if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
              await onWishAfterChangeCallback(product, isWish);
            }
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
            if (onWishAfterChangeCallback && typeof onWishAfterChangeCallback === 'function') {
              await onWishAfterChangeCallback(product, isWish);
            }
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

  useEffect(() => {
    setIsWish(userWishIds.includes(id));
  }, [id, userWishIds]);

  useEffect(() => {
    if (measure && typeof measure === 'function') {
      measure();
    }
  }, [measure]);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
  }, [imageUrl]);

  return (
    <>
      <Flexbox
        ref={ref}
        direction="vertical"
        gap={compact ? 12 : 18}
        onClick={handleClick}
        customStyle={cardCustomStyle}
        {...props}
      >
        <Box customStyle={{ position: 'relative' }}>
          <Image
            variant="backgroundImage"
            src={imageUrl}
            alt={imageUrl.slice(imageUrl.lastIndexOf('/') + 1)}
          />
          {!loaded && (
            <SkeletonWrapper>
              <Skeleton customStyle={{ height: '100%' }} />
            </SkeletonWrapper>
          )}
          {!hideProductLabel && productLabels.length > 0 && (
            <Box customStyle={{ position: 'absolute', left: 12, bottom: -10 }}>
              {productLabels.map(({ description, brandColor }) => (
                <Label
                  key={`product-label-${description}`}
                  text={description}
                  size="xsmall"
                  customStyle={{
                    borderRadius: 0,
                    backgroundColor: brandColor,
                    borderColor: brandColor,
                    color: common.white
                  }}
                />
              ))}
            </Box>
          )}
          <WishButton>
            {isWish ? (
              <TouchIcon
                name="HeartFilled"
                direction="right"
                color={secondary.red.main}
                onClick={handleClickWish}
                wrapCustomStyle={{ marginTop: -6 }}
              />
            ) : (
              <TouchIcon
                name="HeartOutlined"
                direction="right"
                color={common.white}
                onClick={handleClickWish}
                wrapCustomStyle={{ marginTop: -6 }}
                customStyle={{ filter: 'drop-shadow(0px 0 2px rgba(0, 0, 0, 0.4))' }}
              />
            )}
          </WishButton>
          <Avatar
            width={20}
            height={20}
            src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${
              (hasImage && siteUrlId) || (hasImage && siteId) || ''
            }.png`}
            alt="Platform Img"
            customStyle={{ position: 'absolute', top: 12, left: 12 }}
          />
        </Box>
        <Box customStyle={{ padding: compact ? 0 : '0 12px' }}>
          <Title variant="body2" weight="medium">
            {isSafe && <strong>안전결제 </strong>}
            {title}
          </Title>
          <Flexbox alignment="center" customStyle={{ marginTop: 4 }}>
            <Typography
              variant="body1"
              weight="bold"
              customStyle={{ marginTop: 2, marginRight: 6 }}
            >
              {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
            </Typography>
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
          {!hideMetaCamelInfo && (wishCount > 0 || purchaseCount > 0) && (
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
                  <Icon name="MessageOutlined" width={14} height={14} color={common.grey['60']} />
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
        </Box>
      </Flexbox>
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
                name: name || 'NONE_PRODUCT_LIST_CARD',
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
    </>
  );
});

export default memo(ProductGridCard);
