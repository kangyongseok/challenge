import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import PageHead from '@components/UI/atoms/PageHead';

import { fetchLegitProfile } from '@api/user';

import queryKeys from '@constants/queryKeys';

import { commaNumber } from '@utils/common';

function LegitProfilePageHead() {
  const router = useRouter();
  const { id } = router.query;

  const { data: { cntOpinion = 0, profile: { name = '', image = '' } = {} } = {} } = useQuery(
    queryKeys.users.legitProfile(Number(id)),
    () => fetchLegitProfile(Number(id)),
    {
      enabled: !!id
    }
  );

  return (
    <PageHead
      title={`중고명품 감정사 ${name} | 카멜`}
      description={`${commaNumber(
        cntOpinion
      )}개의 중고명품을 감정한 믿음직한 감정사에요! 중고명품 의심이 되면 감정 의견을 받아보세요.`}
      ogTitle={`중고명품 감정사 ${name} | 카멜`}
      ogDescription={`${commaNumber(
        cntOpinion
      )}개의 중고명품을 감정한 믿음직한 감정사에요! 중고명품 의심이 되면 감정 의견을 받아보세요.`}
      ogImage={image}
      keywords="중고명품 감정, 명품 정품 감품, 명품 정품 감정, 명품 가품 감정, 가품 감정, 정품 감정, 정품 가품 구별"
    />
  );
}

export default LegitProfilePageHead;
