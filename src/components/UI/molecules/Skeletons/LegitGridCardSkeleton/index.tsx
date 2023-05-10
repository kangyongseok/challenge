import { Flexbox, Skeleton } from '@mrcamelhub/camel-ui';
import type { CustomStyle } from '@mrcamelhub/camel-ui';

import { Content } from './LegitGridCardSkeleton.styles';

export interface LegitGridCardSkeletonProps {
  variant?: 'gridA' | 'gridB' | 'gridC' | 'swipeX';
  hidePrice?: boolean;
  hideMetaInfo?: boolean;
  customStyle?: CustomStyle;
}

function LegitGridCardSkeleton({
  variant,
  hidePrice = true,
  hideMetaInfo = true,
  customStyle
}: LegitGridCardSkeletonProps) {
  return (
    <Flexbox direction="vertical" css={customStyle}>
      <Skeleton ratio="5:6" round={variant !== 'gridA' ? 8 : 0} />
      <Content variant={variant}>
        <Skeleton width={32} height={16} round={8} disableAspectRatio />
        <Skeleton
          width="100%"
          maxWidth={120}
          height={32}
          round={8}
          disableAspectRatio
          customStyle={{
            marginTop: 2
          }}
        />
        {!hidePrice && (
          <Skeleton
            width={52}
            height={24}
            round={8}
            disableAspectRatio
            customStyle={{
              marginTop: 4
            }}
          />
        )}
        {!hideMetaInfo && (
          <Skeleton
            width="100%"
            maxWidth={50}
            height={12}
            round={8}
            disableAspectRatio
            customStyle={{
              marginTop: 8
            }}
          />
        )}
      </Content>
    </Flexbox>
  );
}

export default LegitGridCardSkeleton;
