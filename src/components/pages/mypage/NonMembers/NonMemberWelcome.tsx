import { Box, Flexbox, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

function NonMemberWelcome() {
  return (
    <Flexbox alignment="center" customStyle={{ height: 82 }}>
      <AvatarArea justifyContent="center" alignment="center">
        <Icon
          name="UserLargeFilled"
          width={100}
          height={80}
          color="ui80"
          customStyle={{ paddingTop: 20 }}
        />
      </AvatarArea>
      <Box customStyle={{ marginLeft: 16 }}>
        <Typography variant="body1" weight="medium">
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
