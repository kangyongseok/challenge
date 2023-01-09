import { useEffect, useState } from 'react';

import { PhotoGuideImage } from '@dto/productLegit';

function useGetImage(onSuccess: (imageUrl: string) => void) {
  const [{ imageType, isLoadingGetPhoto }, setGetPhotoState] = useState<{
    imageType: 'profile' | 'background';
    isLoadingGetPhoto: boolean;
  }>({
    imageType: 'profile',
    isLoadingGetPhoto: false
  });

  useEffect(() => {
    window.getPhotoGuide = () => {
      setGetPhotoState((prevState) => ({ ...prevState, isLoadingGetPhoto: true }));
    };

    window.getPhotoGuideDone = (photoGuideImagesData: PhotoGuideImage[]) => {
      const [firstPhotoGuideImage] = photoGuideImagesData;

      if (firstPhotoGuideImage) onSuccess(firstPhotoGuideImage.imageUrl);

      setTimeout(
        () => setGetPhotoState((prevState) => ({ ...prevState, isLoadingGetPhoto: false })),
        500
      );
    };
  }, [imageType, onSuccess]);

  return { imageType, isLoadingGetPhoto, setGetPhotoState };
}

export default useGetImage;
