import { useEffect, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Flexbox } from '@mrcamelhub/camel-ui';

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

import queryKeys from '@constants/queryKeys';
import { HEADER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import { commaNumber, isExtendedLayoutIOSVersion } from '@utils/common';

import useScrollTrigger from '@hooks/useScrollTrigger';
import useMyProfileInfo from '@hooks/userMyProfileInfo';
import useProductSellerType from '@hooks/useProductSellerType';

function UserShop() {
  const router = useRouter();

  const { userId, nickName, profileImage } = useMyProfileInfo();

  const {
    isLoading,
    refetch: refreshInfoByUserId,
    data: {
      userRoleLegit,
      area,
      shopDescription,
      displayProductCount = 0,
      undisplayProductCount = 0,
      reviewCount = 0,
      dateActivated = '',
      type
    } = {},
    data
  } = useQuery(queryKeys.users.infoByUserId(userId || 0), () => fetchInfoByUserId(userId || 0), {
    enabled: !!userId,
    refetchOnMount: true
  });

  const { isCertificationSeller } = useProductSellerType({ productSellerType: type });

  const tabRef = useRef<HTMLDivElement>(null);
  const triggered = useScrollTrigger({
    ref: tabRef,
    additionalOffsetTop:
      -(isExtendedLayoutIOSVersion()
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue('--sat').split('px')[0]
          )
        : 0) - HEADER_HEIGHT,
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
      title: `판매자 ${nickName} 후기와 평점 보기 | 카멜`,
      description: `평점 ${maxScore} 만점에 ${curnScore}점을 받은 판매자에요. 총 ${commaNumber(
        reviewCount
      )}의 후기를 받았고, ${commaNumber(displayProductCount)}개의 매물을 팔고 있어요.`
    };
  }, [curnScore, displayProductCount, maxScore, reviewCount, nickName]);

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
        ogImage={profileImage || ''}
      />
      <GeneralTemplate
        header={
          <UserShopHeader
            triggered={triggered}
            currentTab={tab}
            reviewCount={reviewCount}
            sellCount={displayProductCount}
            soldoutCount={undisplayProductCount}
          />
        }
        disablePadding
      >
        <Flexbox direction="vertical">
          {userRoleLegit ? (
            <UserShopLegitProfile
              isLoading={isLoading}
              title={title}
              description={description}
              curnScore={Number(curnScore || 0)}
              maxScore={Number(maxScore || 0)}
              areaName={area?.name}
              shopDescription={shopDescription || ''}
              dateActivated={dateActivated}
            />
          ) : (
            <UserShopProfile
              isLoading={isLoading}
              title={title}
              description={description}
              curnScore={Number(curnScore || 0)}
              maxScore={Number(maxScore || 0)}
              areaName={area?.name}
              shopDescription={shopDescription || ''}
              isCertificationSeller={isCertificationSeller}
              dateActivated={dateActivated}
            />
          )}
          <UserShopTabs
            ref={tabRef}
            value={tab}
            reviewCount={reviewCount}
            sellCount={displayProductCount}
            soldoutCount={undisplayProductCount}
          />
          {[tabLabels[0].key, tabLabels[1].key].includes(tab) && (
            <UserShopProductList tab={tab} refreshInfoByUserId={refreshInfoByUserId} />
          )}
          {tab === tabLabels[2].key && (
            <UserShopReviewList
              userId={userId || 0}
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
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {}
  };
}

export default UserShop;
