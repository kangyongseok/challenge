import { useEffect } from 'react';

import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { useMutation } from '@tanstack/react-query';
import { Box } from '@mrcamelhub/camel-ui';

import { BottomNavigation } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  HomeDogHoneyProductGrid,
  HomeErushaProductGrid,
  HomeFloatingActionButton,
  HomeFooter,
  HomeLegitContinueDialog,
  HomeMainBanner,
  HomeNewCamelProductGrid,
  HomePersonalCuration,
  HomePersonalGuide,
  HomePersonalGuideProductList,
  HomeSearchHeader,
  HomeWishAlertScreen
} from '@components/pages/home';

import LocalStorage from '@library/localStorage';
import Initializer from '@library/initializer';

import { postManage } from '@api/userHistory';

import { IS_NOT_FIRST_VISIT, SIGN_UP_STEP } from '@constants/localStorage';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import { checkAgent } from '@utils/common';

import useSession from '@hooks/useSession';

function Home() {
  const router = useRouter();

  const { isLoggedIn } = useSession();

  const { mutate: mutatePostManage } = useMutation(postManage);

  useEffect(() => {
    const isNotFirstVisit = LocalStorage.get<boolean>(IS_NOT_FIRST_VISIT);

    if (checkAgent.isMobileApp() && !isNotFirstVisit) {
      LocalStorage.set(IS_NOT_FIRST_VISIT, true);
      router.replace('/appIntro/step');
    }
  }, [router]);

  useEffect(() => {
    // 가입 온보딩 완료하지 않은 유저의 경우 온보딩 페이지로 이동
    const signUpStep = LocalStorage.get<number>(SIGN_UP_STEP);

    if (isLoggedIn && typeof signUpStep === 'number') {
      router.replace(`/onboarding?step=${signUpStep}`);
    }
  }, [isLoggedIn, router]);

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
        <HomeSearchHeader />
        <HomePersonalGuide />
        <HomeMainBanner />
        <Box
          customStyle={{
            width: '100%',
            height: 32
          }}
        />
        <HomePersonalGuideProductList />
        <Box
          customStyle={{
            width: '100%',
            height: 32
          }}
        />
        <Gap height={8} />
        <HomeErushaProductGrid />
        <Gap height={8} />
        <HomeNewCamelProductGrid />
        <Gap height={8} />
        <HomeDogHoneyProductGrid />
        <Gap height={8} />
        <HomePersonalCuration />
        {checkAgent.isMobileApp() && <HomeFooter />}
      </GeneralTemplate>
      <HomeFloatingActionButton />
      <HomeLegitContinueDialog />
      <HomeWishAlertScreen />
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  return {
    props: {
      accessUser: getAccessUserByCookies(getCookies({ req }))
    }
  };
}

export default Home;
