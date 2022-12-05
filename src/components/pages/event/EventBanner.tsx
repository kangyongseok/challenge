import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box } from 'mrcamel-ui';

import { Image } from '@components/UI/atoms';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';

function EventBanner() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const eventId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: { imageMain } = {} } = useQuery(
    queryKeys.commons.content(Number(eventId)),
    () => fetchContent(Number(eventId)),
    {
      enabled: !!id
    }
  );

  return (
    <Box component="section" customStyle={{ margin: '0 -20px 32px' }}>
      <Image
        ratio="4:3"
        height="auto"
        src={imageMain || ''}
        alt="Event Banner Img"
        disableSkeletonRender={false}
      />
    </Box>
  );
}

export default EventBanner;
