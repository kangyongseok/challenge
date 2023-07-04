import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Typography, useTheme } from '@mrcamelhub/camel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  SellerInfoProductsPanel,
  SellerInfoProfile,
  SellerInfoReviewsPanel,
  SellerInfoTabs
} from '@components/pages/sellerInfo';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchSellerInfo } from '@api/product';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  HEADER_HEIGHT,
  IOS_SAFE_AREA_TOP,
  TAB_HEIGHT
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserName, getUserScoreText } from '@utils/user';
import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import { commaNumber, isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';

function SellerInfo() {
  const {
    query: { tab = 'products' },
    query
  } = useRouter();
  const {
    theme: {
      palette: { common },
      zIndex
    }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const tabRef = useRef<null>(null);
  const triggered = useScrollTrigger({
    ref: tabRef,
    additionalOffsetTop:
      (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) -
      TAB_HEIGHT -
      (isExtendedLayoutIOSVersion()
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue('--sat').split('px')[0]
          )
        : 0),
    delay: 0
  });

  const sellerId = useMemo(() => Number(query.sellerId || ''), [query.sellerId]);
  const { data: { name, site, curnScore, maxScore, productCount, reviewCount } = {} } = useQuery(
    queryKeys.products.sellerInfo(sellerId),
    () => fetchSellerInfo(sellerId)
  );

  const { sellerName, scoreText, sellerProductCount, sellerReviewCount } = useMemo(
    () => ({
      sellerName: getUserName(name, sellerId),
      scoreText: getUserScoreText(Number(curnScore || ''), Number(maxScore || ''), site?.id || 0),
      sellerProductCount: commaNumber(productCount || 0),
      sellerReviewCount: commaNumber(reviewCount || 0)
    }),
    [curnScore, maxScore, name, productCount, reviewCount, sellerId, site?.id]
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
        description={`${scoreText} 총 ${sellerReviewCount}개의 후기를 받았고, ${sellerProductCount}개의 매물을 팔고 있어요.`}
        ogTitle={`판매자 ${sellerName} 후기와 평점 보기 | 카멜`}
        ogDescription={`${scoreText} 총 ${sellerReviewCount}개의 후기를 받았고, ${sellerProductCount}개의 매물을 팔고 있어요.`}
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      />
      <GeneralTemplate
        header={
          <>
            <Header
              hideTitle={!triggered}
              customStyle={{
                zIndex: triggered ? zIndex.header + 1 : 0,
                color: common.cmnW,
                overflow: 'hidden'
              }}
            >
              <Typography variant="h3" weight="bold" noWrap>
                {sellerName}
              </Typography>
            </Header>
            {triggered && (
              <SellerInfoTabs
                value={tab as string}
                sellerId={sellerId}
                productCount={sellerProductCount}
                reviewCount={sellerReviewCount}
                customStyle={{
                  position: 'fixed',
                  paddingTop: `calc(${HEADER_HEIGHT - 2}px + ${
                    isExtendedLayoutIOSVersion() ? IOS_SAFE_AREA_TOP : '0px'
                  })`,
                  width: '100%',
                  zIndex: zIndex.header
                }}
              />
            )}
          </>
        }
        footer={<BottomNavigation />}
        disablePadding
      >
        <SellerInfoProfile
          show={!triggered}
          platformId={site?.id || 0}
          platformImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/platforms/${site?.id}.png`}
          userName={sellerName}
          curnScore={curnScore}
          maxScore={Number(maxScore || '')}
        />
        <SellerInfoTabs
          ref={tabRef}
          value={tab as string}
          sellerId={sellerId}
          productCount={sellerProductCount}
          reviewCount={sellerReviewCount}
        />
        {tab === 'products' && <SellerInfoProductsPanel sellerId={sellerId} />}
        {tab === 'reviews' && <SellerInfoReviewsPanel sellerId={sellerId} />}
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
  const sellerId = String(query.sellerId);

  try {
    if (!/^[0-9]+$/.test(sellerId)) {
      return {
        notFound: true
      };
    }

    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    await queryClient.fetchQuery(queryKeys.products.sellerInfo(+sellerId), () =>
      fetchSellerInfo(+sellerId)
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        accessUser: getAccessUserByCookies(getCookies({ req }))
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default SellerInfo;
