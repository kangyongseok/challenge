import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';

import { FixedProductInfo } from '@components/UI/molecules';

import { fetchChannel } from '@api/channel';

import queryKeys from '@constants/queryKeys';

function ChannelPriceOfferProductInfo() {
  const router = useRouter();
  const { id } = router.query;

  const { data: { product } = {}, isLoading } = useQuery(
    queryKeys.channels.channel(Number(id)),
    () => fetchChannel(Number(id)),
    {
      enabled: !!id
    }
  );

  return (
    <FixedProductInfo
      isLoading={isLoading}
      image={product?.imageThumbnail || product?.imageMain || ''}
      status={product?.status || 0}
      title={product?.title || ''}
      price={product?.price || 0}
    />
  );
}

export default ChannelPriceOfferProductInfo;
