import type { HTMLAttributes } from 'react';

import type { CustomStyle } from 'mrcamel-ui';
import { Icon } from 'mrcamel-ui';

import { StyledProductLegitLabel, Text } from './ProductLegitLabel.styles';

export interface ProductLegitLabelProps extends HTMLAttributes<HTMLLabelElement> {
  variant?: 'authentic' | 'fake' | 'impossible';
  text: string;
  customStyle?: CustomStyle;
}

function ProductLegitLabel({
  variant = 'authentic',
  text,
  customStyle,
  ...props
}: ProductLegitLabelProps) {
  return (
    <StyledProductLegitLabel variant={variant} {...props} css={customStyle}>
      {variant === 'authentic' && <Icon name="OpinionAuthenticFilled" width={15} height={15} />}
      {variant === 'fake' && <Icon name="OpinionFakeFilled" width={15} height={15} />}
      {variant === 'impossible' && <Icon name="OpinionImpossibleFilled" width={15} height={15} />}
      <Text variant="small1" weight="medium">
        {text}
      </Text>
    </StyledProductLegitLabel>
  );
}

export default ProductLegitLabel;
