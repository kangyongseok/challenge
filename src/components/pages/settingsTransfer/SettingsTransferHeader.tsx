import { Typography } from '@mrcamelhub/camel-ui';

import { Header } from '@components/UI/molecules';

function SettingsTransferHeader() {
  return (
    <Header showRight={false}>
      <Typography variant="h3" weight="bold">
        내 상품 가져오기
      </Typography>
    </Header>
  );
}

export default SettingsTransferHeader;
