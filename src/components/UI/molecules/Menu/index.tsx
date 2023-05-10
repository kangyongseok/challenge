import { PropsWithChildren, ReactElement } from 'react';

import { Typography } from '@mrcamelhub/camel-ui';

import { StyledMenu, StyledMenuItem, Title } from './Menu.styles';

interface MenuProps {
  id?: string;
  title?: string;
  gap?: number;
}

function Menu({ id, title, children, gap }: PropsWithChildren<MenuProps>) {
  return (
    <StyledMenu gap={gap}>
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
}

function MenuItem({
  onClick,
  children,
  action,
  weight = 'medium'
}: PropsWithChildren<MenuItemProps>) {
  return (
    <StyledMenuItem onClick={onClick}>
      <Typography variant="h4" weight={weight} customStyle={{ flex: 1, minWidth: 142 }}>
        {children}
      </Typography>
      {action}
    </StyledMenuItem>
  );
}

export { Menu, MenuItem };
