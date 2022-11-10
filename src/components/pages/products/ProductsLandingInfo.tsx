import { useRecoilValue } from 'recoil';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import { fetchSearchOptions } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  HEADER_HEIGHT,
  PRODUCTS_LANDING_INFO_HEIGHT
} from '@constants/common';

import { productsFilterProgressDoneState, searchParamsStateFamily } from '@recoil/productsFilter';
import { showAppDownloadBannerState } from '@recoil/common';

function ProductsLandingInfo() {
  const router = useRouter();
  const atomParam = router.asPath.split('?')[0];
  const { keyword } = router.query;

  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  const { searchParams: searchOptionsParams } = useRecoilValue(
    searchParamsStateFamily(`searchOptions-${atomParam}`)
  );
  const progressDone = useRecoilValue(productsFilterProgressDoneState);
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const { isFetched, data: { productTotal = 0 } = {} } = useQuery(
    queryKeys.products.searchOptions(searchOptionsParams),
    () => fetchSearchOptions(searchOptionsParams),
    {
      keepPreviousData: true,
      enabled: Object.keys(searchOptionsParams).length > 0,
      staleTime: 5 * 60 * 1000
    }
  );

  return (
    <Box customStyle={{ minHeight: PRODUCTS_LANDING_INFO_HEIGHT, position: 'relative' }}>
      <Wrapper showAppDownloadBanner={showAppDownloadBanner}>
        <Typography weight="medium" customStyle={{ color: common.ui60 }}>
          대한민국 모든 중고매물 한번에 비교중!
        </Typography>
        <Typography variant="h3" weight="bold" brandColor="primary">
          {keyword}
        </Typography>
        <Typography variant="h3" weight="bold">
          {isFetched && progressDone
            ? `전체 ${productTotal.toLocaleString()}개`
            : '매물 검색 중...'}
        </Typography>
      </Wrapper>
    </Box>
  );
}

const Wrapper = styled.div<{ showAppDownloadBanner: boolean }>`
  padding: 16px 20px;
  position: fixed;
  background-color: ${({ theme }) => theme.palette.common.uiWhite};
  z-index: ${({ theme }) => theme.zIndex.header};
  width: 100%;
  border-bottom: 2px solid ${({ theme }) => theme.palette.primary.main};
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT}px;
`;

export default ProductsLandingInfo;
