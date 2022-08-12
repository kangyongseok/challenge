import { useEffect } from 'react';

import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box, Flexbox } from 'mrcamel-ui';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { BottomNavigation } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { MyPortfolioCommonBanner } from '@components/pages/myPortfolio';
import {
  HomeBrandsCategories,
  HomeCamelProductCuration,
  HomeFooter,
  // HomePersonalProductCuration,
  HomeProductLegitLive,
  HomeProductsKeywordList,
  HomeRecentSearchList,
  HomeRecommendationsWishes,
  HomeWelcome
} from '@components/pages/home';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postManage } from '@api/userHistory';
import { fetchProductKeywords, fetchRecommWishes, fetchUserInfo } from '@api/user';
import { fetchProductDealInfos } from '@api/nextJs';
import { fetchParentCategories } from '@api/category';

import queryKeys from '@constants/queryKeys';
import { IS_NOT_FIRST_VISIT, SIGN_UP_STEP } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import checkAgent from '@utils/checkAgent';

import useQueryUserHistoryManages from '@hooks/useQueryUserHistoryManages';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Home({ titleViewType }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { data: accessUser } = useQueryAccessUser();
  const { data: userHistoryManage, refetch } = useQueryUserHistoryManages();
  const {
    data: { content: productKeywords = [] } = {},
    isLoading: isLoadingProductKeywords,
    isFetched: isFetchedProductKeywords
  } = useQuery(queryKeys.users.userProductKeywords(), fetchProductKeywords, {
    enabled: !!accessUser
  });
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
        disablePadding
      >
        <Flexbox direction="vertical" gap={12} customStyle={{ userSelect: 'none' }}>
          <HomeWelcome
            isViewSearchHelperOnboarding={isViewSearchHelperOnboarding}
            titleViewType={titleViewType}
          />
          <HomeRecommendationsWishes />
          {!!accessUser &&
          (isLoadingProductKeywords || (isFetchedProductKeywords && productKeywords.length > 0)) ? (
            <HomeProductsKeywordList />
          ) : (
            <HomeRecentSearchList />
          )}
          <HomeProductLegitLive />
          <HomeBrandsCategories isViewSearchHelperOnboarding={isViewSearchHelperOnboarding} />
          <Box customStyle={{ height: 8 }} />
          <MyPortfolioCommonBanner name={attrProperty.productName.MAIN} />
          <HomeCamelProductCuration />
          {/* <Box customStyle={{ height: 8 }} /> */}
          {/* <HomePersonalProductCuration /> */}
        </Flexbox>
      </GeneralTemplate>
      <SearchHelperPopup type="continue" />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const queryClientList: Promise<void>[] = [];

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    queryClientList.concat([
      queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo),
      queryClient.prefetchQuery(queryKeys.users.recommWishes(), fetchRecommWishes)
    ]);
  }

  queryClientList.concat([
    queryClient.prefetchQuery(queryKeys.nextJs.productDealInfos(), fetchProductDealInfos),
    queryClient.prefetchQuery(queryKeys.categories.parentCategories(), fetchParentCategories)
  ]);

  await Promise.allSettled(queryClientList);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      titleViewType: Number((Math.random() % 2).toFixed(0))
    }
  };
}

export default Home;
