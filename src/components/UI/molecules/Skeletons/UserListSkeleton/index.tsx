import { Flexbox, Skeleton } from '@mrcamelhub/camel-ui';

function UserListSkeleton() {
  return (
    <Flexbox alignment="center" customStyle={{ padding: '8px 16px', columnGap: 12 }}>
      <Skeleton width={52} height={52} round="50%" disableAspectRatio />
      <Flexbox customStyle={{ flex: '1 1 auto', minWidth: 0 }}>
        <Flexbox direction="vertical" gap={4}>
          <Skeleton width={40} height={20} round={8} disableAspectRatio />
          <Skeleton width={100} height={16} round={8} disableAspectRatio />
        </Flexbox>
      </Flexbox>
      <Skeleton width={70} height={36} round={8} disableAspectRatio />
    </Flexbox>
  );
}

export default UserListSkeleton;
