import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { Flexbox } from 'mrcamel-ui';

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

import { getUserName } from '@utils/user';
import { getCookies } from '@utils/cookies';
import { commaNumber, hasImageFile, isExtendedLayoutIOSVersion } from '@utils/common';

import { toastState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function UserShop() {
  const router = useRouter();

  const { data: accessUser } = useQueryAccessUser();
  const setToastState = useRecoilValue(toastState);

  const userId = useMemo(() => accessUser?.userId || 0, [accessUser?.userId]);
  const {
    isLoading,
    refetch,
    data: {
      userRoleLegit,
      image,
      imageProfile,
      imageBackground,
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

  const tabRef = useRef<null | HTMLDivElement>(null);
  const triggered = useScrollTrigger({
    ref: tabRef,
    additionalOffsetTop:
      (isExtendedLayoutIOSVersion() ? -APP_TOP_STATUS_HEIGHT : 0) + -HEADER_HEIGHT,
    delay: 0
  });

  const { userImageProfile, userImageBackground, labels, tab, nickName, curnScore, maxScore } =
    useMemo(() => {
      const tabLabels = [
        { key: '0', value: `판매중 ${displayProductCount}` },
        { key: '1', value: `판매완료 ${undisplayProductCount}` },
        { key: '2', value: `후기 ${reviewCount}` }
      ];
      const userImage =
        (hasImageFile(imageProfile) && imageProfile) || (hasImageFile(image) && image) || '';

      return {
        userImageProfile: userImage,
        userImageBackground:
          imageBackground ||
          (userImage.length > 0 && userImage) ||
          `https://${process.env.IMAGE_DOMAIN}/assets/images/user/shop/profile-background.png`,
        labels: tabLabels,
        tab: String(router.query.tab || tabLabels[0].key),
        nickName: getUserName(data?.nickName || data?.name, userId),
        curnScore: Number(data?.curnScore || 0),
        maxScore: Number(data?.maxScore || 0)
      };
    }, [
      displayProductCount,
      undisplayProductCount,
      reviewCount,
      imageProfile,
      image,
      imageBackground,
      router.query.tab,
      data?.nickName,
      data?.name,
      data?.curnScore,
      data?.maxScore,
      userId
    ]);
  const { title, description } = useMemo(() => {
    return {
      title: `판매자 ${nickName} 후기와 평점 보기 | 카멜`,
      description: `평점 ${maxScore} 만점에 ${curnScore}점을 받은 판매자에요. 총 ${commaNumber(
        reviewCount
      )}의 후기를 받았고, ${commaNumber(displayProductCount)}개의 매물을 팔고 있어요.`
    };
  }, [nickName, maxScore, curnScore, reviewCount, displayProductCount]);

  useEffect(() => {
    if (setToastState.status) {
      refetch();
    }
  }, [setToastState, refetch]);

  useEffect(() => {
    if (tab === '2') {
      logEvent(attrKeys.userShop.VIEW_MY_STORE, {
        name: attrProperty.name.MY_STORE,
        title: attrProperty.title.REVIEW
      });
    } else {
      logEvent(attrKeys.userShop.VIEW_MY_STORE, {
        name: attrProperty.name.MY_STORE,
        title: attrProperty.title.PRODUCT
      });
    }
  }, [tab, userId]);

  return (
    <>
      <PageHead
        title={title}
        description={description}
        ogTitle={title}
        ogDescription={description}
        ogImage={imageProfile || image}
      />
      <GeneralTemplate
        header={
          <UserShopHeader
            triggered={triggered}
            imageProfile={imageProfile || image || ''}
            nickName={nickName}
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
              nickName={nickName}
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
              nickName={nickName}
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
          {[labels[0].key, labels[1].key].includes(tab) && <UserShopProductList tab={tab} />}
          {tab === labels[2].key && (
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
      <CamelSellerFloatingButton source="SHOP" />
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
