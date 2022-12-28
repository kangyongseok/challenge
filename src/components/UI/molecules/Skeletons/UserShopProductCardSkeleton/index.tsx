import { Box, Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

interface ProductListCardSkeletonPros {
  customStyle?: CustomStyle;
}

function UserShopProductCardSkeleton({ customStyle }: ProductListCardSkeletonPros) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: 100 }}>
        <Skeleton round={8} />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton width="100%" maxWidth={46} height={20} round={8} disableAspectRatio />
        <Skeleton
          width="100%"
          maxWidth={200}
          height={18}
          disableAspectRatio
          customStyle={{ marginTop: 8 }}
        />
        <Skeleton width={41} height={16.8} disableAspectRatio customStyle={{ margin: '5px 0' }} />
        <Skeleton
          width="100%"
          maxWidth={120}
          height={15}
          disableAspectRatio
          customStyle={{ marginTop: 3 }}
        />
      </Box>
      <Skeleton width={16} height={16} disableAspectRatio />
    </Flexbox>
  );
}

export default UserShopProductCardSkeleton;
