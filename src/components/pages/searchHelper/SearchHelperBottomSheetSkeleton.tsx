import { Flexbox, Skeleton } from '@mrcamelhub/camel-ui';

import { getRandomNumber } from '@utils/common';

interface SearchHelperBottomSheetSkeletonProps {
  hasIcon?: boolean;
  hasAvatar?: boolean;
  isMulti?: boolean;
}

function SearchHelperBottomSheetSkeleton({
  hasIcon = false,
  hasAvatar = false,
  isMulti = false
}: SearchHelperBottomSheetSkeletonProps) {
  return (
    <Flexbox customStyle={{ padding: '10px 20px' }}>
      {isMulti && (
        <Skeleton
          width={16}
          height={21}
          round={4}
          disableAspectRatio
          customStyle={{ marginRight: 6 }}
        />
      )}
      {(hasIcon || hasAvatar) && (
        <Skeleton
          width={20}
          height={21}
          round={hasAvatar ? '50%' : 4}
          disableAspectRatio
          customStyle={{ marginRight: 6 }}
        />
      )}
      <Skeleton
        width={Math.min(getRandomNumber(2), 200)}
        height={21}
        round={4}
        disableAspectRatio
        customStyle={{ marginRight: 8 }}
      />
      <Skeleton width={28} height={21} round={4} disableAspectRatio />
    </Flexbox>
  );
}

export default SearchHelperBottomSheetSkeleton;
