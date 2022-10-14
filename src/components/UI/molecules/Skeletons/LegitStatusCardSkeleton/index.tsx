import { Box, CustomStyle, Flexbox } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

interface LegitStatusCardSkeletonPros {
  customStyle?: CustomStyle;
}

function LegitStatusCardSkeleton({ customStyle }: LegitStatusCardSkeletonPros) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: 100 }}>
        <Skeleton isRound />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton width="100%" maxWidth="46px" height="18px" disableAspectRatio isRound />
        <Skeleton
          width="100%"
          maxWidth="200px"
          height="16px"
          disableAspectRatio
          isRound
          customStyle={{ marginTop: 8 }}
        />
        <Skeleton
          width="41px"
          height="16px"
          disableAspectRatio
          isRound
          customStyle={{ margin: '5px 0' }}
        />

        <Flexbox direction="vertical" gap={2} customStyle={{ marginTop: 8 }}>
          <Skeleton width="100%" maxWidth="70px" height="12px" disableAspectRatio isRound />
          <Skeleton width="100%" maxWidth="100px" height="12px" disableAspectRatio isRound />
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

export default LegitStatusCardSkeleton;
