import { Box, CustomStyle, Flexbox } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

interface ProductWishesCardSkeletonProps {
  isRound?: boolean;
  customStyle?: CustomStyle;
}

function ProductWishesCardSkeleton({
  isRound = false,
  customStyle
}: ProductWishesCardSkeletonProps) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: 100 }}>
        <Skeleton isRound={isRound} />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton width="100%" maxWidth="46px" height="20px" disableAspectRatio isRound={isRound} />
        <Skeleton
          width="100%"
          maxWidth="200px"
          height="18px"
          disableAspectRatio
          isRound={isRound}
          customStyle={{ marginTop: 8 }}
        />
        <Skeleton
          width="41px"
          height="16.8px"
          disableAspectRatio
          isRound={isRound}
          customStyle={{ margin: '5px 0' }}
        />
        <Skeleton
          width="100%"
          maxWidth="120px"
          height="15px"
          disableAspectRatio
          isRound={isRound}
          customStyle={{ marginTop: 3 }}
        />
        <Flexbox gap={3}>
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="15px"
            disableAspectRatio
            isRound={isRound}
            customStyle={{ marginTop: 4 }}
          />
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="15px"
            disableAspectRatio
            isRound={isRound}
            customStyle={{ marginTop: 4 }}
          />
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

export default ProductWishesCardSkeleton;
