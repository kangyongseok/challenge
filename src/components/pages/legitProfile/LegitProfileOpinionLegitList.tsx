import { forwardRef, useCallback, useEffect, useMemo } from 'react';

import { useRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { Image, Skeleton } from '@components/UI/atoms';

import type { ProductResult } from '@dto/product';

import { logEvent } from '@library/amplitude';

import { fetchOpinionLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getProductDetailUrl } from '@utils/common';

import {
  defaultLegitProfileOpinionLegitsParamsState,
  legitProfileOpinionLegitsParamsState
} from '@recoil/legitProfile';

interface LegitProfileOpinionLegitListProps {
  userId: number;
  customStyle?: CustomStyle;
}

const legitFilters = [
  { result: 1, status: 30, label: '정품의견' },
  { result: 2, status: 30, label: '가품의심' },
  { result: 0, status: 20, label: '감정진행중' }
];

const LegitProfileOpinionLegitList = forwardRef<HTMLElement, LegitProfileOpinionLegitListProps>(
  function LegitProfileOpinionLegitList({ userId, customStyle }, ref) {
    const router = useRouter();
    const {
      theme: {
        palette: { common }
      }
    } = useTheme();

    const [params, setLegitProfileOpinionLegitsParamsState] = useRecoilState(
      legitProfileOpinionLegitsParamsState
    );

    const activeParams = useMemo(() => {
      if (!params.results || !params.results.length)
        return { ...defaultLegitProfileOpinionLegitsParamsState, userIds: params.userIds };
      return { ...params, status: Array.from(new Set(params.status || [])) };
    }, [params]);

    const {
      data: { pages = [] } = {},
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading
    } = useInfiniteQuery(
      queryKeys.productLegits.opinionLegits(activeParams),
      ({ pageParam = 0 }) =>
        fetchOpinionLegits({
          ...activeParams,
          page: pageParam
        }),
      {
        enabled: activeParams.userIds.length > 0,
        staleTime: 5 * 60 * 1000,
        getNextPageParam: (data) => {
          const { number = 0, totalPages = 0 } = data || {};

          return number < totalPages - 1 ? number + 1 : undefined;
        },
        onSuccess() {
          logEvent(attrKeys.legit.LOAD_LEGIT_INFO, {
            name: attrProperty.legitName.LEGIT_PROFILE
          });
        }
      }
    );

    const legitProducts = useMemo(() => pages.map(({ content }) => content).flat(), [pages]);

    const handleClick = (status: number, result: number) => () => {
      const getAtt = () => {
        if (status === 20) {
          return '감정진행중';
        }
        if (result === 1) {
          return '정품의견';
        }
        if (result === 2) {
          return '가품의심';
        }
        return 'NONE';
      };

      logEvent(attrKeys.legitProfile.CLICK_LEGIT_FILTER, {
        name: attrProperty.name.LEGIT_PROFILE,
        att: getAtt()
      });

      setLegitProfileOpinionLegitsParamsState((prevState) => {
        const prevStatus = [...(prevState.status || [])];
        const prevResults = [...(prevState.results || [])];

        const hasAlreadyResult = prevResults.some((number) => number === result);

        if (hasAlreadyResult) prevStatus.splice(prevStatus.lastIndexOf(status), 1);

        return {
          ...prevState,
          status: hasAlreadyResult ? prevStatus : [...prevStatus, status],
          results: hasAlreadyResult
            ? prevResults.filter((number) => number !== result)
            : [...prevResults, result]
        };
      });
    };

    const handleClickProduct = useCallback(
      ({ product }: { product: ProductResult }) =>
        () => {
          logEvent(attrKeys.legit.CLICK_LEGIT_INFO, {
            name: attrProperty.legitName.LEGIT_PROFILE
          });

          router.push(
            `/legit${getProductDetailUrl({ type: 'productResult', product }).replace(
              '/products',
              ''
            )}/result`
          );
        },
      [router]
    );

    useEffect(() => {
      setLegitProfileOpinionLegitsParamsState((prevState) => ({
        ...prevState,
        userIds: [userId]
      }));
    }, [setLegitProfileOpinionLegitsParamsState, userId]);

    useEffect(() => {
      const handleScroll = async () => {
        const { scrollHeight, scrollTop, clientHeight } = document.documentElement;

        const isFloor = scrollTop + clientHeight >= scrollHeight;

        if (hasNextPage && !isFetchingNextPage && isFloor) {
          await fetchNextPage();
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    return (
      <Wrapper
        ref={ref}
        css={!isLoading && legitProducts.length === 0 ? { ...customStyle, flex: 1 } : customStyle}
      >
        {isLoading && (
          <Flexbox gap={6} customStyle={{ marginBottom: 20 }}>
            <Skeleton
              width="80px"
              height="32px"
              disableAspectRatio
              customStyle={{ borderRadius: 16 }}
            />
            <Skeleton
              width="80px"
              height="32px"
              disableAspectRatio
              customStyle={{ borderRadius: 16 }}
            />
            <Skeleton
              width="80px"
              height="32px"
              disableAspectRatio
              customStyle={{ borderRadius: 16 }}
            />
          </Flexbox>
        )}
        {!isLoading && legitProducts.length > 0 && (
          <Flexbox gap={6} customStyle={{ marginBottom: 20 }}>
            {legitFilters.map(({ label, result, status }) => (
              <Chip
                key={`legit-select-label-${label}`}
                weight="regular"
                disabled={isLoading}
                variant={(params.results || []).includes(result) ? 'contained' : 'outlined'}
                brandColor={(params.results || []).includes(result) ? 'black' : 'gray'}
                onClick={handleClick(status, result)}
              >
                {label}
              </Chip>
            ))}
          </Flexbox>
        )}
        <Flexbox direction="vertical" gap={20}>
          {isLoading &&
            Array.from({ length: 16 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Flexbox key={`user-legit-opinion-skeleton-${index}`} gap={12}>
                <Skeleton width="100px" height="100px" isRound disableAspectRatio />
                <Box customStyle={{ flexGrow: 1 }}>
                  <Skeleton width="58px" height="18px" isRound disableAspectRatio />
                  <Skeleton
                    width="100%"
                    maxWidth="220px"
                    height="16px"
                    isRound
                    disableAspectRatio
                    customStyle={{ marginTop: 4 }}
                  />
                  <Skeleton
                    width="100%"
                    maxWidth="220px"
                    height="24px"
                    isRound
                    disableAspectRatio
                    customStyle={{ marginTop: 8 }}
                  />
                </Box>
              </Flexbox>
            ))}
          {!isLoading &&
            legitProducts.map(({ productId, productResult, status, legitOpinions = [] }) => {
              const { result: opinionResult, description } =
                legitOpinions.find(({ roleLegit }) => roleLegit.userId === userId) || {};

              return (
                <Flexbox
                  key={`user-legit-opinion-${productId}`}
                  gap={12}
                  onClick={handleClickProduct({ product: productResult })}
                >
                  <Box customStyle={{ minWidth: 100, maxWidth: 100, height: 100 }}>
                    <Image
                      variant="backgroundImage"
                      src={productResult.imageThumbnail || productResult.imageMain}
                      alt="User Legit Product Img"
                      customStyle={{
                        borderRadius: 8
                      }}
                    />
                  </Box>
                  <div>
                    {opinionResult === 1 && (
                      <Label
                        variant="darked"
                        // TODO UI 라이브러리 업데이트 필요
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        text={
                          <Flexbox alignment="center" gap={2}>
                            <Icon name="OpinionAuthenticOutlined" width={12} height={12} />
                            <Typography
                              variant="small2"
                              weight="medium"
                              customStyle={{
                                color: common.cmnW
                              }}
                            >
                              정품의견
                            </Typography>
                          </Flexbox>
                        }
                        size="xsmall"
                      />
                    )}
                    {opinionResult === 2 && (
                      <Label
                        variant="darked"
                        brandColor="red"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        text={
                          <Flexbox alignment="center" gap={2}>
                            <Icon name="OpinionFakeOutlined" width={12} height={12} />
                            <Typography
                              variant="small2"
                              weight="medium"
                              customStyle={{
                                color: common.cmnW
                              }}
                            >
                              가품의심
                            </Typography>
                          </Flexbox>
                        }
                        size="xsmall"
                      />
                    )}
                    {status === 20 && (
                      <Label
                        variant="contained"
                        brandColor="black"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        text={
                          <Flexbox alignment="center" gap={2}>
                            <Icon name="OpinionImpossibleOutlined" width={12} height={12} />
                            <Typography
                              variant="small2"
                              weight="medium"
                              customStyle={{
                                color: common.cmnW
                              }}
                            >
                              감정중
                            </Typography>
                          </Flexbox>
                        }
                        size="xsmall"
                      />
                    )}
                    <Typography variant="body2" weight="medium" customStyle={{ marginTop: 4 }}>
                      {productResult.title}
                    </Typography>
                    <Description variant="small2" weight="medium">
                      {description}
                    </Description>
                  </div>
                </Flexbox>
              );
            })}
        </Flexbox>
        {!isLoading && legitProducts.length === 0 && (
          <Flexbox justifyContent="center" alignment="center" customStyle={{ marginTop: 52 }}>
            <Typography variant="h2" weight="bold" customStyle={{ color: common.ui80 }}>
              감정이력이 없습니다.
            </Typography>
          </Flexbox>
        )}
      </Wrapper>
    );
  }
);

const Wrapper = styled.section`
  padding: 26px 20px 35px;
  background-color: ${({ theme }) => theme.palette.common.cmnW};
  margin-top: -44px;
  z-index: 2;
`;

const Description = styled(Typography)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-top: 8px;
  overflow: hidden;
  word-break: break-all;
  color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui60};
`;

export default LegitProfileOpinionLegitList;
