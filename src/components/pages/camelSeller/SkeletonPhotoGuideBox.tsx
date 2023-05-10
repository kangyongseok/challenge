import { Skeleton } from '@mrcamelhub/camel-ui';

function SkeletonPhotoGuideBox() {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => i).map((v) => (
        <Skeleton
          key={`icon-${v}`}
          width={72}
          minWidth={72}
          height={72}
          round={8}
          disableAspectRatio
        />
      ))}
    </>
  );
}

export default SkeletonPhotoGuideBox;
