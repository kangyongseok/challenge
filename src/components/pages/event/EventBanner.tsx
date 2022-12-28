import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { Box, Image, Skeleton } from 'mrcamel-ui';

import { fetchContent } from '@api/common';

import queryKeys from '@constants/queryKeys';

function EventBanner() {
  const router = useRouter();
  const { id } = router.query;
  const splitIds = String(id).split('-');
  const eventId = Number(splitIds[splitIds.length - 1] || 0);

  const { data: { imageMain } = {}, isLoading } = useQuery(
    queryKeys.commons.content(Number(eventId)),
    () => fetchContent(Number(eventId)),
    {
      enabled: !!id
    }
  );

  if ((!isLoading && !imageMain) || eventId === 15) return null;

  return (
    <Box component="section" customStyle={{ margin: '0 -20px 32px' }}>
      {isLoading && <Skeleton ratio="4:3" />}
      {!isLoading && <Image ratio="4:3" src={imageMain || ''} alt="Event Banner Img" />}
    </Box>
  );
}

export default EventBanner;
