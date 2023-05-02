import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { Avatar, Box, Flexbox, Icon, Typography } from 'mrcamel-ui';
import dayjs from 'dayjs';
import styled from '@emotion/styled';

import { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

function getTitle({
  title,
  priceBefore,
  price,
  viewCount = 0,
  wishCount = 0,
  purchaseCount = 0
}: ProductResult) {
  if (priceBefore) {
    return `"${title}"이(가) ${commaNumber(
      getTenThousandUnitPrice(priceBefore - price)
    )}만원 저렴해졌어요!`;
  }
  if (purchaseCount >= 6) {
    return `"${title}"을(를) ${commaNumber(purchaseCount)}명이나 사고 싶어 해요!`;
  }

  if (wishCount >= 5) {
    return `"${title}"을(를) ${commaNumber(wishCount)}명이나 관심 있어 해요!`;
  }

  return `"${title}"을(를) ${commaNumber(viewCount)}명이나 봤어요!`;
}

interface HomeRecommendIwshCardProps {
  productResult: ProductResult;
}

function HomeRecommendWishCard({ productResult }: HomeRecommendIwshCardProps) {
  const router = useRouter();

  const [isIntersecting, setIntersecting] = useState(false);
  const [error, setError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const {
      id,
      brand: { name: brand },
      category: { name: category, parentId },
      site: { name: site },
      price,
      cluster,
      priceBefore,
      productSeller,
      sellerType
    } = productResult || {};
    logEvent(attrKeys.home.CLICK_PRODUCT_DETAIL, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.WISHPRODUCT,
      att: priceBefore ? 'PRICELOW' : 'HOT',
      id,
      brand,
      category,
      parentId,
      site,
      price,
      cluster,
      productType: getProductType(productSeller.site.id, productSeller.type),
      sellerType,
      productSellerId: productSeller.id,
      productSellerType: productSeller.type,
      productSellerAccount: productSeller.account,
      useChat: sellerType !== productSellerType.collection
    });
    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.source.MAIN_WISH
    });
    router.push(getProductDetailUrl({ product: productResult, type: 'productResult' }));
  };

  useEffect(() => {
    let observer: IntersectionObserver;

    try {
      observer = new IntersectionObserver(([e]) => setIntersecting(e.isIntersecting));

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }
    } catch {
      setError(true);
      setIntersecting(true);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isIntersecting) {
      logEvent(attrKeys.home.VIEW_WISHPRODUCT, {
        name: attrProperty.name.MAIN,
        att: productResult.priceBefore ? 'PRICELOW' : 'HOT',
        anchor: error ? 'N' : undefined
      });
    }
  }, [isIntersecting, error, productResult.priceBefore]);

  return (
    <StyledHomeRecommendWishCard ref={cardRef} gap={12} onClick={handleClick}>
      <Box customStyle={{ position: 'relative', width: 48, height: 48 }}>
        <Avatar
          width={48}
          height={48}
          src={productResult.imageMain}
          alt="Recommend Wish Product Img"
          round={32}
          customStyle={{ minWidth: 48 }}
        />
        <Badge>
          {productResult.priceBefore ? (
            <Icon name="Arrow1DownOutlined" color="red-light" size="small" />
          ) : (
            <Icon name="StarFilled" color="primary" size="small" />
          )}
        </Badge>
      </Box>
      <Flexbox direction="vertical" gap={12} customStyle={{ flexGrow: 1 }}>
        <Title weight="regular">{getTitle(productResult)}</Title>
        {productResult.priceBefore ? (
          <Flexbox alignment="center" justifyContent="space-between">
            <Flexbox gap={4} customStyle={{ alignItems: 'baseline' }}>
              <Typography variant="h4" weight="bold" color="red-light">
                {`${getTenThousandUnitPrice(productResult.price)}만원`}
              </Typography>
              <Typography
                variant="body2"
                weight="medium"
                color="ui60"
                customStyle={{
                  textDecorationLine: 'line-through'
                }}
              >
                {`${getTenThousandUnitPrice(productResult.priceBefore)}만원`}
              </Typography>
            </Flexbox>
            <Typography variant="body2" color="ui60">
              {dayjs(productResult.datePosted).fromNow()}
            </Typography>
          </Flexbox>
        ) : (
          <Flexbox alignment="center" justifyContent="space-between">
            <Flexbox gap={8}>
              <Flexbox gap={2}>
                <Icon name="ViewOutlined" color="ui60" size="small" />
                <Typography variant="body2" weight="medium" color="ui60">
                  {commaNumber(productResult.viewCount || 0)}
                </Typography>
              </Flexbox>
              <Flexbox gap={2}>
                <Icon name="HeartOutlined" color="ui60" size="small" />
                <Typography variant="body2" weight="medium" color="ui60">
                  {commaNumber(productResult.wishCount || 0)}
                </Typography>
              </Flexbox>
              <Flexbox gap={2}>
                <Icon name="MessageOutlined" color="ui60" size="small" />
                <Typography variant="body2" weight="medium" color="ui60">
                  {commaNumber(productResult.purchaseCount || 0)}
                </Typography>
              </Flexbox>
            </Flexbox>
            <Typography variant="body2" color="ui60">
              {dayjs(productResult.datePosted).fromNow()}
            </Typography>
          </Flexbox>
        )}
      </Flexbox>
    </StyledHomeRecommendWishCard>
  );
}

const StyledHomeRecommendWishCard = styled(Flexbox)`
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
`;

const Title = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Badge = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg02};
  border-radius: 32px;
`;

export default HomeRecommendWishCard;
