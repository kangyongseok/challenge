import { Flexbox } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

function LegitResultCommentSkeleton() {
  return (
    <Flexbox gap={8}>
      <Skeleton
        width="24px"
        height="24px"
        disableAspectRatio
        customStyle={{ borderRadius: '50%' }}
      />
      <Flexbox direction="vertical" justifyContent="center" customStyle={{ flexGrow: 1 }}>
        <Flexbox alignment="center" justifyContent="space-between" customStyle={{ height: 24 }}>
          <Flexbox alignment="center" gap={4}>
            <Skeleton
              width="40px"
              height="20px"
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
            />
            <Skeleton
              width="20px"
              height="12px"
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
            />
          </Flexbox>
          <Flexbox alignment="center" gap={4}>
            <Skeleton
              width="20px"
              height="12px"
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
            />
            <Skeleton
              width="20px"
              height="12px"
              disableAspectRatio
              customStyle={{ borderRadius: 8 }}
            />
          </Flexbox>
        </Flexbox>
        <Skeleton
          width="100%"
          height="20px"
          maxWidth="200px"
          disableAspectRatio
          customStyle={{ marginTop: 20, borderRadius: 8 }}
        />
        <Skeleton
          width="100%"
          height="20px"
          maxWidth="75px"
          disableAspectRatio
          customStyle={{ marginTop: 4, borderRadius: 8 }}
        />
        <Skeleton
          width="100%"
          height="20px"
          maxWidth="105px"
          disableAspectRatio
          customStyle={{ marginTop: 4, borderRadius: 8 }}
        />
      </Flexbox>
    </Flexbox>
  );
}

export default LegitResultCommentSkeleton;
