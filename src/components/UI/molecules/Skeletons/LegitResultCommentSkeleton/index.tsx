import { Flexbox, Skeleton } from 'mrcamel-ui';

function LegitResultCommentSkeleton() {
  return (
    <Flexbox gap={8}>
      <Skeleton width={24} height={24} round="50%" disableAspectRatio />
      <Flexbox direction="vertical" justifyContent="center" customStyle={{ flexGrow: 1 }}>
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ height: 24 }}>
          <Flexbox alignment="center" gap={4}>
            <Skeleton width={40} height={20} round={8} disableAspectRatio />
            <Skeleton width={20} height={12} round={8} disableAspectRatio />
          </Flexbox>
          <Flexbox alignment="center" gap={4}>
            <Skeleton width={20} height={12} round={8} disableAspectRatio />
            <Skeleton width={20} height={12} round={8} disableAspectRatio />
          </Flexbox>
        </Flexbox>
        <Skeleton
          width="100%"
          height={20}
          maxWidth={200}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 20 }}
        />
        <Skeleton
          width="100%"
          height={20}
          maxWidth={75}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 4 }}
        />
        <Skeleton
          width="100%"
          height={20}
          maxWidth={105}
          round={8}
          disableAspectRatio
          customStyle={{ marginTop: 4 }}
        />
      </Flexbox>
    </Flexbox>
  );
}

export default LegitResultCommentSkeleton;
