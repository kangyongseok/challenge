import type { CustomStyle } from 'mrcamel-ui';
import { Box, Flexbox, useTheme } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

interface ProductLegitCardSkeletonProps {
  variant?: 'grid' | 'list';
  hideProductLegitLabelWithDate?: boolean;
  hidePlatformLogo?: boolean;
  hidePlatformLogoWithPrice?: boolean;
  customStyle?: CustomStyle;
}

function ProductLegitCardSkeleton({
  variant,
  hideProductLegitLabelWithDate,
  hidePlatformLogo,
  hidePlatformLogoWithPrice,
  customStyle
}: ProductLegitCardSkeletonProps) {
  const {
    theme: { box }
  } = useTheme();
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
          <Skeleton customStyle={{ borderRadius: box.round['4'] }} />
          {!hidePlatformLogo && (
            <Skeleton
              width="15px"
              height="15px"
              disableAspectRatio
              customStyle={{ position: 'absolute', top: 2, left: 2, borderRadius: box.round['4'] }}
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
            {!hideProductLegitLabelWithDate && (
              <Flexbox alignment="center" justifyContent="space-between" gap={10}>
                <Skeleton
                  width="71px"
                  height="21px"
                  disableAspectRatio
                  customStyle={{ borderRadius: box.round['4'] }}
                />
                <Skeleton width="20px" height="15px" disableAspectRatio />
              </Flexbox>
            )}
            <Skeleton width="100%" height="21px" maxWidth="200px" disableAspectRatio />
            {!hidePlatformLogoWithPrice && (
              <Flexbox alignment="center" gap={8}>
                <Skeleton
                  width="20px"
                  height="20px"
                  disableAspectRatio
                  customStyle={{ borderRadius: box.round['4'] }}
                />
                <Skeleton width="35px" height="18px" disableAspectRatio />
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
        width="71px"
        height="21px"
        disableAspectRatio
        customStyle={{ position: 'absolute', top: 12, left: 12, borderRadius: box.round['4'] }}
      />
      <Skeleton />
      <Flexbox direction="vertical" gap={8} customStyle={{ padding: '16px 16px 20px' }}>
        <Skeleton width="100%" maxWidth="50px" height="15px" disableAspectRatio />
        <Flexbox direction="vertical" gap={4}>
          <Skeleton width="100%" maxWidth="125px" height="15px" disableAspectRatio />
          <Skeleton width="100%" maxWidth="70px" height="18px" disableAspectRatio />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
}

export default ProductLegitCardSkeleton;
