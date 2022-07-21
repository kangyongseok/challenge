import { useEffect, useRef, useState } from 'react';

import { useQuery } from 'react-query';
import { Alert, Avatar, Box, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Skeleton from '@components/UI/atoms/Skeleton';

import { fetchProductDealInfos } from '@api/nextJs';

import queryKeys from '@constants/queryKeys';

import commaNumber from '@utils/commaNumber';

function HomeProductDealAlert() {
  const {
    theme: { palette }
  } = useTheme();
  const [index, setIndex] = useState(0);

  const needInitProductDealInfosRef = useRef(false);
  const loopIntervalRef = useRef<ReturnType<typeof setTimeout> | null>();

  const { data: productDealInfos = [] } = useQuery(
    queryKeys.nextJs.productDealInfos(),
    fetchProductDealInfos
  );

  useEffect(() => {
    if (productDealInfos.length) {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }

      loopIntervalRef.current = setInterval(() => {
        setIndex((prevState) => {
          if (prevState + 1 === productDealInfos.length) {
            setIndex(0);
            needInitProductDealInfosRef.current = true;
          }
          return prevState + 1;
        });
      }, 2000);
    }
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, [productDealInfos]);

  return (
    <Box component="section" customStyle={{ marginTop: 24 }}>
      <Alert brandColor="grey">
        <Box customStyle={{ padding: '16px 24px' }}>
          <Flexbox alignment="center" justifyContent="space-between">
            <Box customStyle={{ flexGrow: 1 }}>
              <Typography weight="bold" customStyle={{ color: palette.common.grey['40'] }}>
                카멜을 통해서 득템했어요
              </Typography>
            </Box>
            <Box
              customStyle={{
                height: 15,
                overflow: 'hidden'
              }}
            >
              <ProductDealTransform index={index} dataHeight={15}>
                {productDealInfos.length === 0 && (
                  <Skeleton width="20px" height="15px" disableAspectRatio />
                )}
                {productDealInfos.length > 0 &&
                  productDealInfos.map(({ userId, time, timeUnit }, i) => (
                    <Typography
                      key={`product-deal-time-${userId + i}`}
                      variant="small2"
                      customStyle={{ height: 15, color: palette.common.grey['60'] }}
                    >
                      {`${time}${timeUnit}`}
                    </Typography>
                  ))}
              </ProductDealTransform>
            </Box>
          </Flexbox>
          <Box
            customStyle={{
              marginTop: 4,
              height: 20,
              overflow: 'hidden'
            }}
          >
            <ProductDealTransform index={index} dataHeight={24} gap={4}>
              {productDealInfos.length === 0 && (
                <Flexbox gap={6} alignment="center" customStyle={{ height: 24 }}>
                  <Skeleton width="20px" height="20px" disableAspectRatio />
                  <Skeleton width="100%" maxWidth="200px" height="20px" disableAspectRatio />
                </Flexbox>
              )}
              {productDealInfos.length > 0 &&
                productDealInfos.map(
                  ({
                    userId,
                    platform: { filename, name: platformName },
                    product: { state, name, price }
                  }) => (
                    <Flexbox key={`product-deal-${userId}`} gap={6} alignment="center">
                      <Avatar
                        width={20}
                        height={203}
                        src={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${filename}`}
                        alt={`${platformName}`}
                      />
                      <Typography variant="body2">
                        {`${userId}님 ${state} ${name} ${commaNumber(price)}만원`}
                      </Typography>
                    </Flexbox>
                  )
                )}
            </ProductDealTransform>
          </Box>
        </Box>
      </Alert>
    </Box>
  );
}

const ProductDealTransform = styled.div<{ dataHeight: number; gap?: number; index: number }>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => (gap ? `gap: ${gap}px` : '')};
  transition: transform 700ms ease-in-out;
  transform: ${({ dataHeight, index }) => `translate3d(0px, -${dataHeight * index}px, 0px)`};
`;

export default HomeProductDealAlert;
