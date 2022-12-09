import { useEffect, useState } from 'react';

import { QueryClient, dehydrate, useQuery } from 'react-query';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import { LegitInduceFloatingBanner } from '@components/UI/organisms';
import CamelSellerFloatingButton from '@components/UI/molecules/CamelSellerFloatingButton';
import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageEtc,
  MypageIntro,
  MypageQnA,
  MypageSetting,
  MypageUserInfo,
  MypageUserShopCard,
  MypageWelcome
} from '@components/pages/mypage';

import Initializer from '@library/initializer';
import ChannelTalk from '@library/channelTalk';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { locales } from '@constants/common';
import { PRODUCT_CREATE } from '@constants/camelSeller';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { checkAgent, isProduction } from '@utils/common';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const { data: userInfo } = useQuery(queryKeys.users.userInfo(), fetchUserInfo);
  const { data: accessUser } = useQueryAccessUser();
  const [authProductSeller, setAuthProductSeller] = useState(false);

  useEffect(() => {
    // beta 일땐 모든 판매하기 접근경로 오픈
    // 운영에서 노출 조건
    // IOS + 로그인 + PRODUCT_CREATE 권한 보유자
    // 운영에서 안드로이드는 비노출
    if (isProduction) {
      if (
        accessUser &&
        userInfo?.roles?.includes(PRODUCT_CREATE as never) &&
        checkAgent.isIOSApp()
      ) {
        setAuthProductSeller(true);
      } else {
        setAuthProductSeller(false);
      }
    } else {
      setAuthProductSeller(true);
    }
  }, [accessUser, userInfo]);

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_MY, {
      title: accessUser ? 'LOGIN' : 'NONLOGIN'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accessUser) {
      ChannelTalk.moveChannelButtonPosition(-50);
    }

    return () => {
      ChannelTalk.resetChannelButtonPosition();
    };
  }, [accessUser]);

  if (!accessUser || !userInfo) {
    return (
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <MypageIntro />
      </GeneralTemplate>
    );
  }

  return (
    <>
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <MypageWelcome />
        {authProductSeller && <MypageUserShopCard />}
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
