import { Box, Label } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { getFormattedActivatedTime } from '@utils/formats';

import { Status, UserImage } from './UserAvatar.styles';

interface UserAvatarProps {
  src: string;
  dateActivated: string;
  customStyle?: CustomStyle;
}

function UserAvatar({ src, dateActivated, customStyle }: UserAvatarProps) {
  const labelText = getFormattedActivatedTime(dateActivated);
  const isActive = labelText === '접속중';

  return (
    <Box customStyle={{ position: 'relative', ...customStyle }}>
      <UserImage
        src={
          src && src.length > 0
            ? src
            : `https://${process.env.IMAGE_DOMAIN}/assets/images/legit/legit-profile-image.png`
        }
        alt="User Profile Img"
        width="80px"
        height="80px"
        disableAspectRatio
        isActive={isActive}
      />
      <Status>
        <Label
          text={labelText}
          variant="contained"
          brandColor={isActive ? 'primary-light' : 'black'}
          size="xsmall"
        />
      </Status>
    </Box>
  );
}

export default UserAvatar;
