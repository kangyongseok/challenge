import { useRouter } from 'next/router';
import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

function NonMemberWelcome() {
  const router = useRouter();
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();
  return (
    <Flexbox alignment="center" customStyle={{ height: 82 }}>
      <AvatarArea justifyContent="center" alignment="center">
        <Icon
          name="UserLargeFilled"
          width={100}
          height={80}
          customStyle={{ paddingTop: 20, color: common.ui80 }}
        />
      </AvatarArea>
      <Box
        customStyle={{ marginLeft: 16 }}
        onClick={() => router.push('/camelSeller/registerConfirm/34522957')}
      >
        <Typography customStyle={{ color: common.ui20 }} variant="body1" weight="medium">
          아직 프로필이 없어요
        </Typography>
      </Box>
    </Flexbox>
  );
}

const AvatarArea = styled(Flexbox)`
  width: 48px;
  position: relative;
  height: 48px;
  background: #eeeeee;
  border-radius: 50%;
  overflow: hidden;
`;

export default NonMemberWelcome;
