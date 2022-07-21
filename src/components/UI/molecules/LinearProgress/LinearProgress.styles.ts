import styled from '@emotion/styled';

import { LinearProgressProps } from '.';

export const StyledLinearProgress = styled.div`
  width: 100%;
  height: 2px;
  background-color: ${({
    theme: {
      palette: {
        common: { grey }
      }
    }
  }) => grey['90']};
`;

export const ProgressBar = styled.div<Pick<LinearProgressProps, 'value'>>`
  width: 100%;
  height: 100%;
  background-color: ${({
    theme: {
      palette: { primary }
    }
  }) => primary.main};
  transform: translateX(-${({ value }) => value}%);
  transition: transform 0.2s cubic-bezier(0, 0, 0.2, 1) 0ms;
`;
