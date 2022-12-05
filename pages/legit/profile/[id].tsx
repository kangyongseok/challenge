import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { ThemeProvider, useTheme } from 'mrcamel-ui';

import { LegitContactBanner } from '@components/UI/organisms';
import { Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitProfileEditInfo,
  LegitProfileInfo,
  LegitProfileOpinionLegitList,
  LegitProfilePageHead
} from '@components/pages/legitProfile';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchLegitProfile, fetchUserInfo } from '@api/user';
import { fetchLegitsBrands } from '@api/model';

import queryKeys from '@constants/queryKeys';
import {
  APP_DOWNLOAD_BANNER_HEIGHT,
  APP_TOP_STATUS_HEIGHT,
  HEADER_HEIGHT
} from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { isExtendedLayoutIOSVersion } from '@utils/common';

import { showAppDownloadBannerState } from '@recoil/common';
import useScrollTrigger from '@hooks/useScrollTrigger';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function LegitProfile({ isLegitUser }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    push,
    query: { id, isEdit = false }
  } = useRouter();
  const {
    theme: {
      mode,
      palette: { common }
    }
  } = useTheme();

  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

  const { data: accessUser } = useQueryAccessUser();

  const userId = useMemo(() => Number(id), [id]);
  const {
    isLoading,
    data: { profile, roleSeller, cntOpinion = 0 } = {},
    refetch: refetchLegitProfile
  } = useQuery(queryKeys.users.legitProfile(userId), () => fetchLegitProfile(userId), {
    refetchOnWindowFocus: !isLegitUser || (!!accessUser && userId !== accessUser?.userId)
  });
  const { data: legitsBrands = [] } = useQuery(queryKeys.models.legitsBrands(), () =>
    fetchLegitsBrands()
  );

  const opinionLegitListRef = useRef<null>(null);

  const triggered = useScrollTrigger({
    ref: opinionLegitListRef,
    additionalOffsetTop:
      (showAppDownloadBanner ? -APP_DOWNLOAD_BANNER_HEIGHT : 0) +
      (isExtendedLayoutIOSVersion() ? -APP_TOP_STATUS_HEIGHT : 0) +
      -HEADER_HEIGHT,
    delay: 0
  });

  const handleCloseEditMode = useCallback(() => {
    refetchLegitProfile();
    push({
      pathname: '/legit/admin',
      query: { tab: 'profile' }
    });
  }, [push, refetchLegitProfile]);

  useEffect(() => {
    logEvent(attrKeys.legit.VIEW_LEGIT_PROFILE);
  }, []);

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
          <ThemeProvider theme={!isEdit && !triggered ? 'dark' : 'light'}>
            <Header isTransparent={!isEdit && !triggered} isFixed />
          </ThemeProvider>
        }
        customStyle={
          isExtendedLayoutIOSVersion()
            ? { paddingTop: 0, '& > main': { backgroundColor: common.bg03 } }
            : { '& > main': { backgroundColor: common.bg03 } }
        }
        disablePadding
      >
        {isEdit ? (
          <LegitProfileEditInfo
            userId={userId}
            name={profile.name}
            title={profile.title}
            subTitle={profile.subTitle || ''}
            description={(profile.description || '').trim()}
            image={profile.image}
            imageBackground={profile.imageBackground || ''}
            urlShop={(profile.urlShop || '').trim()}
            legitsBrands={legitsBrands}
            targetBrandIds={profile.targetBrandIds}
            onCloseEditMode={handleCloseEditMode}
          />
        ) : (
          <>
            <LegitProfileInfo
              isLoading={isLoading}
              profile={profile}
              legitsBrands={legitsBrands}
              cntOpinion={cntOpinion}
              customStyle={{
                marginTop: -(
                  HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0)
                )
              }}
              infoCustomStyle={{
                paddingTop:
                  HEADER_HEIGHT + (isExtendedLayoutIOSVersion() ? APP_TOP_STATUS_HEIGHT : 0) + 20
              }}
              sellerId={roleSeller?.sellerId}
            />
            <LegitProfileOpinionLegitList ref={opinionLegitListRef} userId={userId} />
            {!isLegitUser && <LegitContactBanner isDark isFixed />}
          </>
        )}
      </GeneralTemplate>
    </>
  );
}

export async function getServerSideProps({ req, query: { id } }: GetServerSidePropsContext) {
  const userId = String(id);

  if (/^[0-9]+$/.test(userId)) {
    const queryClient = new QueryClient();

    Initializer.initAccessTokenByCookies(req.cookies);
    Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

    // TODO 의도치 않은 redirect 발생, 임시 비활성화 처리 후 추후 보완
    // if (isEdit && +userId !== accessUser?.userId) {
    //   return {
    //     redirect: {
    //       destination: `/legit/profile/${id}`,
    //       permanent: false
    //     }
    //   };
    // }

    try {
      const legitProfile = await queryClient.fetchQuery(queryKeys.users.legitProfile(+userId), () =>
        fetchLegitProfile(+userId)
      );
      await queryClient.prefetchQuery(queryKeys.models.legitsBrands(), () => fetchLegitsBrands());

      if (legitProfile) {
        if (req.cookies.accessToken) {
          const { roles } = await queryClient.fetchQuery(queryKeys.users.userInfo(), fetchUserInfo);

          return {
            props: {
              dehydratedState: dehydrate(queryClient),
              isLegitUser: roles.some((role) =>
                ['PRODUCT_LEGIT_HEAD', 'PRODUCT_LEGIT'].includes(role)
              )
            }
          };
        }

        return {
          props: {
            dehydratedState: dehydrate(queryClient),
            isLegitUser: false
          }
        };
      }
    } catch {
      //
    }
  }

  return {
    redirect: {
      destination: '/legit',
      permanent: false
    }
  };
}

export default LegitProfile;
