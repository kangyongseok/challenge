import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Box } from 'mrcamel-ui';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import { BottomNavigation, Header } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import { LegitAdminRequestPanel, LegitAdminTabs } from '@components/pages/legitAdmin';
import { LegitFloatingButton, LegitLivePanel, LegitMyPanel } from '@components/pages/legit';

import Initializer from '@library/initializer';

import { locales } from '@constants/common';

import { getCookies } from '@utils/cookies';

function LegitAdmin() {
  const router = useRouter();
  const { tab = 'home' } = router.query;

  return (
    <>
      <PageHead
        title="오늘 사려는 중고명품, 정가품 궁금하다면 사진감정 | 카멜"
        description="중고명품 정품이 의심이 된다면 카멜에서 명품 감정사들로부터 감정 의견을 받아보세요!"
        ogTitle="오늘 사려는 중고 명품, 정가품 궁금하다면 사진감정 | 카멜"
        ogDescription="중고 명품 정품이 의심이 된다면 카멜에서 명품 감정사들로부터 감정 의견을 받아보세요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/legit-main.webp`}
        keywords="중고 명품 감정, 정품가품 구별법, 명품 정품가품 구별, 정품가품 확인, 명품 정품가품 확인, 중고 명품, 명품 감정사, 중고 정품가품 확인, 중고 명품 정품가품 확인, 정품가품 구별하기, 정품 구별법, 가품 구별법"
      />
      <GeneralTemplate
        header={<Header />}
        footer={tab !== 'profile' ? <BottomNavigation /> : undefined}
        disablePadding
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          overflowX: 'hidden'
        }}
      >
        <LegitAdminTabs />
        {tab === 'home' && <LegitLivePanel />}
        {tab === 'my' && (
          <Box customStyle={{ marginTop: 20 }}>
            <LegitMyPanel />
          </Box>
        )}
        {tab === 'request' && <LegitAdminRequestPanel />}
        {tab === 'home' && <LegitFloatingButton />}
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({
  req,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  // TODO 권한 체크 로직 제거, 추후 보완
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(getCookies({ req }));
  Initializer.initAccessUserInQueryClientByCookies(getCookies({ req }), queryClient);

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default LegitAdmin;
