import { Box, Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

interface LegitStatusCardSkeletonPros {
  customStyle?: CustomStyle;
}

function LegitStatusCardSkeleton({ customStyle }: LegitStatusCardSkeletonPros) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: 100 }}>
        <Skeleton round={8} />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton width="100%" maxWidth={46} height={18} round={8} disableAspectRatio />
        <Skeleton
          width="100%"
          maxWidth={200}
          height={16}
          disableAspectRatio
          round={8}
          customStyle={{ marginTop: 8 }}
        />
        <Skeleton
          width={41}
          height={16}
          round={8}
          disableAspectRatio
          customStyle={{ margin: '5px 0' }}
        />

        <Flexbox direction="vertical" gap={2} customStyle={{ marginTop: 8 }}>
          <Skeleton width="100%" maxWidth={70} height={12} round={8} disableAspectRatio />
          <Skeleton width="100%" maxWidth={100} height={12} round={8} disableAspectRatio />
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

export default LegitStatusCardSkeleton;
