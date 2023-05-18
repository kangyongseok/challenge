import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Flexbox, Icon, Image, Typography } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

import type { ProductResult } from '@dto/product';

import SessionStorage from '@library/sessionStorage';
import { logEvent } from '@library/amplitude';

import { productSellerType } from '@constants/user';
import sessionStorageKeys from '@constants/sessionStorageKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductType } from '@utils/products';
import { getTenThousandUnitPrice } from '@utils/formats';
import { commaNumber, getProductDetailUrl } from '@utils/common';

function getTitle({ priceBefore, price, purchaseCount = 0 }: ProductResult) {
  if (priceBefore) {
    return `가격이 <span>${commaNumber(
      getTenThousandUnitPrice(priceBefore - price)
    )}만원</span> 하락했어요! 📉`;
  }
  if (purchaseCount >= 6) {
    return `<span>${commaNumber(purchaseCount)}명</span>이나 사고 싶어 해요! 💸`;
  }

  return '사람들이 관심 있게 보고 있어요 👀';
}

interface HomeRecommendWishCardProps {
  index: number;
  productResult: ProductResult;
  onClick: (excludeId: number) => () => void;
  customStyle?: CustomStyle;
}

function HomeRecommendWishCard({
  index,
  productResult,
  onClick,
  customStyle
}: HomeRecommendWishCardProps) {
  const router = useRouter();

  const {
    palette: { secondary }
  } = useTheme();

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
      // eslint-disable-next-line no-nested-ternary
      att: priceBefore ? 'PRICELOW' : productResult.purchaseCount >= 6 ? 'HOT' : 'WISHALARM',
      index,
      data: {
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
        useChat: sellerType !== productSellerType.collection,
        source: attrProperty.source.MAIN_WISH
      }
    });
    SessionStorage.set(sessionStorageKeys.productDetailEventProperties, {
      source: attrProperty.source.MAIN_WISH
    });
    onClick(id)();
    router.push(getProductDetailUrl({ product: productResult, type: 'productResult' }));
  };

  useEffect(() => {
    logEvent(attrKeys.home.VIEW_WISHPRODUCT, {
      name: attrProperty.name.MAIN,
      title: attrProperty.title.WISHPRODUCT,
      // eslint-disable-next-line no-nested-ternary
      att: productResult.priceBefore
        ? 'PRICELOW'
        : productResult.purchaseCount >= 6
        ? 'HOT'
        : 'WISHALARM',
      index
    });
  }, [index, productResult.priceBefore, productResult.purchaseCount]);

  return (
    <StyledHomeRecommendWishCard ref={cardRef} gap={16} onClick={handleClick} css={customStyle}>
      <Image
        width={50}
        height={60}
        src={productResult.imageMain || productResult.imageThumbnail}
        alt="Recommend Wish Product Img"
        round={8}
        disableAspectRatio
        customStyle={{
          minWidth: 50
        }}
      />
      <Flexbox
        direction="vertical"
        gap={8}
        customStyle={{
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        <Flexbox direction="vertical" gap={2}>
          <Typography
            variant="h4"
            weight="bold"
            noWrap
            customStyle={{
              '& > span': {
                color: secondary.red.light
              }
            }}
            dangerouslySetInnerHTML={{ __html: getTitle(productResult) }}
          />
          <Typography variant="body2" color="ui60" noWrap>
            {productResult.title}
          </Typography>
        </Flexbox>
        {productResult.priceBefore ? (
          <Flexbox alignment="center" justifyContent="space-between">
            <Flexbox gap={4} alignment="baseline">
              <Flexbox alignment="baseline" gap={4}>
                <Typography variant="h3" weight="bold">
                  {`${getTenThousandUnitPrice(productResult.price)}만원`}
                </Typography>
                <Typography
                  weight="medium"
                  color="ui80"
                  customStyle={{
                    textDecorationLine: 'line-through'
                  }}
                >
                  {`${getTenThousandUnitPrice(productResult.priceBefore)}만원`}
                </Typography>
              </Flexbox>
            </Flexbox>
            <Typography variant="body2" color="ui60">
              {dayjs(productResult.datePosted).fromNow()}
            </Typography>
          </Flexbox>
        ) : (
          <Flexbox alignment="center" justifyContent="space-between">
            <Typography variant="h3" weight="bold">
              {`${getTenThousandUnitPrice(productResult.price)}만원`}
            </Typography>
            <Flexbox gap={8}>
              <Typography
                variant="body2"
                color={productResult.purchaseCount >= 6 ? 'ui60' : 'red-light'}
              >
                조회 {commaNumber(productResult.viewCount || 0)}
              </Typography>
              <Flexbox gap={2} alignment="center">
                <Icon
                  name="HeartFilled"
                  width={14}
                  height={14}
                  color={productResult.purchaseCount >= 6 ? 'ui80' : 'red-light'}
                />
                <Typography
                  variant="body2"
                  color={productResult.purchaseCount >= 6 ? 'ui60' : 'red-light'}
                >
                  {commaNumber(productResult.wishCount || 0)}
                </Typography>
              </Flexbox>
              <Flexbox gap={2} alignment="center">
                <Icon
                  name="MessageFilled"
                  width={14}
                  height={14}
                  color={productResult.purchaseCount >= 6 ? 'red-light' : 'ui80'}
                />
                <Typography
                  variant="body2"
                  color={productResult.purchaseCount >= 6 ? 'red-light' : 'ui60'}
                >
                  {commaNumber(productResult.purchaseCount || 0)}
                </Typography>
              </Flexbox>
            </Flexbox>
          </Flexbox>
        )}
      </Flexbox>
    </StyledHomeRecommendWishCard>
  );
}

const StyledHomeRecommendWishCard = styled(Flexbox)`
  max-height: 110px;
  min-height: 110px;
  padding: 20px;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.bg01};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
`;

export default HomeRecommendWishCard;
