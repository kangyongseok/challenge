import styled from '@emotion/styled';

import { GapProps } from './index';

export const StyledGap = styled.div<GapProps>`
  width: 100%;
  background-color: ${({
    theme: {
      palette: { common }
    }
  }) => common.ui95};
  height: ${({ height }) => height}px;
`;
