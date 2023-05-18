import { useMemo } from 'react';

import { Box, Flexbox, Image, Skeleton, Typography, useTheme } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import { Product } from '@dto/product';
import { OrderDetail } from '@dto/order';

import { getTenThousandUnitPrice } from '@utils/formats';
import {
  checkAgent,
  commaNumber,
  getImagePathStaticParser,
  getProductDetailUrl
} from '@utils/common';

function OrderProductCard({
  orderDetail,
  platform,
  product
}: {
  orderDetail: OrderDetail;
  platform: { id: number; name: string };
  product?: Product;
}) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { brandName, imagePath, productName, productPrice } = useMemo(() => {
    const productBrandName = orderDetail?.data.split('|')[0];
    const productImagePath = orderDetail?.data.split('|')[1];

    const parseCapitalLetter = productBrandName
      ?.split(' ')
      .map(
        (splitNameEng) =>
          `${splitNameEng.charAt(0).toUpperCase()}${splitNameEng.slice(1, splitNameEng.length)}`
      )
      .join(' ');

    return {
      brandName: parseCapitalLetter,
      imagePath: getImagePathStaticParser(productImagePath),
      productName: orderDetail?.name,
      productPrice: orderDetail?.price
    };
  }, [orderDetail]);

  const handleClickToPlatform = () => {
    let userAgent = 0;

    if (checkAgent.isIOSApp()) userAgent = 1;
    if (checkAgent.isAndroidApp()) userAgent = 2;

    if (product)
      window.open(
        `${getProductDetailUrl({ product })}?redirect=1&userAgent=${userAgent}`,
        '_blank'
      );
  };

  return (
    <CardWrap>
      <Flexbox
        gap={16}
        alignment="center"
        customStyle={{ borderBottom: `1px solid ${common.line01}`, paddingBottom: 20 }}
        onClick={handleClickToPlatform}
      >
        <Image
          disableAspectRatio
          src={imagePath}
          alt={`${brandName} | ${productName}`}
          width={60}
          height={72}
          customStyle={{ borderRadius: 8 }}
        />
        <Flexbox direction="vertical" gap={2}>
          <Typography weight="bold" variant="body2">
            {brandName}
          </Typography>
          <Typography variant="body2" color="ui60">
            {productName}
          </Typography>
          <Typography weight="bold" variant="h3">
            {commaNumber(getTenThousandUnitPrice(productPrice))}만원
          </Typography>
        </Flexbox>
        <Box customStyle={{ marginLeft: 'auto' }}>
          <OutLink />
        </Box>
      </Flexbox>
      <Flexbox customStyle={{ marginTop: 20, height: 32 }} gap={4}>
        {platform.name ? (
          <>
            <Image
              width={16}
              height={16}
              src={
                platform.id
                  ? `https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${platform.id}.png`
                  : ''
              }
              alt={`${platform.name || 'Platform'} Logo Img`}
              fallbackElement={<Box customStyle={{ width: 16, height: 16 }} />}
              disableAspectRatio
            />
            <Typography color="ui60" variant="body2">
              판매자님의 {platform.name} 매물에 입력된 연락처로 주문서가 전송되었습니다.
            </Typography>
          </>
        ) : (
          <Skeleton disableAspectRatio height={32} round={4} customStyle={{ width: '100%' }} />
        )}
      </Flexbox>
    </CardWrap>
  );
}

const CardWrap = styled.div`
  border: 1px solid
    ${({
      theme: {
        palette: { common }
      }
    }) => common.line01};
  border-radius: 8px;
  padding: 20px;
`;

function OutLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.333344 2.00001C0.333344 1.07954 1.07954 0.333344 2.00001 0.333344H3.66668V2.00001H2.00001V12H12V10.3333H13.6667V12C13.6667 12.9205 12.9205 13.6667 12 13.6667H2.00001C1.07954 13.6667 0.333344 12.9205 0.333344 12V2.00001Z"
        fill="#7B7D85"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.00001 0.333344H13.6667V7.00001H12V3.17852L6.16668 9.01185L4.98817 7.83334L10.8215 2.00001H7.00001V0.333344Z"
        fill="#7B7D85"
      />
    </svg>
  );
}

export default OrderProductCard;
