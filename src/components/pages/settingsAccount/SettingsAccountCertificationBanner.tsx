import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import { useQuery } from '@tanstack/react-query';

import { fetchUserCerts } from '@api/user';

import queryKeys from '@constants/queryKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SettingsAccountCertificationBanner() {
  const {
    theme: {
      palette: { primary, common }
    }
  } = useTheme();

  const { data: accessUser } = useQueryAccessUser();

  const { data, isLoading } = useQuery(queryKeys.users.userCerts(), () => fetchUserCerts(), {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  if (isLoading) return null;

  if (data && !isLoading && !data.some(({ type }) => type === 0)) return null;

  return (
    <Flexbox
      gap={4}
      alignment="center"
      customStyle={{ padding: '12px 20px', backgroundColor: common.bg02 }}
    >
      <Icon name="CheckOutlined" width={16} height={16} color={primary.light} />
      <Typography variant="body2">본인인증이 완료되었어요!</Typography>
    </Flexbox>
  );
}

export default SettingsAccountCertificationBanner;
