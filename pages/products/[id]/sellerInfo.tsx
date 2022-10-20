import { MouseEvent, useEffect, useMemo } from 'react';

import { useRecoilValue } from 'recoil';
import { useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import { Box, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Header from '@components/UI/molecules/Header';
import { BottomNavigation, Tabs } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import SellerReviewsPanel from '@components/pages/sellerInfo/SellerReviewsPanel';
import SellerProductsPanel from '@components/pages/sellerInfo/SellerProductsPanel';

import { logEvent } from '@library/amplitude';

import { fetchReviewInfo, fetchSellerProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, locales } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';

function SellerInfoPage() {
  const {
    query: { id: sellerId, tab },
    replace
  } = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  useEffect(() => {
    if (tab === 'products') {
      logEvent(attrKeys.sellerInfo.VIEW_SELLER_PRODUCT, { name: 'SELLER_PRODUCT', sellerId });
    } else {
      logEvent(attrKeys.sellerInfo.VIEW_SELLER_REVIEW, { name: 'SELLER_REVIEW', sellerId });
    }
  }, [tab, sellerId]);

  const params = {
    sellerId: Number(sellerId || 0),
    size: 20
  };

  const { data: { pages = [] } = {} } = useInfiniteQuery(
    queryKeys.products.sellerProducts(params),
    async ({ pageParam = 0 }) => fetchSellerProducts({ ...params, page: pageParam }),
    {
      enabled: !!params.sellerId
    }
  );
  const { data: { pages: reviewPages = [] } = {} } = useInfiniteQuery(
    queryKeys.products.reviewInfo(params),
    async ({ pageParam = 0 }) => fetchReviewInfo({ ...params, page: pageParam }),
    {
      enabled: !!params.sellerId
    }
  );

  const lastPage = useMemo(() => pages[pages.length - 1], [pages]);
  const reviewsLastPage = useMemo(() => reviewPages[reviewPages.length - 1], [reviewPages]);

  const changeSelectedValue = (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
    if (tab === 'products') {
      logEvent(attrKeys.sellerInfo.CLICK_SELLER_REVIEW, {
        name: 'SELLER_REVIEW',
        att: 'TAB',
        sellerId
      });
    } else {
      logEvent(attrKeys.sellerInfo.CLICK_SELLER_PRODUCT, {
        name: 'SELLER_PRODUCT',
        att: 'TAB',
        sellerId
      });
    }

    replace(`/products/${sellerId}/sellerInfo?tab=${newValue}`);
    window.scrollTo(0, 0);
  };

  const Labels = [
    {
      key: 'products',
      value: `매물 ${lastPage ? lastPage.totalElements : 0}개`
    },
    {
      key: 'reviews',
      value: `후기 ${
        reviewsLastPage
          ? reviewsLastPage.totalCount || reviewsLastPage.sellerReviews.totalElements
          : 0
      }개`
    }
  ];

  return (
    <GeneralTemplate
      header={
        <Header>
          <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
            판매자 정보
          </Typography>
        </Header>
      }
      footer={<BottomNavigation />}
    >
      <TabsWrapper showAppDownloadBanner={showAppDownloadBanner}>
        <Tabs value={tab as string} changeValue={changeSelectedValue} labels={Labels} />
      </TabsWrapper>
      <Box customStyle={{ marginTop: 41 }}>
        {tab === Labels[0].key && <SellerProductsPanel />}
        {tab === Labels[1].key && <SellerReviewsPanel />}
        {null}
      </Box>
    </GeneralTemplate>
  );
}

const TabsWrapper = styled(Box)<{ showAppDownloadBanner: boolean }>`
  position: fixed;
  top: ${({ showAppDownloadBanner }) =>
    showAppDownloadBanner ? 56 + APP_DOWNLOAD_BANNER_HEIGHT : 56}px;
  width: 100%;
  z-index: 11;
  margin-left: -20px;
`;

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  };
}

export async function getStaticProps({
  locale,
  defaultLocale = locales.ko.lng
}: GetStaticPropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

export default SellerInfoPage;
