import { Box, Flexbox, Skeleton } from 'mrcamel-ui';
import type { CustomStyle } from 'mrcamel-ui';

interface ProductListCardSkeletonPros {
  isRound?: boolean;
  imageSkeletonWidth?: number;
  customStyle?: CustomStyle;
}

function ProductListCardSkeleton({
  isRound = false,
  imageSkeletonWidth = 134,
  customStyle
}: ProductListCardSkeletonPros) {
  return (
    <Flexbox gap={12} customStyle={customStyle}>
      <Box customStyle={{ width: imageSkeletonWidth }}>
        <Skeleton round={isRound ? 8 : 0} />
      </Box>
      <Box customStyle={{ flex: 1 }}>
        <Skeleton
          width="100%"
          maxWidth={46}
          height={20}
          round={isRound ? 8 : 0}
          disableAspectRatio
        />
        <Skeleton
          width="100%"
          maxWidth={200}
          height={18}
          round={isRound ? 8 : 0}
          disableAspectRatio
          customStyle={{ marginTop: 8 }}
        />
        <Skeleton
          width={41}
          height={16.8}
          round={isRound ? 8 : 0}
          disableAspectRatio
          customStyle={{ margin: '5px 0' }}
        />
        <Skeleton
          width="100%"
          maxWidth={120}
          height={15}
          round={isRound ? 8 : 0}
          disableAspectRatio
          customStyle={{ marginTop: 3 }}
        />
        <Flexbox gap={3}>
          <Skeleton
            width="100%"
            maxWidth={30}
            height={15}
            round={isRound ? 8 : 0}
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
          <Skeleton
            width="100%"
            maxWidth={30}
            height={15}
            round={isRound ? 8 : 0}
            disableAspectRatio
            customStyle={{ marginTop: 4 }}
          />
        </Flexbox>
      </Box>
    </Flexbox>
  );
}

export default ProductListCardSkeleton;
