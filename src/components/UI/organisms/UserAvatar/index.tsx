import { Box, Flexbox, Icon, Label, Typography, useTheme } from 'mrcamel-ui';
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

  const labelText = getFormattedActivatedTime(dateActivated);
  const isActive = labelText.text === '접속중';
  const todayActivated = labelText.text === '오늘 접속';

  return (
    <Flexbox
      direction="vertical"
      alignment="center"
      customStyle={{ position: 'relative', ...customStyle, width: 'fit-content' }}
    >
      {src ? (
        <UserImage
          url={src}
          width={width}
          height={height}
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
      {dateActivated?.length > 0 && (
        <Status>
          <Label
            text={
              <>
                {labelText.icon === 'time' ? (
                  <Icon
                    name="TimeOutlined"
                    customStyle={{ marginRight: 2, height: '14px !important' }}
                  />
                ) : (
                  <Box
                    customStyle={{
                      width: 5,
                      height: 5,
                      background: 'white',
                      borderRadius: '50%',
                      marginRight: 5
                    }}
                  />
                )}
                <Typography variant="body2" customStyle={{ color: 'white' }}>
                  {labelText.text}
                </Typography>
              </>
            }
            variant="solid"
            brandColor={isActive || todayActivated ? 'blue' : 'black'}
            size="xsmall"
          />
        </Status>
      )}
    </Flexbox>
  );
}

export default UserAvatar;
