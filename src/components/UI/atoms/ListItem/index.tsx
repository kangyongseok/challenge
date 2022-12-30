import type { MouseEvent, ReactElement } from 'react';

import { Flexbox, Icon } from 'mrcamel-ui';
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
  action,
  onClick,
  disabled = false,
  customStyle,
  titleCustomStyle,
  descriptionCustomStyle
}: ListItemProps) {
  return (
    <StyledListItem css={customStyle} onClick={onClick}>
      {!!avatarUrl && (
        <UserAvatar
          src={avatarUrl}
          width={52}
          height={52}
          isRound
          iconCustomStyle={{ width: 24, height: 24 }}
        />
      )}
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
        {description && (
          <Description variant="body2" disabled={disabled} css={descriptionCustomStyle}>
            {description}
          </Description>
        )}
      </Item>
      {action}
    </StyledListItem>
  );
}

export default ListItem;
