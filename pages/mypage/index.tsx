import { useEffect } from 'react';

import { QueryClient, dehydrate } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import { BottomNavigation, CamelSellerFloatingButton, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageActionBanner,
  MypageEtc,
  MypageIntro,
  MypageLegitInfo,
  MypageMyInfo,
  MypageProfile,
  MypageSetting
} from '@components/pages/mypage';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchMyUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { locales } from '@constants/common';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const { data: accessUser } = useQueryAccessUser();
  const { data: myUserInfo } = useQueryMyUserInfo();
  const isAuthLegit = myUserInfo?.roles?.some((role) =>
    ['PRODUCT_LEGIT', 'PRODUCT_LEGIT_HEAD'].includes(role)
  );

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_MY, {
      title: accessUser ? 'LOGIN' : 'NONLOGIN'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!accessUser) {
    return (
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <MypageIntro />
      </GeneralTemplate>
    );
  }

  return (
    <>
      <GeneralTemplate
        header={<Header isFixed={false} />}
        footer={<BottomNavigation />}
        disablePadding
        customStyle={{ userSelect: 'none', footer: { marginTop: 0 } }}
      >
        <MypageProfile />
        <MypageActionBanner />
        {isAuthLegit && (
          <>
            <MypageLegitInfo />
            <Gap height={1} />
          </>
        )}
        <MypageMyInfo />
        <Gap height={1} />
        <MypageSetting />
        <Gap height={1} />
        <MypageEtc />
      </GeneralTemplate>
      <CamelSellerFloatingButton source="MYPAGE" />
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

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo);
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default MyPage;
