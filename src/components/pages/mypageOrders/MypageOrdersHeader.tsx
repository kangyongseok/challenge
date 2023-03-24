import { Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';

function MypageOrdersHeader() {
  return (
    <Header showRight={false}>
      <Typography variant="h3" weight="bold">
        거래내역
      </Typography>
    </Header>
  );
}

export default MypageOrdersHeader;
