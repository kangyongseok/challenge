import { Box, Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import styled from '@emotion/styled';

function NonMemberWelcome() {
  const {
    theme: { palette }
  } = useTheme();
  return (
    <Flexbox alignment="center" customStyle={{ height: 82 }}>
      <AvatarArea justifyContent="center" alignment="center">
        <Icon
          name="UserLargeFilled"
          width={100}
          height={80}
          customStyle={{ paddingTop: 20, color: palette.common.grey['80'] }}
        />
      </AvatarArea>
      <Box customStyle={{ marginLeft: 16 }}>
        <Typography
          customStyle={{ color: palette.common.grey['20'] }}
          variant="body1"
          weight="medium"
        >
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
