import { useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Flexbox } from 'mrcamel-ui';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';

import { MyShopAppDownloadDialog } from '@components/UI/organisms';
import { CamelSellerFloatingButton } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  UserShopHeader,
  UserShopLegitProfile,
  UserShopProductDeleteConfirmDialog,
  UserShopProductList,
  UserShopProfile,
  UserShopReviewList,
  UserShopTabs
} from '@components/pages/userShop';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchInfoByUserId } from '@api/user';

import { productSellerType } from '@constants/user';
import queryKeys from '@constants/queryKeys';
import { APP_TOP_STATUS_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { commaNumber, isExtendedLayoutIOSVersion } from '@utils/common';

import useScrollTrigger from '@hooks/useScrollTrigger';
import useRedirectVC from '@hooks/useRedirectVC';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function UserShop() {
  const router = useRouter();

  useRedirectVC('/user/shop');

  const { userId = 0, userNickName, userImageProfile, userImageBackground } = useQueryMyUserInfo();

  const {
    isLoading,
    refetch: refreshInfoByUserId,
    data: {
      userRoleLegit,
      area,
      shopDescription,
      sellerType,
      displayProductCount = 0,
      undisplayProductCount = 0,
      reviewCount = 0
    } = {},
    data
  } = useQuery(queryKeys.users.infoByUserId(userId), () => fetchInfoByUserId(userId), {
    enabled: !!userId,
    refetchOnMount: true
  });

  const tabRef = useRef<HTMLDivElement>(null);
  const triggered = useScrollTrigger({
    ref: tabRef,
    additionalOffsetTop:
      (isExtendedLayoutIOSVersion() ? -APP_TOP_STATUS_HEIGHT : 0) + -HEADER_HEIGHT,
    delay: 0
  });

  const tabLabels = useMemo(() => {
    return [
      { key: '0', value: `판매중 ${displayProductCount}` },
      { key: '1', value: `판매완료 ${undisplayProductCount}` },
      { key: '2', value: `후기 ${reviewCount}` }
    ];
  }, [displayProductCount, undisplayProductCount, reviewCount]);

  const { tab, curnScore, maxScore } = useMemo(() => {
    return {
      tab: String(router.query.tab || tabLabels[0].key),
      curnScore: Number(data?.curnScore || 0),
      maxScore: Number(data?.maxScore || 0)
    };
  }, [data?.curnScore, data?.maxScore, router.query.tab, tabLabels]);

  const { title, description } = useMemo(() => {
    return {
      title: `판매자 ${userNickName} 후기와 평점 보기 | 카멜`,
      description: `평점 ${maxScore} 만점에 ${curnScore}점을 받은 판매자에요. 총 ${commaNumber(
        reviewCount
      )}의 후기를 받았고, ${commaNumber(displayProductCount)}개의 매물을 팔고 있어요.`
    };
  }, [curnScore, displayProductCount, maxScore, reviewCount, userNickName]);

  const logEventTabTitles = ['SALE', 'SOLD', 'REVIEW'];

  useEffect(() => {
    logEvent(attrKeys.userShop.VIEW_MY_STORE, {
      name: attrProperty.name.MY_STORE,
      title: logEventTabTitles[Number(tab)]
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, userId]);

  return (
    <>
      <PageHead
        title={title}
        description={description}
        ogTitle={title}
        ogDescription={description}
        ogImage={userImageProfile}
      />
      <GeneralTemplate
        header={
          <UserShopHeader
            triggered={triggered}
            imageProfile={userImageProfile}
            nickName={userNickName}
            currentTab={tab}
            sellCount={displayProductCount}
            soldoutCount={undisplayProductCount}
            reviewCount={reviewCount}
          />
        }
        disablePadding
      >
        <Flexbox
          direction="vertical"
          customStyle={{ paddingTop: isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0 }}
        >
          {userRoleLegit ? (
            <UserShopLegitProfile
              isLoading={isLoading}
              title={title}
              description={description}
              imageProfile={userImageProfile}
              imageBackground={userImageBackground}
              nickName={userNickName}
              curnScore={Number(curnScore || 0)}
              maxScore={Number(maxScore || 0)}
              areaName={area?.name}
              shopDescription={shopDescription || ''}
            />
          ) : (
            <UserShopProfile
              isLoading={isLoading}
              title={title}
              description={description}
              imageProfile={userImageProfile}
              imageBackground={userImageBackground}
              nickName={userNickName}
              curnScore={Number(curnScore || 0)}
              maxScore={Number(maxScore || 0)}
              areaName={area?.name}
              shopDescription={shopDescription || ''}
              isCertificationSeller={sellerType === productSellerType.certification}
            />
          )}
          <UserShopTabs
            ref={tabRef}
            value={tab}
            sellCount={displayProductCount}
            soldoutCount={undisplayProductCount}
            reviewCount={reviewCount}
          />
          {[tabLabels[0].key, tabLabels[1].key].includes(tab) && (
            <UserShopProductList tab={tab} refreshInfoByUserId={refreshInfoByUserId} />
          )}
          {tab === tabLabels[2].key && (
            <UserShopReviewList
              userId={userId}
              reviewCount={reviewCount}
              curnScore={curnScore}
              maxScore={maxScore}
            />
          )}
        </Flexbox>
      </GeneralTemplate>
      <UserShopProductDeleteConfirmDialog />
      <CamelSellerFloatingButton
        attributes={{
          name: attrProperty.name.MY_STORE,
          title: attrProperty.title.MY_STORE_FLOATING,
          source: 'SHOP'
        }}
      />
      <MyShopAppDownloadDialog />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  const accessUser = Initializer.initAccessUserInQueryClientByCookies(
    getCookies({ req }),
    queryClient
  );

  if (!accessUser) {
    return {
      redirect: {
        destination: '/login?returnUrl=/user/shop&isRequiredLogin=true',
        permanent: false
      }
    };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default UserShop;
