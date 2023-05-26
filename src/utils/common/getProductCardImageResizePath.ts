const SERVER_IMAGE_PATH_TYPE1 = 's3.ap-northeast-2.amazonaws.com';
const SERVER_IMAGE_PATH_TYPE2 = 'mrcamel.s3.ap-northeast-2.amazonaws.com';
const RESIZE_PARAM = '?w=400&f=webp';

export const getProductCardImageResizePath = (imagePath: string, w?: number): string => {
  if (imagePath) {
    const serverPathType1 = imagePath.split('/').includes(SERVER_IMAGE_PATH_TYPE1);
    const serverPathType2 = imagePath.split('/').includes(SERVER_IMAGE_PATH_TYPE2);
    let staticImagePath = imagePath;

    if (serverPathType1) {
      staticImagePath = imagePath.replace(
        `${SERVER_IMAGE_PATH_TYPE1}/mrcamel`,
        process.env.IMAGE_DOMAIN
      );
    }

    if (serverPathType2) {
      staticImagePath = imagePath.replace(SERVER_IMAGE_PATH_TYPE2, process.env.IMAGE_DOMAIN);
    }

    if (w) return `${staticImagePath}?w=${w}&f=webp`;

    return `${staticImagePath}${RESIZE_PARAM}`;
  }
  return '';
};
