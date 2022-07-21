import { useEffect } from 'react';

import { DehydratedState, QueryClient, dehydrate, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';

import SaveSearchList from '@components/UI/organisms/SaveSearchList';
import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { BottomNavigation } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  HomeAiCategories,
  HomeBrandList,
  HomeCamelProductCuration,
  HomeCategoryList,
  HomeFooter,
  HomePersonalProductCuration,
  HomeProductDealAlert,
  HomeWelcome
} from '@components/pages/home';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';
import { fetchProductKeywords, fetchUserInfo } from '@api/user';
import { fetchProductDealInfos } from '@api/nextJs';
import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { IS_NOT_FIRST_VISIT, SIGN_UP_STEP } from '@constants/localStorage';
import attrKeys from '@constants/attrKeys';

import checkAgent from '@utils/checkAgent';

import useQueryUserHistoryManages from '@hooks/useQueryUserHistoryManages';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Home() {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: userHistoryManage, refetch } = useQueryUserHistoryManages();
  const { mutate: mutatePostManage } = useMutation(postManage);

  const isViewSearchHelperOnboarding = () => {
    if (accessUser && userHistoryManage?.VIEW_SEARCH_HELPER) {
      mutatePostManage(
        { event: 'VIEW_SEARCH_HELPER', userId: accessUser.userId },
        {
          onSuccess() {
            refetch();
          }
        }
      );

      router.push('/searchHelper/onboarding');
      return true;
    }

    return false;
  };

  useEffect(() => {
    // 앱을 처음 실행한 경우 로그인 페이지로 이동
    const isNotFirstVisit = LocalStorage.get<boolean>(IS_NOT_FIRST_VISIT);

    if (checkAgent.isMobileApp() && !isNotFirstVisit) {
      LocalStorage.set(IS_NOT_FIRST_VISIT, true);
      router.replace('/login');
    }

    logEvent(attrKeys.home.VIEW_MAIN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 가입 온보딩 완료하지 않은 유저의 경우 온보딩 페이지로 이동
    const signUpStep = LocalStorage.get<number>(SIGN_UP_STEP);

    if (!!accessUser && typeof signUpStep === 'number') {
      router.replace(`/onboarding?step=${signUpStep}`);
    }
  }, [accessUser, router]);

  return (
    <>
      <GeneralTemplate
        footer={
          <>
            <HomeFooter />
            <BottomNavigation />
          </>
        }
      >
        <HomeWelcome isViewSearchHelperOnboarding={isViewSearchHelperOnboarding} />
        <HomeProductDealAlert />
        <SaveSearchList />
        <HomeBrandList isViewSearchHelperOnboarding={isViewSearchHelperOnboarding} />
        <HomeCategoryList isViewSearchHelperOnboarding={isViewSearchHelperOnboarding} />
        <HomeCamelProductCuration />
        <HomeAiCategories />
        <HomePersonalProductCuration />
      </GeneralTemplate>
      <SearchHelperPopup type="continue" />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
    await queryClient.prefetchQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords);
  }

  await queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories);
  await queryClient.prefetchQuery(queryKeys.nextJs.productDealInfos(), fetchProductDealInfos);

  const dehydratedState: DehydratedState = dehydrate(queryClient);

  return {
    props: {
      dehydratedState
    }
  };
}

export default Home;
