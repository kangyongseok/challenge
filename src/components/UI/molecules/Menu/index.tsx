import type { PropsWithChildren, ReactElement } from 'react';

import { Typography } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import { StyledMenu, StyledMenuItem, Title } from './Menu.styles';

interface MenuProps {
  id?: string;
  title?: string;
  gap?: number;
  customStyle?: CustomStyle;
}

function Menu({ id, title, children, gap, customStyle }: PropsWithChildren<MenuProps>) {
  return (
    <StyledMenu gap={gap} css={customStyle}>
      {!!title && (
        <Title id={id} variant="body1" weight="bold">
          {title}
        </Title>
      )}
      {children}
    </StyledMenu>
  );
}

interface MenuItemProps {
  onClick?: () => void;
  action?: ReactElement;
  weight?: 'bold' | 'medium' | 'regular' | 'light';
  customStyle?: CustomStyle;
}

function MenuItem({
  onClick,
  children,
  action,
  weight = 'medium',
  customStyle
}: PropsWithChildren<MenuItemProps>) {
  return (
    <StyledMenuItem onClick={onClick} css={customStyle}>
      <Typography variant="h4" weight={weight} customStyle={{ flex: 1, minWidth: 142 }}>
        {children}
      </Typography>
      {action}
    </StyledMenuItem>
  );
}

export { Menu, MenuItem };
