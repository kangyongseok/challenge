import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Flexbox } from '@mrcamelhub/camel-ui';

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
import { APP_DOWNLOAD_BANNER_HEIGHT, DEFAUT_BACKGROUND_IMAGE, TAB_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getUserName, getUserScoreText } from '@utils/user';
import { getCookies } from '@utils/cookies';
import { commaNumber, hasImageFile, isExtendedLayoutIOSVersion } from '@utils/common';

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
      reviewCount,
      dateActivated
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
    const userImage =
      (hasImageFile(imageProfile) && imageProfile) || (hasImageFile(image) && image) || '';

    return {
      userName: getUserName(name, userId),
      userImageProfile: userImage,
      userImageBackground:
        (hasImageFile(imageBackground) && imageBackground) ||
        (userImage.length > 0 && userImage) ||
        DEFAUT_BACKGROUND_IMAGE,
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
            isCertificationSeller={isCertificationSeller}
            dateActivated={dateActivated as string}
          />
        }
        footer={<BottomNavigation />}
        disablePadding
      >
        <Flexbox direction="vertical">
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
              dateActivated={dateActivated as string}
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
              dateActivated={dateActivated as string}
            />
          )}
          <UserInfoTabs
            ref={tabRef}
            value={tab as string}
            userId={userId}
            productCount={userProductCount}
            reviewCount={userReviewCount}
            isCertificationSeller={isCertificationSeller}
          />
          {tab === 'products' && <UserInfoProductsPanel userId={userId} />}
          {tab === 'reviews' && <UserInfoReviewsPanel userId={userId} />}
        </Flexbox>
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
  const userId = String(query.userId);

  try {
    if (!/^[0-9]+$/.test(userId)) {
      return {
        notFound: true
      };
    }

    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    await queryClient.fetchQuery(queryKeys.users.infoByUserId(+userId), () =>
      fetchInfoByUserId(+userId)
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient)
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default UserInfo;
