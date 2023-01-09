import { Box, Icon, Label, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { getFormattedActivatedTime } from '@utils/formats';

import { IconBox, Status, UserImage } from './UserAvatar.styles';

interface UserAvatarProps {
  src: string;
  dateActivated?: string;
  width?: number;
  height?: number;
  isRound?: boolean;
  showBorder?: boolean;
  customStyle?: CustomStyle;
  iconCustomStyle?: CustomStyle;
}

function UserAvatar({
  src,
  dateActivated = '',
  width = 96,
  height = 96,
  isRound = false,
  showBorder = false,
  customStyle,
  iconCustomStyle
}: UserAvatarProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  // const [imageRendered, setImageRendered] = useState(false);

  const labelText = getFormattedActivatedTime(dateActivated);
  const isActive = labelText === '접속중';

  return (
    <Box customStyle={{ position: 'relative', ...customStyle }}>
      {src ? (
        <UserImage
          src={src}
          alt="User Profile Img"
          width={`${width}px`}
          height={`${height}px`}
          disableAspectRatio
          isActive={isActive}
          isRound={isRound}
          showBorder={showBorder}
        />
      ) : (
        <IconBox width={width} height={height} isRound={isRound}>
          <Icon
            name="UserFilled"
            customStyle={{ width: 52, height: 52, color: common.ui80, ...iconCustomStyle }}
          />
        </IconBox>
      )}
      {/* <HiddenImageLoader src={src} onLoad={() => setImageRendered(true)} /> */}
      {dateActivated?.length > 0 && (
        <Status>
          <Label
            text={labelText}
            variant="solid"
            brandColor={isActive ? 'blue' : 'black'}
            size="xsmall"
          />
        </Status>
      )}
    </Box>
  );
}

export default UserAvatar;
