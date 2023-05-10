import { Box, CustomStyle, Flexbox, Skeleton } from '@mrcamelhub/camel-ui';

import type { ProductListCardVariant } from '@typings/common';

export interface NewProductListCardSkeletonProps {
  variant?: ProductListCardVariant;
  hidePrice?: boolean;
  hasSubText?: boolean;
  hasLabel?: boolean;
  hideAreaInfo?: boolean;
  hideMetaInfo?: boolean;
  customStyle?: CustomStyle;
}

function NewProductListCardSkeleton({
  variant,
  hidePrice,
  hasSubText,
  hasLabel,
  hideAreaInfo,
  hideMetaInfo,
  customStyle
}: NewProductListCardSkeletonProps) {
  return (
    <Flexbox gap={16} alignment={variant === 'listB' ? 'center' : undefined} css={customStyle}>
      <Box
        customStyle={{
          minWidth: variant === 'listB' ? 60 : 120,
          maxWidth: variant === 'listB' ? 60 : 120
        }}
      >
        <Skeleton ratio="5:6" round={8} />
      </Box>
      <Box
        customStyle={{
          position: 'relative',
          flexGrow: 1
        }}
      >
        <Skeleton width={32} height={16} round={8} disableAspectRatio />
        <Skeleton
          width="100%"
          maxWidth={120}
          height={16}
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
      </Box>
    </Flexbox>
  );
}

export default NewProductListCardSkeleton;
