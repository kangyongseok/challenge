import { useEffect } from 'react';

import { QueryClient, dehydrate, useQuery } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import { LegitInduceFloatingBanner } from '@components/UI/organisms';
import CamelSellerFloatingButton from '@components/UI/molecules/CamelSellerFloatingButton';
import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageEtc,
  MypageNotice,
  MypageQnA,
  MypageSetting,
  MypageUserInfo,
  // MypageUserShopCard,
  MypageWelcome,
  NonMemberContents,
  NonMemberWelcome
} from '@components/pages/mypage';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { data: accessUser } = useQueryAccessUser();

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_MY, {
      title: accessUser ? 'LOGIN' : 'NONLOGIN'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!accessUser || !userInfo) {
    return (
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <NonMemberWelcome />
        <NonMemberContents />
      </GeneralTemplate>
    );
  }

  return (
    <>
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <MypageWelcome />
        {/* <MypageUserShopCard /> */}
        <MypageNotice data={userInfo?.announces} />
        <MypageUserInfo />
        <MypageSetting data={userInfo?.alarm} />
        <MypageQnA />
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

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale)),
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default MyPage;
