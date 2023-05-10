import { Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

function ProductOrderDeliveryInfoHeader() {
  return (
    <Header showRight={false} hideLine={false}>
      <Typography variant="h3" weight="bold">
        배송지 입력
      </Typography>
    </Header>
  );
}

export default ProductOrderDeliveryInfoHeader;
