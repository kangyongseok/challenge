import { Flexbox } from 'mrcamel-ui';

import Skeleton from '@components/UI/atoms/Skeleton';

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
          width="16px"
          height="21px"
          disableAspectRatio
          customStyle={{ borderRadius: 4, marginRight: 6 }}
        />
      )}
      {(hasIcon || hasAvatar) && (
        <Skeleton
          width="20px"
          height="21px"
          disableAspectRatio
          customStyle={{ borderRadius: hasAvatar ? '50%' : 4, marginRight: 6 }}
        />
      )}
      <Skeleton
        width={`${Math.min(getRandomNumber(2), 200)}px`}
        height="21px"
        disableAspectRatio
        customStyle={{ borderRadius: 4, marginRight: 8 }}
      />
      <Skeleton width="28px" height="21px" disableAspectRatio customStyle={{ borderRadius: 4 }} />
    </Flexbox>
  );
}

export default SearchHelperBottomSheetSkeleton;
