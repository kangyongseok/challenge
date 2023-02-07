import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import PageHead from '@components/UI/atoms/PageHead';

import { fetchAnnounce } from '@api/common';

import queryKeys from '@constants/queryKeys';

import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';

function AnnouncePageHead() {
  const router = useRouter();
  const { id } = router.query;

  const { userNickName } = useQueryMyUserInfo();
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
        .replace(/{userName}/gi, userNickName)
        .replace(/<br \/>/g, ' ')}
      ogDescription={announce.announceDetails[0].subContent
        .replace(/{userName}/gi, userNickName)
        .replace(/<br \/>/g, ' ')}
      ogImage={announce.announceDetails[0].images.split('|')[0]}
    />
  );
}

export default AnnouncePageHead;
