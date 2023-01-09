import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Tab, TabGroup, Typography } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
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

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, TAB_HEIGHT, locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserScoreText } from '@utils/user';
import { getCookies } from '@utils/cookies';
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
  const { data: { name, site, type, curnScore, maxScore, productCount, reviewCount, image } = {} } =
    useQuery(queryKeys.products.sellerInfo(sellerId), () => fetchSellerInfo(sellerId));

  const { sellerName, scoreText } = useMemo(
    () => ({
      sellerName: getChannelUserName(name, sellerId),
      scoreText: getUserScoreText(Number(curnScore || ''), Number(maxScore || ''), site?.id || 0)
    }),
    [curnScore, maxScore, name, sellerId, site?.id]
  );

  const changeSelectedValue = useCallback(
    (newValue: string | number) => {
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
              profileImage={
                type === productSellerType.collection
                  ? `https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${site?.id}.png`
                  : image
              }
              userName={sellerName}
              isCertificationSeller={type === productSellerType.certification}
              curnScore={Number(curnScore || '')}
              maxScore={Number(maxScore || '')}
            />
          </>
        }
        footer={<BottomNavigation />}
        disablePadding
      >
        <TabGroup ref={tabRef} value={tab as string} onChange={changeSelectedValue} fullWidth>
          <Tab text={`매물 ${productCount || 0}개`} value="products" />
          <Tab text={`후기 ${reviewCount || 0}개`} value="reviews" />
        </TabGroup>
        {tab === 'products' && <SellerInfoProductsPanel sellerId={sellerId} />}
        {tab === 'reviews' && <SellerInfoReviewsPanel sellerId={sellerId} />}
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

    Initializer.initAccessTokenByCookies(getCookies({ req }));
    Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

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
