const SERVER_IMAGE_PATH_TYPE1 = 's3.ap-northeast-2.amazonaws.com';
const SERVER_IMAGE_PATH_TYPE2 = 'mrcamel.s3.ap-northeast-2.amazonaws.com';

export const getImagePathStaticParser = (imagePath: string) => {
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

    return staticImagePath;
  }
  return '';
};
