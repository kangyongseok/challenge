import { Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

interface LegitStatusCardSkeletonPros {
  customStyle?: CustomStyle;
}

function LegitStatusCardSkeleton({ customStyle }: LegitStatusCardSkeletonPros) {
  return (
    <Flexbox gap={16} customStyle={customStyle}>
      <Skeleton width={120} height={144} round={8} disableAspectRatio />
      <Flexbox
        direction="vertical"
        gap={2}
        customStyle={{
          position: 'relative',
          flexGrow: 1,
          padding: '2px 0'
        }}
      >
        <Skeleton width="100%" maxWidth={46} height={18} round={8} disableAspectRatio />
        <Skeleton width="100%" maxWidth={200} height={16} disableAspectRatio round={8} />
        <Skeleton
          width={50}
          height={24}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 2 }}
        />
        <Skeleton
          width="100%"
          maxWidth={70}
          height={24}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 6 }}
        />
      </Flexbox>
    </Flexbox>
  );
}

export default LegitStatusCardSkeleton;
