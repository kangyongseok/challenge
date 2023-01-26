import { useEffect, useMemo } from 'react';

import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import dayjs from 'dayjs';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { BottomNavigation, CamelSellerFloatingButton } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  HomeFollowingPanel,
  HomeFooter,
  HomeLegitContinueDialog,
  HomeRecommendPanel,
  HomeSearchHeader,
  HomeTabs
} from '@components/pages/home';

import SessionStorage from '@library/sessionStorage';
import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';

import { postManage } from '@api/userHistory';
import { fetchSimpleUserInfo } from '@api/user';
import { fetchProduct } from '@api/product';

import sessionStorageKeys from '@constants/sessionStorageKeys';
import queryKeys from '@constants/queryKeys';
import { IS_NOT_FIRST_VISIT, SIGN_UP_STEP } from '@constants/localStorage';
import { locales } from '@constants/common';

import { getCookies } from '@utils/cookies';
import { checkAgent } from '@utils/common';

import { CreateChannelParams } from '@typings/channel';
import useQueryAccessUser from '@hooks/useQueryAccessUser';
import useMutationCreateChannel from '@hooks/useMutationCreateChannel';

function Home() {
  const router = useRouter();
  const { tab } = router.query;

  const { data: { isNewUser } = {} } = useQuery(
    queryKeys.users.simpleUserInfo(),
    fetchSimpleUserInfo
  );
  const { data: accessUser } = useQueryAccessUser();

  const { mutate: mutatePostManage } = useMutation(postManage);
  const { mutate: mutateCreateChannel } = useMutationCreateChannel();

  const currentTab = useMemo(() => {
    if (!tab) {
      if (isNewUser || isNewUser === undefined) {
        return 'recommend';
      }
      return 'following';
    }
    return tab;
  }, [tab, isNewUser]);

  useEffect(() => {
    const isNotFirstVisit = LocalStorage.get<boolean>(IS_NOT_FIRST_VISIT);
    if (!SessionStorage.get(sessionStorageKeys.personalProductsCache)) {
      SessionStorage.set(
        sessionStorageKeys.personalProductsCache,
        dayjs().format('YYYY-MM-DD HH:mm')
      );
    }
    if (checkAgent.isMobileApp() && !isNotFirstVisit) {
      LocalStorage.set(IS_NOT_FIRST_VISIT, true);
      router.replace('/appIntro/step');
    }
    return () => SessionStorage.remove(sessionStorageKeys.personalProductsCache);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 가입 온보딩 완료하지 않은 유저의 경우 온보딩 페이지로 이동
    const signUpStep = LocalStorage.get<number>(SIGN_UP_STEP);

    if (!!accessUser && typeof signUpStep === 'number') {
      router.replace(`/onboarding?step=${signUpStep}`);
    }
  }, [accessUser, router]);

  useEffect(() => {
    const isNotFirstVisit = LocalStorage.get<boolean>(IS_NOT_FIRST_VISIT);
    const signUpStep = LocalStorage.get<number>(SIGN_UP_STEP);

    const savedCreateChannelParams = SessionStorage.get<Omit<CreateChannelParams, 'userId'>>(
      sessionStorageKeys.savedCreateChannelParams
    );

    if (
      !(
        (checkAgent.isMobileApp() && !isNotFirstVisit) ||
        (!!accessUser && typeof signUpStep === 'number')
      ) &&
      !!accessUser &&
      !!savedCreateChannelParams
    ) {
      SessionStorage.remove(sessionStorageKeys.savedCreateChannelParams);

      if (accessUser.userId !== +savedCreateChannelParams.targetUserId) return;

      fetchProduct({ productId: +savedCreateChannelParams.productId }).then((resultProduct) => {
        const channelId = (resultProduct.channels || []).find(
          (channel) => channel.userId === accessUser.userId
        )?.id;

        if (channelId) {
          if (checkAgent.isIOSApp()) {
            window.webkit?.messageHandlers?.callChannel?.postMessage?.(`/channels/${channelId}`);
          } else {
            router.push(`/channels/${channelId}`);
          }
        } else {
          mutateCreateChannel({
            userId: String(accessUser.userId || 0),
            ...savedCreateChannelParams
          });
        }
      });
    } else {
      setTimeout(() => SessionStorage.remove(sessionStorageKeys.savedCreateChannelParams), 1000);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mutatePostManage({ event: 'VIEW_MAIN' });
  }, [mutatePostManage]);

  return (
    <>
      <PageHead
        title="전국 중고명품 통합검색은 카멜에서"
        description="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
        ogTitle="전국 중고명품 통합검색은 카멜에서"
        ogDescription="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
        keywords="중고 명품, 빈티지 명품, 구찌, 샤넬, 루이비통, 보테가베네타, 톰브라운, 명품 중고, 중고 샤넬, 중고 루이비통, 중고 구찌, 중고 톰브라운, 중고 보테가베네타"
      />
      <GeneralTemplate footer={<BottomNavigation />} disablePadding>
        <HomeTabs />
        <HomeSearchHeader />
        {currentTab === 'recommend' && <HomeRecommendPanel />}
        {currentTab === 'following' && <HomeFollowingPanel />}
        {(checkAgent.isAndroidApp() || checkAgent.isIOSApp()) && <HomeFooter />}
      </GeneralTemplate>
      <SearchHelperPopup type="continue" />
      <CamelSellerFloatingButton source="MAIN" />
      <HomeLegitContinueDialog />
    </>
  );
}

export async function getServerSideProps({
  req,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);
  Initializer.initABTestIdentifierByCookie(getCookies({ req }));

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.simpleUserInfo(), fetchSimpleUserInfo);
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default Home;
