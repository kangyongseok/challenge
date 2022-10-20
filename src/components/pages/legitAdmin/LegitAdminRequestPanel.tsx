import { useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilState } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Chip, Flexbox, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { LegitStatusCard, LegitStatusCardSkeleton } from '@components/UI/molecules';
import Skeleton from '@components/UI/atoms/Skeleton';

import { fetchRequestProductLegits } from '@api/productLegit';

import queryKeys from '@constants/queryKeys';

import { commaNumber, getProductDetailUrl } from '@utils/common';

import { legitRequestParamsState } from '@recoil/legitRequest';
import useQueryUserInfo from '@hooks/useQueryUserInfo';

function LegitAdminRequestPanel() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  const { data: { roles = [] } = {} } = useQueryUserInfo();

  const [params, setLegitRequestParamsState] = useRecoilState(legitRequestParamsState);

  const isHead = useMemo(() => (roles as string[]).includes('PRODUCT_LEGIT_HEAD'), [roles]);

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    queryKeys.productLegits.requestLegits(params),
    ({ pageParam = 0 }) =>
      fetchRequestProductLegits({
        ...params,
        page: pageParam
      }),
    {
      refetchOnMount: true,
      getNextPageParam: (data) => {
        const {
          productLegits: { number = 0, totalPages = 0 }
        } = data || {};

        return number < totalPages - 1 ? number + 1 : undefined;
      }
    }
  );

  const productLegits = useMemo(
    () => pages.map(({ productLegits: { content = [] } }) => content).flat(),
    [pages]
  );

  const lastPage = useMemo(() => pages[pages.length - 1] || {}, [pages]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const dataId = Number(e.currentTarget.getAttribute('data-id') || 0);

    const findProductLegit = productLegits.find(({ productId }) => productId === dataId);

    if (!findProductLegit) return;

    if (findProductLegit.status === 30) {
      router.push(
        `/legit${getProductDetailUrl({
          type: 'productResult',
          product: findProductLegit.productResult
        }).replace('/products', '')}/result`
      );
    } else {
      router.push(`/legit/admin/request/${dataId}`);
    }
  };

  const handleClickChip = (e: MouseEvent<HTMLButtonElement>) => {
    const dataStatus = Number(e.currentTarget.getAttribute('data-status') || 0);

    if ((params.status || []).includes(dataStatus)) {
      const newParams = { ...params };
      delete newParams.status;
      setLegitRequestParamsState(newParams);
      return;
    }

    setLegitRequestParamsState((prevState) => ({
      ...prevState,
      status: [dataStatus]
    }));
  };

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
    <Box component="section" customStyle={{ margin: '20px 0', padding: '0 20px' }}>
      <FilterChipList>
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              // eslint-disable-next-line react/no-array-index-key
              key={`product-legit-filter-chip-skeleton-${index}`}
              width="81.53px"
              height="32px"
              disableAspectRatio
              customStyle={{ borderRadius: 16 }}
            />
          ))}
        {!isLoading && isHead && (
          <>
            <Chip
              variant={(params.status || []).includes(10) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(10) ? 'black' : undefined}
              // TODO 추후 UI 라이브러리에 props 구현
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(10) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntPreConfirm}
                </Typography>
              }
              data-status={10}
              onClick={handleClickChip}
            >
              감정신청
            </Chip>
            <Chip
              variant={(params.status || []).includes(21) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(21) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(21) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntAuthenticatingOpinion}
                </Typography>
              }
              data-status={21}
              onClick={handleClickChip}
            >
              작성완료
            </Chip>
            <Chip
              variant={(params.status || []).includes(12) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(12) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(12) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntPreConfirmEdit}
                </Typography>
              }
              data-status={12}
              onClick={handleClickChip}
            >
              보완요청
            </Chip>
            <Chip
              variant={(params.status || []).includes(13) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(13) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(13) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntPreConfirmEditDone}
                </Typography>
              }
              data-status={13}
              onClick={handleClickChip}
            >
              보완완료
            </Chip>
            <Chip
              variant={(params.status || []).includes(30) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(30) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(30) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntAuthorized}
                </Typography>
              }
              data-status={30}
              onClick={handleClickChip}
            >
              감정완료
            </Chip>
          </>
        )}
        {!isLoading && !isHead && (
          <>
            <Chip
              variant={(params.status || []).includes(20) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(20) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(20) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntAuthenticating}
                </Typography>
              }
              data-status={20}
              onClick={handleClickChip}
            >
              감정신청
            </Chip>
            <Chip
              variant={(params.status || []).includes(21) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(21) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(21) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntAuthenticatingOpinion}
                </Typography>
              }
              data-status={21}
              onClick={handleClickChip}
            >
              작성완료
            </Chip>
            <Chip
              variant={(params.status || []).includes(30) ? 'contained' : 'outlinedGhost'}
              brandColor={(params.status || []).includes(30) ? 'black' : undefined}
              endIcon={
                <Typography
                  variant="small2"
                  weight="medium"
                  customStyle={{
                    color: (params.status || []).includes(30) ? common.cmnW : undefined
                  }}
                >
                  {lastPage.cntAuthorized}
                </Typography>
              }
              data-status={30}
              onClick={handleClickChip}
            >
              감정완료
            </Chip>
          </>
        )}
      </FilterChipList>
      <Typography variant="body2" weight="bold" customStyle={{ marginTop: 20 }}>
        전체 {commaNumber(((lastPage || {}).productLegits || {}).totalElements || 0)}개
      </Typography>
      <Flexbox direction="vertical" gap={20} customStyle={{ marginTop: 20 }}>
        {isLoading &&
          Array.from({
            length: 20
          }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <LegitStatusCardSkeleton key={`product-legit-skeleton-${index}`} />
          ))}
        {!isLoading &&
          productLegits.map((productLegit) => (
            <LegitStatusCard
              key={`product-legit-${productLegit.productId}`}
              productLegit={productLegit}
              data-id={productLegit.productId}
              onClick={handleClick}
              useInAdmin
            />
          ))}
      </Flexbox>
    </Box>
  );
}

const FilterChipList = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 6px;
  max-width: fit-content;
  margin: 0 -20px;
  padding: 0 20px;
  overflow-x: auto;

  & * {
    white-space: nowrap;
  }
`;

export default LegitAdminRequestPanel;
