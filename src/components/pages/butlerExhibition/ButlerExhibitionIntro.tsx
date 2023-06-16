import { Box, Image, Typography } from '@mrcamelhub/camel-ui';

import { getImageResizePath } from '@utils/common';

function ButlerExhibitionIntro() {
  return (
    <Box component="section" customStyle={{ position: 'relative' }}>
      <Image
        src={getImageResizePath({
          imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/butler/butler-crinkled-paper-texture.png`,
          w: 300
        })}
        disableAspectRatio
        alt="배경이미지"
      />
      <Box customStyle={{ position: 'absolute', top: 0, left: 0, padding: '46px 20px 53px' }}>
        <Image
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/butler/intro-typo.png`,
            w: 300
          })}
          alt="Intro Typo Img"
          disableAspectRatio
        />
        <Typography
          variant="h4"
          customStyle={{
            marginTop: 10,
            '& > span': {
              fontWeight: 700
            }
          }}
        >
          구하기 힘든 상태좋은 샤넬 가브리엘 백팩 <br />
          <span>카멜이 다 구매했습니다.</span>
        </Typography>
        <Image
          src={getImageResizePath({
            imagePath: `https://${process.env.IMAGE_DOMAIN}/assets/images/butler/best-item-in-the-world.png`,
            w: 300
          })}
          alt="Best Item Img"
          disableAspectRatio
          customStyle={{
            marginTop: 38
          }}
        />
      </Box>
    </Box>
  );
}

export default ButlerExhibitionIntro;
