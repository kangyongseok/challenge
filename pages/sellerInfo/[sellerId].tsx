import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { MouseEvent } from 'react';

import { useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Box, Typography } from 'mrcamel-ui';

import { BottomNavigation, Header, Tabs } from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SellerInfoProductsPanel,
  SellerInfoProfile,
  SellerInfoReviewsPanel
} from '@components/pages/sellerInfo';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchSellerInfo } from '@api/product';

import { SELLER_STATUS } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, TAB_HEIGHT, locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserScoreText } from '@utils/user';
import { commaNumber } from '@utils/common';
import { getChannelUserName } from '@utils/channel';

import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';

function SellerInfo() {
  const {
    query: { tab = 'products' },
    query,
    replace
  } = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const tabRef = useRef<null>(null);
  const triggered = useScrollTrigger({
    ref: tabRef,
    additionalOffsetTop: (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) - TAB_HEIGHT,
    delay: 0
  });

  const sellerId = useMemo(() => Number(query.sellerId || ''), [query.sellerId]);
  const { data: { name, site, type, curnScore, maxScore, productCount, reviewCount } = {} } =
    useQuery(queryKeys.products.sellerInfo(sellerId), () => fetchSellerInfo(sellerId));

  const { sellerName, scoreText, labels } = useMemo(
    () => ({
      sellerName: getChannelUserName(name, sellerId),
      scoreText: getUserScoreText(Number(curnScore || ''), Number(maxScore || ''), site?.id || 0),
      labels: [
        { key: 'products', value: `매물 ${productCount || 0}개` },
        { key: 'reviews', value: `후기 ${reviewCount || 0}개` }
      ]
    }),
    [curnScore, maxScore, name, productCount, reviewCount, sellerId, site?.id]
  );

  const changeSelectedValue = useCallback(
    (_: MouseEvent<HTMLButtonElement> | null, newValue: string) => {
      if (tab === 'products') {
        logEvent(attrKeys.sellerInfo.CLICK_SELLER_REVIEW, {
          name: attrProperty.name.SELLER_REVIEW,
          att: 'TAB',
          sellerId
        });
      } else {
        logEvent(attrKeys.sellerInfo.CLICK_SELLER_PRODUCT, {
          name: attrProperty.name.SELLER_PRODUCT,
          att: 'TAB',
          sellerId
        });
      }

      replace({
        pathname: `/sellerInfo/${sellerId}`,
        query: {
          tab: newValue
        }
      }).then(() => window.scrollTo(0, 0));
    },
    [sellerId, replace, tab]
  );

  useEffect(() => {
    if (tab === 'products') {
      logEvent(attrKeys.sellerInfo.VIEW_SELLER_PRODUCT, {
        name: attrProperty.name.SELLER_PRODUCT,
        sellerId
      });
    } else {
      logEvent(attrKeys.sellerInfo.VIEW_SELLER_REVIEW, {
        name: attrProperty.name.SELLER_REVIEW,
        sellerId
      });
    }
  }, [tab, sellerId]);

  return (
    <>
      <PageHead
        title={`판매자 ${sellerName} 후기와 평점 보기 | 카멜`}
        description={`${scoreText} 총 ${commaNumber(
          reviewCount || 0
        )}개의 후기를 받았고, ${commaNumber(productCount || 0)}개의 매물을 팔고 있어요.`}
        ogTitle={`판매자 ${sellerName} 후기와 평점 보기 | 카멜`}
        ogDescription={`${scoreText} 총 ${commaNumber(
          reviewCount || 0
        )}개의 후기를 받았고, ${commaNumber(productCount || 0)}개의 매물을 팔고 있어요.`}
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      />
      <GeneralTemplate
        header={
          <>
            <Header hideTitle={!triggered}>
              <Typography variant="h3" weight="bold" customStyle={{ zIndex: 10 }}>
                {sellerName}
              </Typography>
            </Header>
            <SellerInfoProfile
              show={!triggered}
              platformId={site?.id || 0}
              userName={sellerName}
              isCamelSeller={
                SELLER_STATUS[type as keyof typeof SELLER_STATUS] === SELLER_STATUS['3']
              }
              curnScore={Number(curnScore || '')}
              maxScore={Number(maxScore || '')}
            />
          </>
        }
        footer={<BottomNavigation />}
        disablePadding
      >
        <Box ref={tabRef} component="section" customStyle={{ minHeight: TAB_HEIGHT, zIndex: 1 }}>
          <Tabs value={tab as string} changeValue={changeSelectedValue} labels={labels} />
        </Box>
        {tab === labels[0].key && <SellerInfoProductsPanel sellerId={sellerId} />}
        {tab === labels[1].key && <SellerInfoReviewsPanel sellerId={sellerId} />}
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
  const sellerId = String(query.sellerId);

  if (/^[0-9]+$/.test(sellerId)) {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(req.cookies);
    Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

    try {
      const infoData = await fetchSellerInfo(+sellerId);

      if (!infoData) {
        return {
          ...(await serverSideTranslations(locale || defaultLocale)),
          notFound: true
        };
      }

      queryClient.setQueryData(queryKeys.products.sellerInfo(+sellerId), infoData);

      return {
        props: {
          ...(await serverSideTranslations(locale || defaultLocale)),
          dehydratedState: dehydrate(queryClient)
        }
      };
    } catch {
      //
    }
  }

  return {
    ...(await serverSideTranslations(locale || defaultLocale)),
    notFound: true
  };
}

export default SellerInfo;
