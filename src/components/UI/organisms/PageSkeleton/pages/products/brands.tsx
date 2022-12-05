import { useRecoilValue } from 'recoil';
import { Box, Flexbox, Grid, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

import {
  BottomNavigation,
  Header,
  LinearProgress,
  ProductGridCardSkeleton
} from '@components/UI/molecules';
import { Gap, Skeleton } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { ProductsFilter } from '@components/pages/products';

import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  CATEGORY_TAGS_HEIGHT,
  HEADER_HEIGHT
} from '@constants/common';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';

function BrandProducts() {
  const {
    theme: { zIndex }
  } = useTheme();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  return (
    <GeneralTemplate
      header={
        <div>
          <Header>
            <Skeleton
              width="45px"
              height="24px"
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
            />
          </Header>
          <Box
            component="section"
            customStyle={{ minHeight: CATEGORY_TAGS_HEIGHT + 8, position: 'relative' }}
          >
            <Wrapper showAppDownloadBanner={showAppDownloadBanner}>
              <CategoryTags>
                <Skeleton
                  width="24px"
                  height="24px"
                  disableAspectRatio
                  customStyle={{ borderRadius: 8 }}
                />
                <Skeleton
                  width="37px"
                  height="24px"
                  disableAspectRatio
                  customStyle={{ borderRadius: 8 }}
                />
                <Skeleton
                  width="33px"
                  height="24px"
                  disableAspectRatio
                  customStyle={{ borderRadius: 8 }}
                />
                <Skeleton
                  width="37px"
                  height="24px"
                  disableAspectRatio
                  customStyle={{ borderRadius: 8 }}
                />
                <Skeleton
                  width="37px"
                  height="24px"
                  disableAspectRatio
                  customStyle={{ borderRadius: 8 }}
                />
              </CategoryTags>
            </Wrapper>
            <Gap
              height={8}
              customStyle={{
                position: 'fixed',
                marginTop: CATEGORY_TAGS_HEIGHT,
                zIndex: zIndex.header,
                top: showAppDownloadBanner
                  ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT
                  : HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)
              }}
            />
          </Box>
          <ProductsFilter variant="brands" showDynamicFilter />
        </div>
      }
      footer={
        <BottomNavigation
          disableHideOnScroll={false}
          disableProductsKeywordClickInterceptor={false}
        />
      }
      disablePadding
    >
      <Gap height={8} />
      <Flexbox
        justifyContent="space-between"
        customStyle={{
          position: 'relative',
          padding: '16px 20px'
        }}
      >
        <LinearProgress value={0} customStyle={{ position: 'absolute', top: 0, left: 0 }} />
        <Typography variant="body2" weight="medium">
          매물 검색 중...
        </Typography>
      </Flexbox>
      <Grid container rowGap={32}>
        {Array.from({ length: 10 }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid key={`product-card-skeleton-${index}`} item xs={2}>
            <ProductGridCardSkeleton />
          </Grid>
        ))}
      </Grid>
      <Gap height={8} />
    </GeneralTemplate>
  );
}

const Wrapper = styled.div<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  background-color: ${({ theme: { palette } }) => palette.common.uiWhite};
  height: ${CATEGORY_TAGS_HEIGHT}px;
  min-height: ${CATEGORY_TAGS_HEIGHT}px;
  z-index: ${({ theme: { zIndex } }) => zIndex.header};
  width: 100%;
  overflow-x: auto;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner
      ? APP_DOWNLOAD_BANNER_HEIGHT + HEADER_HEIGHT
      : HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)}px;
`;

const CategoryTags = styled.div`
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  column-gap: 20px;
  width: fit-content;
`;

export default BrandProducts;
