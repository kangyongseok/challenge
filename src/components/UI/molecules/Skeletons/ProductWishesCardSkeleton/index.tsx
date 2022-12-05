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
        <Skeleton
          width="100%"
          maxWidth="120px"
          height="16px"
          disableAspectRatio
          isRound={isRound}
        />
        <Skeleton
          width="100%"
          maxWidth="55px"
          height="20px"
          disableAspectRatio
          isRound={isRound}
          customStyle={{ marginTop: 8 }}
        />
        <Flexbox gap={6}>
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="14px"
            disableAspectRatio
            isRound={isRound}
            customStyle={{ marginTop: 4 }}
          />
          <Skeleton
            width="100%"
            maxWidth="30px"
            height="14px"
            disableAspectRatio
            isRound={isRound}
            customStyle={{ marginTop: 4 }}
          />
        </Flexbox>
      </Box>
      <Skeleton
        width="16px"
        height="16px"
        disableAspectRatio
        customStyle={{ marginTop: 10, borderRadius: 4 }}
      />
    </Flexbox>
  );
}

export default ProductWishesCardSkeleton;
