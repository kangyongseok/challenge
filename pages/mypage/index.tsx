import { useEffect } from 'react';

import { BottomNavigation, Header } from '@components/UI/molecules';
import { Gap } from '@components/UI/atoms';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  MypageActionBanner,
  MypageEtc,
  MypageEventBanner,
  MypageIntro,
  MypageLegitInfo,
  MypageMyInfo,
  MypageProfile,
  MypageSetting
} from '@components/pages/mypage';

import { logEvent } from '@library/amplitude';

// import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useMyProfileInfo from '@hooks/userMyProfileInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const { data: accessUser, isFetched } = useQueryAccessUser();
  const { isLegit } = useMyProfileInfo();

  useEffect(() => {
    logEvent(attrKeys.mypage.VIEW_MY, {
      title: accessUser ? 'LOGIN' : 'NONLOGIN'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isFetched) return null;

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
        header={<Header />}
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
        <MypageEventBanner />
        <MypageEtc />
      </GeneralTemplate>
      {/* <CamelSellerFloatingButton
        attributes={{
          name: attrProperty.name.MY,
          title: attrProperty.title.MY_FLOATING,
          source: 'MYPAGE'
        }}
      /> */}
    </>
  );
}

export default MyPage;
