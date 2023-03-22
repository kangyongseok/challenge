import { useEffect, useState } from 'react';

import { getProductCardImageResizePath } from '@utils/common';

function useProductImageResize(imagePath: string) {
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = getProductCardImageResizePath(imagePath);
    img.onerror = () => setImageLoadError(true);
  }, [imagePath]);

  return {
    imageLoadError
  };
}

export default useProductImageResize;
