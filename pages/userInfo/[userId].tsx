import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Flexbox } from 'mrcamel-ui';

import { BottomNavigation } from '@components/UI/molecules';
import { PageHead } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  UserInfoHeader,
  UserInfoLegitProfile,
  UserInfoProductsPanel,
  UserInfoProfile,
  UserInfoReviewsPanel,
  UserInfoTabs
} from '@components/pages/userInfo';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchInfoByUserId } from '@api/user';

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  TAB_HEIGHT,
  locales
} from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserScoreText } from '@utils/user';
import { getCookies } from '@utils/cookies';
import { commaNumber, isExtendedLayoutIOSVersion } from '@utils/common';
import { getChannelUserName } from '@utils/channel';

import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';

function UserInfo() {
  const {
    query: { tab = 'products' },
    query
  } = useRouter();
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const tabRef = useRef<null>(null);
  const triggered = useScrollTrigger({
    ref: tabRef,
    additionalOffsetTop: (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) - TAB_HEIGHT,
    delay: 0
  });

  const userId = useMemo(() => Number(query.userId || ''), [query.userId]);
  const {
    data: {
      userRoleLegit,
      image,
      imageProfile,
      imageBackground,
      sellerType,
      name,
      area,
      shopDescription,
      curnScore,
      maxScore,
      productCount,
      reviewCount
    } = {}
  } = useQuery(queryKeys.users.infoByUserId(userId), () => fetchInfoByUserId(userId));

  const {
    userName,
    userImageProfile,
    userImageBackground,
    userArea,
    userShopDescription,
    userProductCount,
    userReviewCount,
    scoreText,
    isCertificationSeller
  } = useMemo(() => {
    const userImage = (!imageProfile?.split('/').includes('0.png') && imageProfile) || image || '';

    return {
      userName: getChannelUserName(name, userId),
      userImageProfile: userImage,
      userImageBackground:
        (!imageBackground?.split('/').includes('0.png') && imageBackground) ||
        (userImage.length > 0 && userImage) ||
        `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`,
      userArea: area?.name || '',
      userShopDescription: shopDescription || '',
      userProductCount: commaNumber(productCount || 0),
      userReviewCount: commaNumber(reviewCount || 0),
      scoreText: getUserScoreText(Number(curnScore || ''), Number(maxScore || ''), 0),
      isCertificationSeller:
        !!sellerType &&
        [productSellerType.certification, productSellerType.legit].includes(sellerType)
    };
  }, [
    area?.name,
    curnScore,
    image,
    imageBackground,
    imageProfile,
    maxScore,
    name,
    productCount,
    reviewCount,
    shopDescription,
    sellerType,
    userId
  ]);

  useEffect(() => {
    logEvent(attrKeys.userInfo.VIEW_PROFILE);
  }, []);

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
        title={`판매자 ${userName} 후기와 평점 보기 | 카멜`}
        description={`${scoreText} 총 ${userReviewCount}개의 후기를 받았고, ${userProductCount}개의 매물을 팔고 있어요.`}
        ogTitle={`판매자 ${userName} 후기와 평점 보기 | 카멜`}
        ogDescription={`${scoreText} 총 ${userReviewCount}개의 후기를 받았고, ${userProductCount}개의 매물을 팔고 있어요.`}
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
      />
      <GeneralTemplate
        header={
          <UserInfoHeader
            triggered={triggered}
            userName={userName}
            userImage={userImageProfile}
            currentTab={tab as string}
            userId={userId}
            productCount={userProductCount}
            reviewCount={userReviewCount}
          />
        }
        footer={<BottomNavigation />}
        disablePadding
      >
        <Flexbox
          direction="vertical"
          customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}
        >
          {userRoleLegit ? (
            <UserInfoLegitProfile
              imageProfile={userImageProfile}
              imageBackground={userImageBackground}
              userId={userId}
              nickName={userName}
              areaName={userArea}
              shopDescription={userShopDescription}
              curnScore={Number(curnScore || '')}
              maxScore={Number(maxScore || '')}
            />
          ) : (
            <UserInfoProfile
              imageProfile={userImageProfile}
              imageBackground={userImageBackground}
              nickName={userName}
              areaName={userArea}
              shopDescription={userShopDescription}
              isCertificationSeller={isCertificationSeller}
              curnScore={Number(curnScore || '')}
              maxScore={Number(maxScore || '')}
            />
          )}
          <UserInfoTabs
            ref={tabRef}
            value={tab as string}
            userId={userId}
            productCount={userProductCount}
            reviewCount={userReviewCount}
          />
          {tab === 'products' && <UserInfoProductsPanel userId={userId} />}
          {tab === 'reviews' && <UserInfoReviewsPanel userId={userId} />}
        </Flexbox>
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

      if (infoData) {
        queryClient.setQueryData(queryKeys.users.infoByUserId(+userId), infoData);

        return {
          props: {
            ...(await serverSideTranslations(locale || defaultLocale)),
            dehydratedState: dehydrate(queryClient)
          }
        };
      }
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
