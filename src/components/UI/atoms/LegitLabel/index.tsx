import type { HTMLAttributes } from 'react';

import type { CustomStyle } from 'mrcamel-ui';
import { Icon } from 'mrcamel-ui';

import type { LegitOpinionType } from '@typings/common';

import { StyledLegitLabel, Text } from './LegitLabel.styles';

export interface LegitLabelProps extends HTMLAttributes<HTMLLabelElement> {
  variant?: LegitOpinionType;
  text: string;
  customStyle?: CustomStyle;
}

function LegitLabel({ variant = 'authentic', text, customStyle, ...props }: LegitLabelProps) {
  return (
    <StyledLegitLabel variant={variant} {...props} css={customStyle}>
      {variant === 'authentic' && <Icon name="OpinionAuthenticFilled" width={15} height={15} />}
      {variant === 'fake' && <Icon name="OpinionFakeFilled" width={15} height={15} />}
      {variant === 'impossible' && <Icon name="OpinionImpossibleFilled" width={15} height={15} />}
      <Text variant="small1" weight="medium">
        {text}
      </Text>
    </StyledLegitLabel>
  );
}

export default LegitLabel;
