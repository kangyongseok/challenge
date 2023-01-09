import { Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import { Content } from './LegitGridCardSkeleton.styles';

export interface LegitGridCardSkeletonProps {
  variant?: 'gridA' | 'gridB' | 'gridC' | 'swipeX';
  isRound?: boolean;
  hidePrice?: boolean;
  hideMetaInfo?: boolean;
  customStyle?: CustomStyle;
}

function LegitGridCardSkeleton({
  variant,
  isRound,
  hidePrice = true,
  hideMetaInfo = true,
  customStyle
}: LegitGridCardSkeletonProps) {
  return (
    <Flexbox direction="vertical" css={customStyle}>
      <Skeleton ratio="5:6" round={isRound ? 8 : 0} />
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
