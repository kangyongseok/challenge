import { useEffect } from 'react';

import { QueryClient, dehydrate, useMutation, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Box, Flexbox, useTheme } from 'mrcamel-ui';

import { SearchHelperPopup } from '@components/UI/organisms/Popups';
import { LegitInduceFloatingBanner } from '@components/UI/organisms';
import CamelSellerFloatingButton from '@components/UI/molecules/CamelSellerFloatingButton';
import { BottomNavigation } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  // HomePersonalProductCuration,
  HomeBrandsCategories,
  HomeCamelProductCuration,
  HomeEventBanner,
  HomeEventBannerBottomSheet,
  HomeFooter,
  HomeLegitLive,
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
import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import useQueryUserHistoryManages from '@hooks/useQueryUserHistoryManages';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function Home({ titleViewType }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
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
  const { mutate: mutatePostManage } = useMutation(postManage, {
    onSettled() {
      refetch().finally(() => {
        router.push('/searchHelper/onboarding');
      });
    }
  });

  const isViewSearchHelperOnboarding = () => {
    if (accessUser && userHistoryManage?.VIEW_SEARCH_HELPER) {
      mutatePostManage({ event: 'VIEW_SEARCH_HELPER', userId: accessUser.userId });

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
      <PageHead
        title="전국 중고명품 통합검색은 카멜에서"
        description="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
        ogTitle="전국 중고명품 통합검색은 카멜에서"
        ogDescription="여러분은 카멜에서 검색만 하세요. 전국 중고명품 매물은 카멜이 다 모아서 비교하고 분석해드릴게요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/main.webp`}
        ogUrl="https://mrcamel.co.kr"
        keywords="중고 명품, 빈티지 명품, 구찌, 샤넬, 루이비통, 보테가베네타, 톰브라운, 명품 중고, 중고 샤넬, 중고 루이비통, 중고 구찌, 중고 톰브라운, 중고 보테가베네타"
      />
      <GeneralTemplate
        footer={<BottomNavigation />}
        disablePadding
        customStyle={{ '& > main': { backgroundColor: common.uiWhite } }}
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
          <HomeLegitLive />
          <HomeBrandsCategories isViewSearchHelperOnboarding={isViewSearchHelperOnboarding} />
          <Box customStyle={{ height: 8 }} />
          <HomeEventBanner />
          <HomeCamelProductCuration />
          {/* <Box customStyle={{ height: 8 }} /> */}
          {/* <HomePersonalProductCuration /> */}
          <HomeFooter />
        </Flexbox>
      </GeneralTemplate>
      <HomeEventBannerBottomSheet />
      <SearchHelperPopup type="continue" />
      <LegitInduceFloatingBanner
        edgeSpacing={20}
        channelTalkPosition={-60}
        name={attrProperty.productName.MAIN}
      />
      <CamelSellerFloatingButton />
    </>
  );
}

export async function getServerSideProps({
  req,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  const queryClient = new QueryClient();
  const queryClientList: Promise<void>[] = [];

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);
  Initializer.initABTestIdentifierByCookie(req.cookies);

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
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient),
      titleViewType: Number((Math.random() % 2).toFixed(0))
    }
  };
}

export default Home;
