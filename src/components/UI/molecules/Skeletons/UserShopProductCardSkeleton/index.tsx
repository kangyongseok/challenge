import { Box, CustomStyle, Flexbox } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

interface ProductListCardSkeletonPros {
  customStyle?: CustomStyle;
}

function UserShopProductCardSkeleton({ customStyle }: ProductListCardSkeletonPros) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: 100 }}>
        <Skeleton isRound />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton width="100%" maxWidth="46px" height="20px" disableAspectRatio isRound />
        <Skeleton
          width="100%"
          maxWidth="200px"
          height="18px"
          disableAspectRatio
          customStyle={{ marginTop: 8 }}
        />
        <Skeleton
          width="41px"
          height="16.8px"
          disableAspectRatio
          customStyle={{ margin: '5px 0' }}
        />
        <Skeleton
          width="100%"
          maxWidth="120px"
          height="15px"
          disableAspectRatio
          customStyle={{ marginTop: 3 }}
        />
      </Box>
      <Skeleton width="16px" height="16px" disableAspectRatio />
    </Flexbox>
  );
}

export default UserShopProductCardSkeleton;