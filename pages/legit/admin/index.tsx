import { useEffect } from 'react';

import { QueryClient, dehydrate } from 'react-query';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import { Box, useTheme } from 'mrcamel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitAdminProfilePanel,
  LegitAdminRequestPanel,
  LegitAdminTabs
} from '@components/pages/legitAdmin';
import {
  LegitFloatingButton,
  LegitLivePanel,
  LegitMyPanel,
  LegitReviewSlide
} from '@components/pages/legit';

import Initializer from '@library/initializer';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { locales } from '@constants/common';

function LegitAdmin() {
  const router = useRouter();
  const { tab = 'home' } = router.query;
  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();

  useEffect(() => {
    document.body.className = `legit-${mode}`;

    return () => {
      document.body.removeAttribute('class');
    };
  }, [mode]);

  return (
    <GeneralTemplate
      header={<Header isTransparent customStyle={{ backgroundColor: common.bg03 }} />}
      footer={tab !== 'profile' ? <BottomNavigation /> : undefined}
      disablePadding
      customStyle={{
        height: 'auto',
        minHeight: '100%',
        backgroundColor: common.bg03,
        overflowX: 'hidden'
      }}
    >
      <LegitAdminTabs />
      {tab === 'home' && <LegitReviewSlide />}
      {tab === 'home' && <LegitLivePanel />}
      {tab === 'my' && (
        <Box customStyle={{ marginTop: 20 }}>
          <LegitMyPanel />
        </Box>
      )}
      {tab === 'request' && <LegitAdminRequestPanel />}
      {tab === 'profile' && <LegitAdminProfilePanel />}
      {tab === 'home' && <LegitFloatingButton />}
    </GeneralTemplate>
  );
}

export async function getServerSideProps({
  req,
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  if (!req.cookies.accessToken)
    return {
      redirect: {
        destination: '/legit',
        permanent: false
      }
    };

  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  const userInfo = await queryClient.fetchQuery(queryKeys.users.userInfo(), fetchUserInfo);

  const hasRole = userInfo.roles.some((role) => (role as string).indexOf('PRODUCT_LEGIT') >= 0);

  if (!hasRole) {
    return {
      redirect: {
        destination: '/legit',
        permanent: false
      }
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default LegitAdmin;
