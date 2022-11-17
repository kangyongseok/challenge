import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
// import Image from 'next/image';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

// import { Skeleton } from '@components/UI/atoms';

import { Image, Skeleton } from '@components/UI/atoms';

import type { Product } from '@dto/product';

import { logEvent } from '@library/amplitude';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getFormattedDistanceTime, getProductArea, getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber } from '@utils/common';

import { userShopOpenStateFamily, userShopSelectedProductState } from '@recoil/userShop';

interface UserShopProductCardProps {
  product: Product;
}

function UserShopProductCard({ product }: UserShopProductCardProps) {
  const router = useRouter();
  const {
    id,
    imageMain,
    imageThumbnail,
    price,
    datePosted,
    dateFirstPosted,
    area,
    title,
    wishCount,
    purchaseCount,
    status
  } = product;
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const setUserShopSelectedProductState = useSetRecoilState(userShopSelectedProductState);
  const setUserShopManageOpenState = useSetRecoilState(userShopOpenStateFamily('manage'));

  const [imageUrl] = useState(imageMain || imageThumbnail);
  const [loaded, setLoaded] = useState(false);

  const handleClick = (e: MouseEvent<HTMLOrSVGElement>) => {
    e.stopPropagation();
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_MANAGE, {
      name: attrProperty.name.MY_STORE,
      title: getTitle
    });

    setUserShopSelectedProductState(product);
    setUserShopManageOpenState(({ type }) => ({ type, open: true }));
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
  }, [imageUrl]);

  const getTitle = useMemo(() => {
    if (status === 0) return attrProperty.title.SALE;
    if (status === 4) return attrProperty.title.RESERVED;
    return attrProperty.title.SOLD;
  }, [status]);

  const handleClickProduct = () => {
    logEvent(attrKeys.camelSeller.CLICK_PRODUCT_DETAIL, {
      name: attrProperty.name.MY_STORE,
      title: getTitle,
      productType: 'original'
    });

    router.push(`/products/${id}`);
  };

  return (
    <Flexbox gap={12} onClick={handleClickProduct} customStyle={{ cursor: 'pointer' }}>
      <ImageWrapper>
        {/* <ImageWrap
          src={imageUrl}
          alt={imageUrl?.slice(imageUrl.lastIndexOf('/') + 1)}
          layout="fixed"
          width={100}
          height={100}
          priority
        /> */}
        <ImageWrap src={imageUrl} alt={imageUrl?.slice(imageUrl.lastIndexOf('/') + 1)} />
        {!loaded && (
          <SkeletonWrapper>
            <Skeleton isRound customStyle={{ height: '100%' }} />
          </SkeletonWrapper>
        )}
        {loaded && status !== 0 && (
          <>
            <Overlay />
            <OverlayBanner>
              <Typography variant="body2" weight="medium" customStyle={{ color: common.uiWhite }}>
                {status === 4 ? '예약중' : '판매완료'}
              </Typography>
            </OverlayBanner>
          </>
        )}
      </ImageWrapper>
      <Box customStyle={{ flexGrow: 1 }}>
        <Title variant="body2" weight="medium">
          {title}
        </Title>
        <Typography variant="h4" weight="bold" customStyle={{ marginTop: 4 }}>
          {`${commaNumber(getTenThousandUnitPrice(price))}만원`}
        </Typography>
        {dayjs().diff(dayjs(datePosted), 'second') === 0 && (
          <Typography
            variant="small2"
            weight="medium"
            customStyle={{ marginTop: 8, color: common.ui60 }}
          >
            끌올 몇 초 전
          </Typography>
        )}
        {dayjs().diff(dayjs(datePosted), 'second') > 0 && (
          <Typography
            variant="small2"
            weight="medium"
            customStyle={{ marginTop: 8, color: common.ui60 }}
          >
            {`${datePosted > dateFirstPosted ? '끌올 ' : ''}${getFormattedDistanceTime(
              new Date(datePosted)
            )}${area ? ` · ${getProductArea(area)}` : ''}`}
          </Typography>
        )}
        {(wishCount > 0 || purchaseCount > 0) && (
          <Flexbox gap={6} alignment="center" customStyle={{ marginTop: 4, height: 12 }}>
            {wishCount > 0 && (
              <Flexbox>
                <Icon name="HeartOutlined" width={12} height={12} color={common.ui60} />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{ marginLeft: 4, color: common.ui60 }}
                >
                  {wishCount}
                </Typography>
              </Flexbox>
            )}
            {purchaseCount > 0 && (
              <Flexbox>
                <Icon name="MessageOutlined" width={12} height={12} color={common.ui60} />
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{ marginLeft: 4, color: common.ui60 }}
                >
                  {purchaseCount}
                </Typography>
              </Flexbox>
            )}
          </Flexbox>
        )}
      </Box>
      <Box customStyle={{ padding: '0 10px', marginRight: -10 }} onClick={handleClick}>
        <Icon
          name="MoreFilled"
          size="medium"
          color={common.ui80}
          customStyle={{ minWidth: 16, cursor: 'pointer' }}
        />
      </Box>
    </Flexbox>
  );
}

const ImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  min-width: 100px;
  border-radius: 8px;
  overflow: hidden;
`;

const Title = styled(Typography)`
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.uiWhite};
  opacity: 0.7;
  border-radius: 8px;
`;

const OverlayBanner = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui20};
  border-radius: 0 0 8px 8px;
`;

export const SkeletonWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export const ImageWrap = styled(Image)`
  object-fit: cover;
  width: 100px;
  height: 100px;
`;

export default UserShopProductCard;
