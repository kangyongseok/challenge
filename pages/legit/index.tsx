import { useEffect } from 'react';

import { QueryClient, dehydrate } from 'react-query';
import type { DehydratedState } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext } from 'next';
import { useTheme } from 'mrcamel-ui';

import { LegitInduceFloatingBanner } from '@components/UI/organisms';
import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitFloatingButton,
  LegitLivePanel,
  LegitMyPanel,
  LegitReviewSlide,
  LegitTabs
} from '@components/pages/legit';

import Initializer from '@library/initializer';

import { fetchUserLegitTargets } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';

function Legit() {
  const router = useRouter();
  const { tab = 'live' } = router.query;
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
    <>
      <GeneralTemplate
        header={<Header isTransparent isFixed customStyle={{ backgroundColor: common.bg03 }} />}
        footer={<BottomNavigation />}
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          backgroundColor: common.bg03,
          overflowX: 'hidden'
        }}
        disablePadding
      >
        {tab === 'live' && <LegitReviewSlide />}
        <LegitTabs />
        {tab === 'live' && <LegitLivePanel />}
        {tab === 'my' && <LegitMyPanel />}
      </GeneralTemplate>
      <LegitInduceFloatingBanner
        themeType="light"
        bottom={62}
        halfRound
        edgeSpacing={-1}
        channelTalkPosition={-50}
        name={attrProperty.legitName.LEGIT_MAIN}
      />
      {tab === 'live' && <LegitFloatingButton />}
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userLegitTargets(), fetchUserLegitTargets);
  }

  const dehydratedState: DehydratedState = dehydrate(queryClient);

  return {
    props: {
      dehydratedState
    }
  };
}

export default Legit;
