import { useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Flexbox, ThemeProvider, useTheme } from '@mrcamelhub/camel-ui';

import { LegitContactBanner } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitProfileInfo,
  LegitProfileOpinionLegitList,
  LegitProfilePageHead
} from '@components/pages/legitProfile';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchLegitProfile, fetchUserInfo } from '@api/user';
import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT, HEADER_HEIGHT } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';
import getAccessUserByCookies from '@utils/common/getAccessUserByCookies';
import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useSession from '@hooks/useSession';
import useScrollTrigger from '@hooks/useScrollTrigger';

function LegitProfile({ isLegitUser }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    query: { id }
  } = useRouter();
  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const { isLoggedIn, data: accessUser } = useSession();

  const userId = useMemo(() => Number(id), [id]);
  const { isLoading, data: { profile, roleSeller, cntOpinion = 0 } = {} } = useQuery(
    queryKeys.users.legitProfile(userId),
    () => fetchLegitProfile(userId),
    {
      refetchOnWindowFocus: !isLegitUser || (isLoggedIn && userId !== accessUser?.userId)
    }
  );
  const { data: legitsBrands = [] } = useQuery(queryKeys.models.legitsBrands(), () =>
    fetchLegitsBrands()
  );

  const opinionLegitListRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_PROFILE);
  }, []);

  const triggered = useScrollTrigger({
    ref: opinionLegitListRef,
    additionalOffsetTop:
      (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) -
      HEADER_HEIGHT -
      (isExtendedLayoutIOSVersion()
        ? Number(
            getComputedStyle(document.documentElement).getPropertyValue('--sat').split('px')[0]
          )
        : 0),
    delay: 0
  });

  useEffect(() => {
    document.body.className = `legit-${mode}`;

    return () => {
      document.body.removeAttribute('class');
    };
  }, [mode]);

  if (!profile) return null;

  return (
    <>
      <LegitProfilePageHead />
      <GeneralTemplate
        header={
          <ThemeProvider theme={triggered ? 'light' : 'dark'}>
            <Header isTransparent={!triggered} isFixed />
          </ThemeProvider>
        }
        customStyle={
          isExtendedLayoutIOSVersion()
            ? { paddingTop: 0, '& > main': { backgroundColor: common.bg03 } }
            : { '& > main': { backgroundColor: common.bg03 } }
        }
        disablePadding
      >
        <>
          <Flexbox
            direction="vertical"
            gap={12}
            customStyle={{ backgroundColor: common.uiWhite, flex: 1 }}
          >
            <LegitProfileInfo
              isLoading={isLoading}
              profile={profile}
              legitsBrands={legitsBrands}
              cntOpinion={cntOpinion}
              sellerId={roleSeller?.sellerId}
            />
            <LegitProfileOpinionLegitList ref={opinionLegitListRef} userId={userId} />
          </Flexbox>
          {!isLegitUser && <LegitContactBanner isDark isFixed />}
        </>
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({ req, query: { id } }: GetServerSidePropsContext) {
  const userId = String(id);

  try {
    if (!/^[0-9]+$/.test(userId)) {
      return {
        notFound: true
      };
    }

    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(getCookies({ req }));

    await queryClient.fetchQuery(queryKeys.users.legitProfile(+userId), () =>
      fetchLegitProfile(+userId)
    );
    await queryClient.prefetchQuery(queryKeys.models.legitsBrands(), () => fetchLegitsBrands());

    if (getCookies({ req }).accessToken) {
      const { roles } = await queryClient.fetchQuery(queryKeys.users.userInfo(), fetchUserInfo);

      return {
        props: {
          dehydratedState: dehydrate(queryClient),
          isLegitUser: roles.some((role) => ['PRODUCT_LEGIT_HEAD', 'PRODUCT_LEGIT'].includes(role))
        }
      };
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        isLegitUser: false,
        accessUser: getAccessUserByCookies(getCookies({ req }))
      }
    };
  } catch {
    return {
      notFound: true
    };
  }
}

export default LegitProfile;
