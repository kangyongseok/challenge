import { useRouter } from 'next/router';

import { Header } from '@components/UI/molecules';
import PageHead from '@components/UI/atoms/PageHead';
import GeneralTemplate from '@components/templates/GeneralTemplate';
import {
  LegitFloatingActionButton,
  LegitLivePanel,
  LegitMyPanel,
  LegitTabs
} from '@components/pages/legit';

function Legit() {
  const router = useRouter();
  const { tab = 'live' } = router.query;

  return (
    <>
      <PageHead
        title="오늘 사려는 중고명품, 정가품 궁금하다면 사진감정 | 카멜"
        description="중고명품 정품이 의심이 된다면 카멜에서 명품 감정사들로부터 감정 의견을 받아보세요!"
        ogTitle="오늘 사려는 중고 명품, 정가품 궁금하다면 사진감정 | 카멜"
        ogDescription="중고 명품 정품이 의심이 된다면 카멜에서 명품 감정사들로부터 감정 의견을 받아보세요!"
        ogImage={`https://${process.env.IMAGE_DOMAIN}/assets/images/seo/legit-main.webp`}
        keywords="중고 명품 감정, 정품가품 구별법, 명품 정품가품 구별, 정품가품 확인, 명품 정품가품 확인, 중고 명품, 명품 감정사, 중고 정품가품 확인, 중고 명품 정품가품 확인, 정품가품 구별하기, 정품 구별법, 가품 구별법"
      />
      <GeneralTemplate
        header={<Header isFixed />}
        customStyle={{
          height: 'auto',
          minHeight: '100%',
          overflowX: 'hidden',
          userSelect: 'none'
        }}
        disablePadding
      >
        <LegitTabs />
        {tab === 'live' && <LegitLivePanel />}
        {tab === 'my' && <LegitMyPanel />}
      </GeneralTemplate>
      {tab === 'live' && <LegitFloatingActionButton />}
    </>
  );
}

export default Legit;
