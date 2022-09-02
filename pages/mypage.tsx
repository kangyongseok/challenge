import { useEffect } from 'react';

import { useRecoilValue } from 'recoil';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import type { GetServerSidePropsContext } from 'next';
import styled from '@emotion/styled';

import { LegitInduceFloatingBanner } from '@components/UI/organisms';
import { BottomNavigation, Header } from '@components/UI/molecules';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageEtc,
  MypageNotice,
  MypageQnA,
  MypageSetting,
  MypageUserInfo,
  MypageWelcome,
  NonMemberContents,
  NonMemberWelcome
} from '@components/pages/mypage';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { fetchUserInfo } from '@api/user';

import queryKeys from '@constants/queryKeys';
import { APP_DOWNLOAD_BANNER_HEIGHT } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { showAppDownloadBannerState } from '@recoil/common';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const showAppDownloadBanner = useRecoilValue(showAppDownloadBannerState);

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
        <Line top={showAppDownloadBanner ? 140 + APP_DOWNLOAD_BANNER_HEIGHT : 140} />
        <NonMemberContents />
      </GeneralTemplate>
    );
  }

  return (
    <>
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <MypageWelcome />
        <Line top={showAppDownloadBanner ? 284 : 226} />
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
    </>
  );
}

const Line = styled.div<{ top?: number }>`
  height: 7px;
  width: 100%;
  background: ${({ theme: { palette } }) => palette.common.grey['90']};
  position: absolute;
  left: 0;
  top: ${({ top }) => top || 135}px;
`;

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  Initializer.initAccessTokenByCookies(req.cookies);
  Initializer.initAccessUserInQueryClientByCookies(req.cookies, queryClient);

  if (req.cookies.accessToken) {
    await queryClient.prefetchQuery(queryKeys.users.userInfo(), fetchUserInfo);
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}

export default MyPage;
