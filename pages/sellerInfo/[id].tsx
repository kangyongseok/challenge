import { useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';

import { QueryClient, dehydrate, useInfiniteQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Box, Typography, useTheme } from 'mrcamel-ui';

import Header from '@components/UI/molecules/Header';
import { BottomNavigation, Tabs } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SellerInfoPageHead,
  SellerInfoProductsPanel,
  SellerInfoReviewsPanel
} from '@components/pages/sellerInfo';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchReviewInfo, fetchSellerProducts } from '@api/product';

import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT, TAB_HEIGHT, locales } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

function SellerInfo() {
  const {
    theme: { zIndex }
  } = useTheme();
  const {
    query: { id, tab = 'products' },
    replace
  } = useRouter();

  useEffect(() => {
    if (tab === 'products') {
      logEvent(attrKeys.sellerInfo.VIEW_SELLER_PRODUCT, { name: 'SELLER_PRODUCT', sellerId: id });
    } else {
      logEvent(attrKeys.sellerInfo.VIEW_SELLER_REVIEW, { name: 'SELLER_REVIEW', sellerId: id });
    }
  }, [tab, id]);

  const params = {
    sellerId: Number(id || 0),
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
        sellerId: id
      });
    } else {
      logEvent(attrKeys.sellerInfo.CLICK_SELLER_PRODUCT, {
        name: 'SELLER_PRODUCT',
        att: 'TAB',
        sellerId: id
      });
    }

    replace({
      pathname: `/sellerInfo/${id}`,
      query: {
        tab: newValue
      }
    });
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
    <>
      <SellerInfoPageHead />
      <GeneralTemplate
        header={
          <Header>
            <Typography variant="h3" weight="bold" customStyle={{ textAlign: 'center' }}>
              판매자 정보
            </Typography>
          </Header>
        }
        footer={<BottomNavigation />}
        disablePadding
      >
        <Box
          component="section"
          customStyle={{
            minHeight: TAB_HEIGHT,
            zIndex: zIndex.header,
            paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0
          }}
        >
          <Tabs
            value={tab as string}
            changeValue={changeSelectedValue}
            labels={Labels}
            customStyle={{ position: 'fixed', width: '100%' }}
          />
        </Box>
        <Box
          customStyle={{
            padding: '0 20px',
            paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0
          }}
        >
          {tab === Labels[0].key && <SellerInfoProductsPanel />}
          {tab === Labels[1].key && <SellerInfoReviewsPanel />}
        </Box>
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({
  req,
  query,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  const params = {
    sellerId: Number(query.id || 0),
    size: 20
  };

  try {
    const data = await fetchReviewInfo(params);

    if (!data)
      return {
        notFound: true
      };

    queryClient.setQueryData(queryKeys.products.reviewInfo(params), {
      pages: [data],
      pageParams: [0]
    });

    return {
      props: {
        ...(await serverSideTranslations(locale || defaultLocale)),
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default SellerInfo;
