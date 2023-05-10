import type { HTMLAttributes } from 'react';

import type { CustomStyle, Size } from '@mrcamelhub/camel-ui';
import { Icon } from '@mrcamelhub/camel-ui';

import type { LegitOpinionType } from '@typings/common';

import { StyledLegitLabel } from './LegitLabel.styles';

export interface LegitLabelProps extends HTMLAttributes<HTMLLabelElement> {
  opinion?: LegitOpinionType;
  text: string;
  size?: Extract<Size, 'xsmall' | 'small'>;
  customStyle?: CustomStyle;
}

function LegitLabel({ opinion = 'authentic', text, size, customStyle, ...props }: LegitLabelProps) {
  return (
    <StyledLegitLabel
      {...props}
      variant="solid"
      opinion={opinion}
      text={text}
      size={size}
      startIcon={
        <>
          {opinion === 'authentic' && <Icon name="OpinionAuthenticFilled" width={16} height={16} />}
          {opinion === 'fake' && <Icon name="OpinionFakeFilled" width={16} height={16} />}
          {(opinion === 'impossible' || opinion === 'legitIng') && (
            <Icon name="OpinionImpossibleFilled" width={16} height={16} />
          )}
        </>
      }
      css={customStyle}
    />
  );
}

export default LegitLabel;
