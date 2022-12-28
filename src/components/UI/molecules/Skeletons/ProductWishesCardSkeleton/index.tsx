import { Box, Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

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
        <Skeleton round={isRound ? 8 : 0} />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton
          width="100%"
          maxWidth={120}
          height={16}
          round={isRound ? 8 : 0}
          disableAspectRatio
        />
        <Skeleton
          width="100%"
          maxWidth={55}
          height={20}
          round={isRound ? 8 : 0}
          disableAspectRatio
          customStyle={{ marginTop: 8 }}
        />
        <Flexbox gap={6}>
          <Skeleton
            width="100%"
            maxWidth={30}
            height={14}
            round={isRound ? 8 : 0}
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
          <Skeleton
            width="100%"
            maxWidth={30}
            height={14}
            round={isRound ? 8 : 0}
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
        </Flexbox>
      </Box>
      <Skeleton
        width={16}
        height={16}
        round={4}
        disableAspectRatio
        customStyle={{ marginTop: 10 }}
      />
    </Flexbox>
  );
}

export default ProductWishesCardSkeleton;
