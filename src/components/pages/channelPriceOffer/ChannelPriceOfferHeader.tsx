import { useRouter } from 'next/router';
import { Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

function ChannelPriceOfferHeader() {
  const router = useRouter();

  return (
    <Header showRight={false} onClickLeft={() => router.back()}>
      <Typography variant="h3" weight="bold">
        가격 제안하기
      </Typography>
    </Header>
  );
}

export default ChannelPriceOfferHeader;
