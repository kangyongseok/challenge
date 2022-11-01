import type { ButtonHTMLAttributes } from 'react';

import { Flexbox, Icon, Typography } from 'mrcamel-ui';

import type { LegitOpinionType } from '@typings/common';

import { StyledLegitOpinionButton } from './LeginOpinionButton.styles';

export interface LegitOpinionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LegitOpinionType;
  isActive?: boolean;
  status?: number;
}

function LegitOpinionButton({
  variant = 'authentic',
  isActive,
  status,
  ...props
}: LegitOpinionButtonProps) {
  return (
    <StyledLegitOpinionButton variant={variant} isActive={isActive} status={status} {...props}>
      <Flexbox direction="vertical" alignment="center">
        {variant === 'authentic' && <Icon name="OpinionAuthenticOutlined" />}
        {variant === 'fake' && <Icon name="OpinionFakeOutlined" />}
        {variant === 'impossible' && <Icon name="OpinionImpossibleOutlined" />}
        <Typography variant="body2" weight="medium">
          {variant === 'authentic' && '정품의견'}
          {variant === 'fake' && '가품의심'}
          {variant === 'impossible' && '감정불가'}
        </Typography>
      </Flexbox>
    </StyledLegitOpinionButton>
  );
}

export default LegitOpinionButton;
