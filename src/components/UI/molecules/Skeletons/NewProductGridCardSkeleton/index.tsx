import { Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

import type { ProductGridCardVariant } from '@typings/common';

import { Content } from './NewProductGridCardSkeleton.styles';

export interface NewProductGridCardSkeletonProps {
  variant?: ProductGridCardVariant;
  isRound?: boolean;
  hasSubText?: boolean;
  hasLabel?: boolean;
  hidePrice?: boolean;
  hideAreaInfo?: boolean;
  hideMetaInfo?: boolean;
  customStyle?: CustomStyle;
}

function NewProductGridCardSkeleton({
  variant = 'gridA',
  hasSubText,
  hasLabel,
  hidePrice,
  hideAreaInfo,
  hideMetaInfo,
  customStyle
}: NewProductGridCardSkeletonProps) {
  return (
    <Flexbox direction="vertical" customStyle={customStyle}>
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
          <Flexbox
            alignment="baseline"
            gap={4}
            customStyle={{
              marginTop: 4
            }}
          >
            <Skeleton width={52} height={24} round={8} disableAspectRatio />
            {hasSubText && <Skeleton width={38} height={16} round={8} disableAspectRatio />}
          </Flexbox>
        )}
        {!hideAreaInfo && (
          <Skeleton
            width="100%"
            maxWidth={70}
            height={12}
            round={8}
            disableAspectRatio
            customStyle={{
              marginTop: 10
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
              marginTop: 6
            }}
          />
        )}
        {hasLabel && (
          <Flexbox alignment="center" gap={2} customStyle={{ marginTop: 12 }}>
            <Skeleton width={35} height={18} round={8} disableAspectRatio />
            <Skeleton width={35} height={18} round={8} disableAspectRatio />
          </Flexbox>
        )}
      </Content>
    </Flexbox>
  );
}

export default NewProductGridCardSkeleton;
