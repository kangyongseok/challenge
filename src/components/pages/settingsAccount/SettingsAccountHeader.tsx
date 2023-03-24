import { Typography } from 'mrcamel-ui';

import { Header } from '@components/UI/molecules';

function SettingsAccountHeader() {
  return (
    <Header showRight={false}>
      <Typography variant="h3" weight="bold">
        정산계좌
      </Typography>
    </Header>
  );
}

export default SettingsAccountHeader;
