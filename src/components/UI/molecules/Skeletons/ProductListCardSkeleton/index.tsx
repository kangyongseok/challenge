import { Box, CustomStyle, Flexbox } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

interface ProductListCardSkeletonPros {
  customStyle?: CustomStyle;
}

function ProductListCardSkeleton({ customStyle }: ProductListCardSkeletonPros) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: 134 }}>
        <Skeleton />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton width="100%" maxWidth="46px" height="20px" disableAspectRatio />
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
        <Flexbox gap={3}>
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="15px"
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="15px"
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

export default ProductListCardSkeleton;
