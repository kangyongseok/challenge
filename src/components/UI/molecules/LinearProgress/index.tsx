import type { CustomStyle } from 'mrcamel-ui';

import { ProgressBar, StyledLinearProgress } from './LinearProgress.styles';

export interface LinearProgressProps {
  value: number;
  customStyle?: CustomStyle;
}

function LinearProgress({ value, customStyle }: LinearProgressProps) {
  return (
    <StyledLinearProgress css={customStyle}>
      <ProgressBar value={100 - value} />
    </StyledLinearProgress>
  );
}

export default LinearProgress;
