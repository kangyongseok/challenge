import { useQuery } from 'react-query';
import { useRouter } from 'next/router';

import PageHead from '@components/UI/atoms/PageHead';

import { fetchAnnounce } from '@api/common';

import queryKeys from '@constants/queryKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function AnnouncePageHead() {
  const router = useRouter();
  const { id } = router.query;

  const { data: accessUser } = useQueryAccessUser();
  const { data: announce } = useQuery(
    queryKeys.commons.announce(Number(id)),
    () => fetchAnnounce(Number(id)),
    {}
  );

  if (!announce) return null;

  return (
    <PageHead
      title={`${announce.title} | 카멜`}
      ogTitle={`${announce.title} | 카멜`}
      description={announce.announceDetails[0].subContent
        .replace(/{userName}/gi, accessUser?.userName ?? '')
        .replace(/<br \/>/g, ' ')}
      ogDescription={announce.announceDetails[0].subContent
        .replace(/{userName}/gi, accessUser?.userName ?? '')
        .replace(/<br \/>/g, ' ')}
      ogImage={announce.announceDetails[0].images.split('|')[0]}
      ogUrl={`https://mrcamel.co.kr/announces/${router.query.id}`}
    />
  );
}

export default AnnouncePageHead;
