import { Label, light } from '@mrcamelhub/camel-ui';
import styled, { CSSObject } from '@emotion/styled';

import { LegitLabelProps } from '.';

export const StyledLegitLabel = styled(Label)<Pick<LegitLabelProps, 'opinion'>>`
  ${({ opinion }): CSSObject => {
    switch (opinion) {
      case 'fake':
        return {
          backgroundColor: light.palette.secondary.red.dark
        };
      case 'impossible':
        return {
          backgroundColor: light.palette.common.ui20
        };
      case 'legitIng':
        return {
          backgroundColor: light.palette.common.ui20
        };
      default:
        return {
          backgroundColor: light.palette.primary.dark
        };
    }
  }}
`;
