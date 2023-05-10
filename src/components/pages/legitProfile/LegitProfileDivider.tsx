import { Box, useTheme } from '@mrcamelhub/camel-ui';

interface LegitProfileDividerProps {
  isLoading: boolean;
  cntOpinion: number;
}

function LegitProfileDivider({ isLoading, cntOpinion }: LegitProfileDividerProps) {
  const {
    theme: {
      palette: { common }
    }
  } = useTheme();

  if (!isLoading && !cntOpinion) return null;

  return (
    <Box customStyle={{ paddingTop: 12, backgroundColor: common.cmnW }}>
      <Box customStyle={{ height: 8, backgroundColor: common.line02 }} />
    </Box>
  );
}

export default LegitProfileDivider;
