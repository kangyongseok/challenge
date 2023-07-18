import { Flexbox, Skeleton } from '@mrcamelhub/camel-ui';

function ChannelListSkeleton() {
  return (
    <Flexbox
      alignment="center"
      customStyle={{ padding: '12px 20px', columnGap: 12, width: '100%' }}
    >
      <Skeleton width={40} height={40} round="50%" disableAspectRatio />
      <Flexbox customStyle={{ flex: '1 1 auto', minWidth: 0 }}>
        <Flexbox direction="vertical" gap={4}>
          <Flexbox gap={4}>
            <Skeleton width={70} height={20} round={8} disableAspectRatio />
            <Skeleton width={50} height={20} round={8} disableAspectRatio />
          </Flexbox>
          <Skeleton width={170} height={16} round={8} disableAspectRatio />
        </Flexbox>
      </Flexbox>
      <Skeleton width={36} height={36} round={8} disableAspectRatio />
    </Flexbox>
  );
}

export default ChannelListSkeleton;
