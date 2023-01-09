import { useEffect } from 'react';

import { QueryClient, dehydrate } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import { LegitInduceFloatingBanner } from '@components/UI/organisms';
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
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const { data: myUserInfo } = useQueryMyUserInfo();
  const { data: accessUser } = useQueryAccessUser();
  const authLegit =
    myUserInfo?.roles.includes('PRODUCT_LEGIT') || myUserInfo?.roles.includes('PRODUCT_LEGIT_HEAD');

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
        {authLegit && (
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
      <LegitInduceFloatingBanner
        themeType="light"
        halfRound
        bottom={62}
        edgeSpacing={-1}
        channelTalkPosition={-50}
        name={attrProperty.productName.MY}
      />
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
