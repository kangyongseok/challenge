import type { MouseEvent, ReactElement } from 'react';

import { Flexbox, Icon, Typography, useTheme } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import UserAvatar from '@components/UI/organisms/UserAvatar';

import { Description, Item, StyledListItem, Time, Title } from './List.styles';

interface ListItemProps {
  avatarUrl?: string;
  avatar?: ReactElement;
  title: string;
  showNotificationOffIcon?: boolean;
  time?: string;
  description?: string;
  isAdminBlockUser?: boolean;
  action?: ReactElement;
  onClick?: (e?: MouseEvent<HTMLLIElement>) => void;
  disabled?: boolean;
  customStyle?: CustomStyle;
  titleCustomStyle?: CustomStyle;
  descriptionCustomStyle?: CustomStyle;
}

function ListItem({
  avatarUrl,
  avatar,
  title,
  showNotificationOffIcon = false,
  time,
  description,
  isAdminBlockUser,
  action,
  onClick,
  disabled = false,
  customStyle,
  titleCustomStyle,
  descriptionCustomStyle
}: ListItemProps) {
  const {
    theme: {
      palette: { secondary }
    }
  } = useTheme();

  return (
    <StyledListItem css={customStyle} onClick={onClick}>
      <UserAvatar
        src={avatarUrl || ''}
        width={52}
        height={52}
        isRound
        iconCustomStyle={{ width: 24, height: 24 }}
      />
      {!!avatar && avatar}
      <Item>
        <Flexbox alignment="center" gap={4}>
          {showNotificationOffIcon && !disabled && <Icon name="NotiOffFilled" size="medium" />}
          <Flexbox gap={4} customStyle={{ alignItems: 'baseline' }}>
            <Title variant="h4" weight="bold" disabled={disabled} css={titleCustomStyle}>
              {title}
            </Title>
            {!!time && <Time variant="body2">{time}</Time>}
          </Flexbox>
        </Flexbox>
        {!isAdminBlockUser && description && (
          <Description variant="body2" disabled={disabled} css={descriptionCustomStyle}>
            {description}
          </Description>
        )}
        {isAdminBlockUser && (
          <Typography
            variant="h4"
            customStyle={{
              color: secondary.red.light
            }}
          >
            관리자에게 차단된 유저입니다.
          </Typography>
        )}
      </Item>
      {action}
    </StyledListItem>
  );
}

export default ListItem;
