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
  UserInfoProductsPanel,
  UserInfoProfile,
  UserInfoReviewsPanel
} from '@components/pages/userInfo';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchInfoByUserId } from '@api/user';

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

function UserInfo() {
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

  const userId = useMemo(() => Number(query.userId || ''), [query.userId]);
  const { data: { image, type, name, curnScore, maxScore, productCount, reviewCount } = {} } =
    useQuery(queryKeys.users.infoByUserId(userId), () => fetchInfoByUserId(userId));

  const { sellerName, scoreText } = useMemo(
    () => ({
      sellerName: getChannelUserName(name, userId),
      scoreText: getUserScoreText(Number(curnScore || ''), Number(maxScore || ''), 0)
    }),
    [curnScore, maxScore, name, userId]
  );

  const changeSelectedValue = useCallback(
    (newValue: string | number) => {
      if (tab === 'products') {
        logEvent(attrKeys.userInfo.CLICK_SELLER_REVIEW, {
          name: attrProperty.name.SELLER_REVIEW,
          att: 'TAB',
          userId
        });
      } else {
        logEvent(attrKeys.userInfo.CLICK_SELLER_PRODUCT, {
          name: attrProperty.name.SELLER_PRODUCT,
          att: 'TAB',
          userId
        });
      }

      replace({
        pathname: `/userInfo/${userId}`,
        query: {
          tab: newValue
        }
      }).then(() => window.scrollTo(0, 0));
    },
    [replace, tab, userId]
  );

  useEffect(() => {
    if (tab === 'products') {
      logEvent(attrKeys.userInfo.VIEW_SELLER_PRODUCT, {
        name: attrProperty.name.SELLER_PRODUCT,
        userId
      });
    } else {
      logEvent(attrKeys.userInfo.VIEW_SELLER_REVIEW, {
        name: attrProperty.name.SELLER_REVIEW,
        userId
      });
    }
  }, [tab, userId]);

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
              <Typography variant="h3" weight="bold">
                {sellerName}
              </Typography>
            </Header>
            <UserInfoProfile
              show={!triggered}
              isCertificationSeller={type === 3}
              userName={sellerName}
              userImage={
                image ||
                `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-image.png`
              }
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
        {tab === 'products' && <UserInfoProductsPanel userId={userId} />}
        {tab === 'reviews' && <UserInfoReviewsPanel userId={userId} />}
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
  const userId = String(query.userId);

  if (/^[0-9]+$/.test(userId)) {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));
    Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

    try {
      const infoData = await fetchInfoByUserId(+userId);

      if (!infoData) {
        return {
          ...(await serverSideTranslations(locale || defaultLocale)),
          notFound: true
        };
      }

      queryClient.setQueryData(queryKeys.users.infoByUserId(+userId), infoData);

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

export default UserInfo;
