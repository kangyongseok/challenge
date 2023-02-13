import { useEffect } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';

import { BottomNavigation, CamelSellerFloatingButton, Header } from '@components/UI/molecules';
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

import { locales } from '@constants/common';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function MyPage() {
  const { data: accessUser } = useQueryAccessUser();
  const { data: myUserInfo } = useQueryMyUserInfo();
  const isAuthLegit = ((myUserInfo || {})?.roles || [])?.some((role) =>
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
        <MypageEventBanner />
        <MypageEtc />
      </GeneralTemplate>
      <CamelSellerFloatingButton
        attributes={{
          name: attrProperty.name.MY,
          title: attrProperty.title.MY_FLOATING,
          source: 'MYPAGE'
        }}
      />
    </>
  );
}

export async function getServerSideProps({
  locale,
  defaultLocale = locales.ko.lng
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(locale || defaultLocale))
    }
  };
}

export default MyPage;
