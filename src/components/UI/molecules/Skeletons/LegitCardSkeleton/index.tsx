import type { CustomStyle } from '@mrcamelhub/camel-ui';
import { Box, Flexbox, Skeleton } from '@mrcamelhub/camel-ui';

interface LegitCardSkeletonProps {
  variant?: 'grid' | 'list';
  hideLegitLabelWithDate?: boolean;
  hidePlatformLogo?: boolean;
  hidePlatformLogoWithPrice?: boolean;
  customStyle?: CustomStyle;
}

function LegitCardSkeleton({
  variant,
  hideLegitLabelWithDate,
  hidePlatformLogo,
  hidePlatformLogoWithPrice,
  customStyle
}: LegitCardSkeletonProps) {
  if (variant === 'list') {
    return (
      <Flexbox alignment="flex-start" gap={16} customStyle={customStyle}>
        <Box
          customStyle={{
            position: 'relative',
            minWidth: 56,
            maxWidth: 56,
            overflow: 'hidden'
          }}
        >
          <Skeleton round={4} />
          {!hidePlatformLogo && (
            <Skeleton
              width={15}
              height={15}
              disableAspectRatio
              round={4}
              customStyle={{ position: 'absolute', top: 2, left: 2 }}
            />
          )}
        </Box>
        <Flexbox
          direction="vertical"
          gap={8}
          customStyle={{
            flexGrow: 1
          }}
        >
          <Flexbox direction="vertical" gap={6}>
            {!hideLegitLabelWithDate && (
              <Flexbox alignment="center" justifyContent="space-between" gap={10}>
                <Skeleton width={71} height={21} round={4} disableAspectRatio />
                <Skeleton width={20} height={15} round={4} disableAspectRatio />
              </Flexbox>
            )}
            <Skeleton width="100%" height={21} maxWidth={200} round={4} disableAspectRatio />
            {!hidePlatformLogoWithPrice && (
              <Flexbox alignment="center" gap={8}>
                <Skeleton width={20} height={20} round={4} disableAspectRatio />
                <Skeleton width={35} height={18} round={4} disableAspectRatio />
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  }
  return (
    <Flexbox direction="vertical" customStyle={{ ...customStyle, position: 'relative' }}>
      <Skeleton
        width={71}
        height={21}
        round={4}
        disableAspectRatio
        customStyle={{ position: 'absolute', top: 12, left: 12 }}
      />
      <Skeleton />
      <Flexbox direction="vertical" gap={8} customStyle={{ padding: '16px 16px 20px' }}>
        <Skeleton width="100%" maxWidth={50} height={15} round={4} disableAspectRatio />
        <Flexbox direction="vertical" gap={4}>
          <Skeleton width="100%" maxWidth={125} height={15} round={4} disableAspectRatio />
          <Skeleton width="100%" maxWidth={71} height={18} round={4} disableAspectRatio />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default LegitCardSkeleton;
