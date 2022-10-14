import { Skeleton } from '@components/UI/atoms';

function SkeletonPhotoGuideBox() {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => i).map((v) => (
        <Skeleton
          key={`icon-${v}`}
          width={72}
          height={72}
          disableAspectRatio
          customStyle={{ borderRadius: 8, minWidth: 72 }}
        />
      ))}
    </>
  );
}

export default SkeletonPhotoGuideBox;
