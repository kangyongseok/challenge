import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { Box, Icon, dark } from '@mrcamelhub/camel-ui';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageActionBanner,
  MypageEtc,
  MypageFooter,
  MypageIntro,
  MypageLegitInfo,
  MypageManage,
  MypageMyInfo,
  MypageNonMemberLogin,
  MypageProfile,
  MypageSetting
} from '@components/pages/mypage';

import { logEvent } from '@library/amplitude';

import attrKeys from '@constants/attrKeys';

import { checkAgent } from '@utils/common';

import useSession from '@hooks/useSession';
import useMyProfileInfo from '@hooks/userMyProfileInfo';

function MyPage() {
  const router = useRouter();

  const { isLoggedIn, isFetched } = useSession();
  const { isLegit } = useMyProfileInfo();

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_MY, {
      title: isLoggedIn ? 'LOGIN' : 'NONLOGIN'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoggedIn && !checkAgent.isMobileApp()) {
      document.body.className = 'dark';
    }

    return () => {
      document.body.removeAttribute('class');
    };
  }, [isLoggedIn]);

  if (!isFetched) return null;

  if (!isLoggedIn && !checkAgent.isMobileApp()) {
    return (
      <GeneralTemplate
        header={
          <Header
            showLeft={false}
            rightIcon={
              <Box customStyle={{ padding: 16 }} onClick={() => router.push('/search')}>
                <Icon name="SearchOutlined" color="uiWhite" />
              </Box>
            }
            hideTitle
            customStyle={{
              backgroundColor: dark.palette.common.bg01
            }}
          />
        }
        footer={<BottomNavigation />}
        hideMowebFooter
        customStyle={{
          backgroundColor: dark.palette.common.bg01
        }}
      >
        <MypageNonMemberLogin />
      </GeneralTemplate>
    );
  }

  if (!isLoggedIn) {
    return (
      <GeneralTemplate header={<Header isFixed={false} />} footer={<BottomNavigation />}>
        <MypageIntro />
      </GeneralTemplate>
    );
  }

  return (
    <GeneralTemplate
      header={<Header isFixed={false} />}
      footer={<BottomNavigation />}
      disablePadding
      customStyle={{ userSelect: 'none', footer: { marginTop: 0 } }}
    >
      <MypageProfile />
      <MypageActionBanner />
      {isLegit && (
        <>
          <MypageLegitInfo />
          <Gap height={1} />
        </>
      )}
      <MypageMyInfo />
      <Gap height={1} />
      <MypageSetting />
      <Gap height={1} />
      <MypageManage />
      <Gap height={1} />
      <MypageEtc />
      <Gap height={1} />
      <MypageFooter />
    </GeneralTemplate>
  );
}

export default MyPage;
